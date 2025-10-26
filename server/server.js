import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();

// Initialize Google's Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database and create tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    
    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS mini_project_db');
    await connection.query('USE mini_project_db');
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin') DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create lesson_completions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS lesson_completions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        lesson_id VARCHAR(10) NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id),
        UNIQUE KEY unique_student_lesson (student_id, lesson_id)
      )
    `);
    
    // Create lesson_inputs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS lesson_inputs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        lesson_id VARCHAR(10) NOT NULL,
        input_field VARCHAR(100) NOT NULL,
        input_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id),
        UNIQUE KEY unique_student_lesson_field (student_id, lesson_id, input_field)
      )
    `);

    // Create test management tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        test_name VARCHAR(255) NOT NULL,
        test_code VARCHAR(10) UNIQUE NOT NULL,
        description TEXT,
        start_time DATETIME NULL,
        time_limit_minutes INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS test_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_id INT NOT NULL,
        question_text TEXT NOT NULL,
        question_order INT NOT NULL,
        word_limit INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_test_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_id INT NOT NULL,
        student_id INT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id),
        UNIQUE KEY unique_student_test (student_id, test_id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL,
        question_id INT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES student_test_submissions(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES test_questions(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE,
        phone VARCHAR(20),
        address TEXT,
        school_college VARCHAR(255),
        grade_year VARCHAR(50),
        class_teacher_name VARCHAR(255),
        interests TEXT,
        goals TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Add missing columns if they don't exist (migration)
    try {
      // Check if address column exists in student_profiles
      const [studentColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'mini_project_db' 
        AND TABLE_NAME = 'student_profiles' 
        AND COLUMN_NAME = 'address'
      `);
      
      if (studentColumns.length === 0) {
        await connection.query(`ALTER TABLE student_profiles ADD COLUMN address TEXT`);
        console.log('Added address column to student_profiles');
      }

      // Check if address column exists in teacher_profiles
      const [teacherColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'mini_project_db' 
        AND TABLE_NAME = 'teacher_profiles' 
        AND COLUMN_NAME = 'address'
      `);
      
      if (teacherColumns.length === 0) {
        await connection.query(`ALTER TABLE teacher_profiles ADD COLUMN address TEXT`);
        console.log('Added address column to teacher_profiles');
      }

      // Check if start_time column exists in tests table
      const [testColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'mini_project_db' 
        AND TABLE_NAME = 'tests' 
        AND COLUMN_NAME = 'start_time'
      `);
      
      if (testColumns.length === 0) {
        await connection.query(`ALTER TABLE tests ADD COLUMN start_time DATETIME NULL`);
        console.log('Added start_time column to tests');
      }

      // Check if attempt_deadline column exists in tests table
      const [attemptDeadlineColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'mini_project_db' 
        AND TABLE_NAME = 'tests' 
        AND COLUMN_NAME = 'attempt_deadline'
      `);
      
      if (attemptDeadlineColumns.length === 0) {
        await connection.query(`ALTER TABLE tests ADD COLUMN attempt_deadline DATETIME NULL`);
        console.log('Added attempt_deadline column to tests');
      }

      // Check if time_limit_minutes column exists in tests table
      const [timeLimitColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'mini_project_db' 
        AND TABLE_NAME = 'tests' 
        AND COLUMN_NAME = 'time_limit_minutes'
      `);
      
      if (timeLimitColumns.length === 0) {
        await connection.query(`ALTER TABLE tests ADD COLUMN time_limit_minutes INT NULL`);
        console.log('Added time_limit_minutes column to tests');
      }

      // Check if word_limit column exists in test_questions table
      const [wordLimitColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'mini_project_db' 
        AND TABLE_NAME = 'test_questions' 
        AND COLUMN_NAME = 'word_limit'
      `);
      
      if (wordLimitColumns.length === 0) {
        await connection.query(`ALTER TABLE test_questions ADD COLUMN word_limit INT NULL`);
        console.log('Added word_limit column to test_questions');
      }

      // Check if class_teacher_name column exists in student_profiles table
      const [classTeacherColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'mini_project_db' 
        AND TABLE_NAME = 'student_profiles' 
        AND COLUMN_NAME = 'class_teacher_name'
      `);
      
      if (classTeacherColumns.length === 0) {
        await connection.query(`ALTER TABLE student_profiles ADD COLUMN class_teacher_name VARCHAR(255)`);
        console.log('Added class_teacher_name column to student_profiles');
      }
    } catch (error) {
      console.log('Column migration error:', error.message);
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS teacher_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE,
        phone VARCHAR(20),
        address TEXT,
        institution VARCHAR(255),
        department VARCHAR(100),
        qualification VARCHAR(255),
        experience_years INT,
        specialization TEXT,
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create stored procedure for getting student test count
    await connection.query('DROP PROCEDURE IF EXISTS GetStudentTestCount');
    await connection.query(`
      CREATE PROCEDURE GetStudentTestCount(IN input_student_id INT)
      BEGIN
          SELECT COUNT(*) as completed_tests 
          FROM student_test_submissions 
          WHERE student_id = input_student_id;
      END
    `);

    // Create view for student test statistics
    await connection.query('DROP VIEW IF EXISTS student_test_stats');
    await connection.query(`
      CREATE VIEW student_test_stats AS
      SELECT 
          u.id as student_id,
          u.email as student_email,
          COUNT(sts.id) as completed_tests,
          COALESCE(AVG(CASE WHEN sts.id IS NOT NULL THEN 100 ELSE NULL END), 0) as completion_rate
      FROM users u
      LEFT JOIN student_test_submissions sts ON u.id = sts.student_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.email
    `);

    console.log('Database tables and procedures initialized successfully');
    
    // Check existing lesson completions
    const [completions] = await connection.query('SELECT * FROM lesson_completions');
    console.log('Existing lesson completions:', completions);
    
    connection.release();
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Initialize database on startup
initializeDatabase();

// Test database connection
pool.getConnection()
  .then(async connection => {
    console.log('Database connected successfully');
    try {
      // Check if database exists
      const [databases] = await connection.query('SHOW DATABASES');
      console.log('Available databases:', databases.map(db => db.Database));
      
      // Check if we can use the database
      await connection.query('USE mini_project_db');
      console.log('Successfully connected to mini_project_db');
      
      // Check if lesson_completions table exists
      const [tables] = await connection.query('SHOW TABLES');
      console.log('Available tables:', tables);
      
      // Check lesson_completions table structure
      try {
        const [completionsTable] = await connection.query('DESCRIBE lesson_completions');
        console.log('lesson_completions table structure:', completionsTable);
        
        // Check existing lesson completions
        const [completions] = await connection.query('SELECT * FROM lesson_completions');
        console.log('Existing lesson completions:', completions);
      } catch (error) {
        console.log('lesson_completions table does not exist, will create it');
      }
      
      // Test query to check existing users
      const [users] = await connection.query('SELECT * FROM users');
      console.log('Existing users:', users);
    } catch (error) {
      console.error('Error querying database:', error);
    }
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

// Routes
app.post('/api/signup', async (req, res) => {
  console.log('Received signup request:', req.body);
  try {
    const { email, password, role = 'student' } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be either admin or student' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    // Insert user with role
    const [result] = await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    console.log('User inserted successfully:', result);
    
    // Return user data for immediate login
    const user = {
      id: result.insertId,
      email: email,
      role: role
    };
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: user
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // Find user by email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = rows[0];
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Success: return user info (excluding password)
    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Error signing in' });
  }
});

// Lesson inputs endpoints
app.post('/api/lesson-inputs', async (req, res) => {
  try {
    const { student_id, lesson_id, input_field, input_value } = req.body;
    
    if (!student_id || !lesson_id || !input_field) {
      return res.status(400).json({ message: 'student_id, lesson_id, and input_field are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO lesson_inputs (student_id, lesson_id, input_field, input_value) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE input_value = VALUES(input_value), updated_at = CURRENT_TIMESTAMP',
      [student_id, lesson_id, input_field, input_value]
    );

    res.json({
      message: 'Lesson input saved successfully',
      id: result.insertId || result.affectedRows
    });
  } catch (error) {
    console.error('Error saving lesson input:', error);
    res.status(500).json({ message: 'Error saving lesson input' });
  }
});

app.get('/api/lesson-inputs/:student_id/:lesson_id', async (req, res) => {
  try {
    const { student_id, lesson_id } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT input_field, input_value FROM lesson_inputs WHERE student_id = ? AND lesson_id = ?',
      [student_id, lesson_id]
    );

    const inputs = {};
    rows.forEach(row => {
      inputs[row.input_field] = row.input_value;
    });

    res.json(inputs);
  } catch (error) {
    console.error('Error retrieving lesson inputs:', error);
    res.status(500).json({ message: 'Error retrieving lesson inputs' });
  }
});

// Lesson completion endpoints
app.post('/api/lesson-complete', async (req, res) => {
  try {
    const { student_id, lesson_id } = req.body;
    
    console.log('Received lesson completion request:', { student_id, lesson_id });
    
    if (!student_id || !lesson_id) {
      return res.status(400).json({ message: 'student_id and lesson_id are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO lesson_completions (student_id, lesson_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE completed_at = CURRENT_TIMESTAMP',
      [student_id, lesson_id]
    );

    console.log('Lesson completion result:', result);

    res.json({
      message: 'Lesson marked as completed',
      id: result.insertId || result.affectedRows
    });
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    res.status(500).json({ message: 'Error marking lesson as completed' });
  }
});

app.get('/api/lesson-progress/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;
    
    console.log('Fetching lesson progress for student:', student_id);
    
    const [rows] = await pool.execute(
      'SELECT lesson_id FROM lesson_completions WHERE student_id = ?',
      [student_id]
    );

    const completedLessons = rows.map(row => row.lesson_id);
    console.log('Completed lessons:', completedLessons);
    
    // Define lesson progression logic
    const lessonOrder = [
      'm1l1', 'm1l2', 'm1l3', 'm1l4',
      'm2l1', 'm2l2', 'm2l3', 'm2l4', 
      'm3l1', 'm3l2', 'm3l3', 'm3l4',
      'm4l1', 'm4l2', 'm4l3', 'm4l4'
    ];

    const progress = {};
    lessonOrder.forEach((lessonId, index) => {
      const isCompleted = completedLessons.includes(lessonId);
      const isUnlocked = index === 0 || completedLessons.includes(lessonOrder[index - 1]);
      
      // Debug logging for all lessons
      console.log(`${lessonId} Debug - isCompleted:`, isCompleted, `(in completedLessons: ${completedLessons.includes(lessonId)})`);
      
      progress[lessonId] = {
        completed: isCompleted,
        unlocked: isUnlocked,
        status: isCompleted ? 'completed' : (isUnlocked ? 'available' : 'locked')
      };
    });

    console.log('Generated progress:', progress);
    res.json(progress);
  } catch (error) {
    console.error('Error retrieving lesson progress:', error);
    res.status(500).json({ message: 'Error retrieving lesson progress' });
  }
});

const PORT = process.env.PORT || 5001; 
// Text analysis endpoint using Google's Gemini AI
app.post('/api/analyze-text', async (req, res) => {
  try {
    console.log('Received text for analysis:', req.body.text);
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text content is required' });
    }

    // Get the Gemini model (using gemini-2.5-flash for fast and efficient text processing)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('Starting grammar check...');
// Grammar and Spell Check
// Output: List of "Incorrect -> Correct" lines in Markdown format
const grammarPrompt = `
Correct grammar and spelling. 
Output each correction on a new line in the format: Incorrect -> Correct
If no errors, write: No errors found
Do not use *, -, or Markdown styling
Keep under 30 words

${text}
`;

const grammarResult = await model.generateContent(grammarPrompt, {
    maxOutputTokens: 100, 
});
const grammarResponse = await grammarResult.response;
const grammarText = grammarResponse.text().trim();

console.log('Starting content feedback...');
// Content Feedback
// Output: Bulleted list of concise notes in Markdown format
const feedbackPrompt = `
Evaluate the text for clarity, tone, and structure. 
Give 1–2 short improvement notes per aspect. 
Output format must be:
Clarity: [note 1] 
Clarity: [note 2] 
Tone: [note 1] 
Tone: [note 2] 
Structure: [note 1] 
Structure: [note 2] 
Each note max 7 words. 
Do not use *, -, or Markdown styling

${text}
`;

const feedbackResult = await model.generateContent(feedbackPrompt, {
    maxOutputTokens: 100,
});
const feedbackResponse = await feedbackResult.response;
const feedbackText = feedbackResponse.text().trim();

console.log('Starting suggestions...');
// Suggestions
// Output: Numbered list of exactly 3 suggestions in Markdown format
const suggestionsPrompt = `
List exactly 3 actionable improvements. 
Format as numbered lines (1., 2., 3.) 
Each suggestion under 10 words 
No introduction, no Markdown, no stars

${text}
`;

const suggestionResult = await model.generateContent(suggestionsPrompt, {
    maxOutputTokens: 100,
});
const suggestionsResponse = await suggestionResult.response;
const suggestionsText = suggestionsResponse.text().trim();

    res.json({
      spellAndGrammar: grammarText,
      contentFeedback: feedbackText,
      suggestions: suggestionsText
    });

  } catch (error) {
    console.error('Text analysis error with Gemini:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Error analyzing text with Gemini', error: error.message });
  }
});

// Test Management API Endpoints

// Generate unique test code
function generateTestCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new test
app.post('/api/create-test', async (req, res) => {
  const { testName, description, questions, teacherId, startTime, attemptDeadline, timeLimit } = req.body;
  
  try {
    const connection = await pool.getConnection();
    
    // Generate unique test code
    let testCode;
    let isUnique = false;
    
    while (!isUnique) {
      testCode = generateTestCode();
      const [existing] = await connection.execute(
        'SELECT id FROM tests WHERE test_code = ?',
        [testCode]
      );
      if (existing.length === 0) {
        isUnique = true;
      }
    }
    
    // Insert test
    const [testResult] = await connection.execute(
      'INSERT INTO tests (teacher_id, test_name, test_code, description, start_time, attempt_deadline, time_limit_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [teacherId, testName, testCode, description || null, startTime || null, attemptDeadline || null, timeLimit || null]
    );
    
    const testId = testResult.insertId;
    
    // Insert questions
    for (const question of questions) {
      await connection.execute(
        'INSERT INTO test_questions (test_id, question_text, question_order, word_limit) VALUES (?, ?, ?, ?)',
        [testId, question.text, question.order, question.wordLimit || null]
      );
    }
    
    connection.release();
    
    res.json({ 
      success: true, 
      testId, 
      testCode,
      message: 'Test created successfully' 
    });
    
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
});

// Get teacher's tests
app.get('/api/teacher-tests/:teacherId', async (req, res) => {
  const { teacherId } = req.params;
  
  try {
    const connection = await pool.getConnection();
    
    const [tests] = await connection.execute(`
      SELECT 
        t.*,
        COUNT(DISTINCT tq.id) as question_count,
        COUNT(DISTINCT sts.id) as submission_count
      FROM tests t
      LEFT JOIN test_questions tq ON t.id = tq.test_id
      LEFT JOIN student_test_submissions sts ON t.id = sts.test_id
      WHERE t.teacher_id = ? AND t.deleted_at IS NULL
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [teacherId]);
    
    connection.release();
    
    res.json({ tests });
    
  } catch (error) {
    console.error('Error fetching teacher tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// Validate test code
app.get('/api/validate-test-code/:testCode', async (req, res) => {
  const { testCode } = req.params;
  
  try {
    const connection = await pool.getConnection();
    
    const [tests] = await connection.execute(
      'SELECT id, test_name, start_time, attempt_deadline FROM tests WHERE test_code = ? AND deleted_at IS NULL',
      [testCode]
    );
    
    connection.release();
    
    if (tests.length > 0) {
      const test = tests[0];
      const now = new Date();
      
      // Check if test has a start time and if it's in the future
      if (test.start_time && new Date(test.start_time) > now) {
        res.json({ 
          valid: false, 
          error: `Test is not available yet. It will start on ${new Date(test.start_time).toLocaleString()}`,
          startTime: test.start_time
        });
      } 
      // Check if test has an attempt deadline and if it has passed
      else if (test.attempt_deadline && new Date(test.attempt_deadline) < now) {
        res.json({ 
          valid: false, 
          error: `Test attempt deadline has passed. The deadline was ${new Date(test.attempt_deadline).toLocaleString()}`,
          attemptDeadline: test.attempt_deadline
        });
      } else {
        res.json({ 
          valid: true, 
          test: { id: test.id, test_name: test.test_name }
        });
      }
    } else {
      res.json({ 
        valid: false, 
        error: 'Invalid or inactive test code' 
      });
    }
    
  } catch (error) {
    console.error('Error validating test code:', error);
    res.status(500).json({ error: 'Failed to validate test code' });
  }
});

// Get upcoming tests count for teacher dashboard
app.get('/api/upcoming-tests/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const connection = await pool.getConnection();
    
    const [tests] = await connection.execute(
      'SELECT COUNT(*) as count FROM tests WHERE teacher_id = ? AND deleted_at IS NULL AND start_time IS NOT NULL AND start_time > NOW()',
      [teacherId]
    );
    
    connection.release();
    
    res.json({ count: tests[0].count });
    
  } catch (error) {
    console.error('Error fetching upcoming tests:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming tests' });
  }
});

// Get test data for students
app.get('/api/test/:testCode', async (req, res) => {
  const { testCode } = req.params;
  
  try {
    const connection = await pool.getConnection();
    
    // Get test info
    const [tests] = await connection.execute(
      'SELECT * FROM tests WHERE test_code = ? AND deleted_at IS NULL',
      [testCode]
    );
    
    if (tests.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Test not found or inactive' });
    }
    
    const test = tests[0];
    const now = new Date();
    
    // Check if test has a start time and if it's in the future
    if (test.start_time && new Date(test.start_time) > now) {
      connection.release();
      return res.status(403).json({ 
        error: `Test is not available yet. It will start on ${new Date(test.start_time).toLocaleString()}`,
        startTime: test.start_time
      });
    }
    
    // Check if test has an attempt deadline and if it has passed
    if (test.attempt_deadline && new Date(test.attempt_deadline) < now) {
      connection.release();
      return res.status(403).json({ 
        error: `Test attempt deadline has passed. The deadline was ${new Date(test.attempt_deadline).toLocaleString()}`,
        attemptDeadline: test.attempt_deadline
      });
    }
    
    // Get questions
    const [questions] = await connection.execute(
      'SELECT * FROM test_questions WHERE test_id = ? ORDER BY question_order',
      [test.id]
    );
    
    connection.release();
    
    res.json({ 
      test: {
        ...test,
        questions
      }
    });
    
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
});

// Submit test answers
app.post('/api/submit-test', async (req, res) => {
  const { testId, studentId, answers } = req.body;
  
  try {
    const connection = await pool.getConnection();
    
    // Check if student already submitted this test
    const [existing] = await connection.execute(
      'SELECT id FROM student_test_submissions WHERE test_id = ? AND student_id = ?',
      [testId, studentId]
    );
    
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Test already submitted' });
    }
    
    // Create submission record
    const [submissionResult] = await connection.execute(
      'INSERT INTO student_test_submissions (test_id, student_id) VALUES (?, ?)',
      [testId, studentId]
    );
    
    const submissionId = submissionResult.insertId;
    
    // Insert answers
    for (const answer of answers) {
      await connection.execute(
        'INSERT INTO student_answers (submission_id, question_id, answer_text) VALUES (?, ?, ?)',
        [submissionId, answer.questionId, answer.answerText]
      );
    }
    
    connection.release();
    
    res.json({ 
      success: true, 
      submissionId,
      message: 'Test submitted successfully' 
    });
    
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

// Get test submissions for teachers
app.get('/api/test-submissions/:testId', async (req, res) => {
  const { testId } = req.params;
  const { teacherId } = req.query;
  
  try {
    const connection = await pool.getConnection();
    
    // Get teacher's full name if teacherId is provided
    let teacherFullName = null;
    if (teacherId) {
      const [teacher] = await connection.query(`
        SELECT tp.first_name, tp.last_name
        FROM teacher_profiles tp
        WHERE tp.user_id = ?
      `, [teacherId]);
      
      if (teacher.length > 0 && teacher[0].first_name && teacher[0].last_name) {
        teacherFullName = `${teacher[0].first_name} ${teacher[0].last_name}`;
      }
    }
    
    // Build query with optional class teacher filter
    let query = `
      SELECT 
        sts.id,
        sts.submitted_at,
        u.email as student_email,
        u.id as student_id,
        sp.first_name as student_first_name,
        sp.last_name as student_last_name,
        sp.class_teacher_name
      FROM student_test_submissions sts
      JOIN users u ON sts.student_id = u.id
      INNER JOIN student_profiles sp ON u.id = sp.user_id
      WHERE sts.test_id = ?
    `;
    
    const params = [testId];
    
    // Add class teacher filter if teacher name is available
    if (teacherFullName) {
      query += ` AND sp.class_teacher_name = ?`;
      params.push(teacherFullName);
    }
    
    query += ` ORDER BY sts.submitted_at DESC`;
    
    const [submissions] = await connection.execute(query, params);
    
    // Get answers for each submission
    for (let submission of submissions) {
      const [answers] = await connection.execute(`
        SELECT 
          sa.answer_text,
          tq.question_text,
          tq.id as question_id
        FROM student_answers sa
        JOIN test_questions tq ON sa.question_id = tq.id
        WHERE sa.submission_id = ?
        ORDER BY tq.question_order
      `, [submission.id]);
      
      submission.answers = answers;
    }
    
    connection.release();
    
    res.json({ submissions });
    
  } catch (error) {
    console.error('Error fetching test submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Delete test endpoint
app.delete('/api/delete-test/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    
    const connection = await pool.getConnection();
    
    // Soft delete by updating deleted_at timestamp
    await connection.query(
      'UPDATE tests SET deleted_at = NOW() WHERE id = ?',
      [testId]
    );
    
    connection.release();
    res.json({ success: true, message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

// Save student profile endpoint
app.post('/api/save-student-profile', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    console.log('Received student profile save request:', req.body);
    
    const {
      userId,
      email,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      address,
      schoolCollege,
      gradeYear,
      classTeacherName,
      interests,
      goals
    } = req.body;

    // Validate required fields
    if (!userId || !firstName || !lastName) {
      console.log('Missing required fields:', { userId, firstName, lastName });
      return res.status(400).json({ error: 'Missing required fields: userId, firstName, lastName' });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email already exists for another user
      const [existingEmail] = await connection.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Email already in use by another account' });
      }

      // Update email in users table
      await connection.execute(
        'UPDATE users SET email = ? WHERE id = ?',
        [email, userId]
      );
    }

    console.log('Executing database query with values:', [userId, firstName, lastName, dateOfBirth, phone, address, schoolCollege, gradeYear, classTeacherName, interests, goals]);
    
    // Start a transaction
    await connection.beginTransaction();
    
    try {
      // Insert or update student profile
      const result = await connection.query(`
        INSERT INTO student_profiles 
        (user_id, first_name, last_name, date_of_birth, phone, address, school_college, grade_year, class_teacher_name, interests, goals)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        date_of_birth = VALUES(date_of_birth),
        phone = VALUES(phone),
        address = VALUES(address),
        school_college = VALUES(school_college),
        grade_year = VALUES(grade_year),
        class_teacher_name = VALUES(class_teacher_name),
        interests = VALUES(interests),
        goals = VALUES(goals),
        updated_at = CURRENT_TIMESTAMP
      `, [userId, firstName, lastName, dateOfBirth, phone, address, schoolCollege, gradeYear, classTeacherName, interests, goals]);
      
      // Commit the transaction
      await connection.commit();
    
      console.log('Database query result:', result);
      
      res.json({ 
        success: true, 
        message: 'Student profile saved successfully',
        email: email // Return the updated email if it was changed
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error saving student profile:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to save student profile', 
      details: error.message 
    });
  } finally {
    connection.release();
  }
});

// Save teacher profile endpoint
app.post('/api/save-teacher-profile', async (req, res) => {
  try {
    console.log('Received teacher profile save request:', req.body);
    
    const {
      userId,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      address,
      institution,
      department,
      qualification,
      experienceYears,
      specialization,
      bio
    } = req.body;

    // Validate required fields
    if (!userId || !firstName || !lastName) {
      console.log('Missing required fields:', { userId, firstName, lastName });
      return res.status(400).json({ error: 'Missing required fields: userId, firstName, lastName' });
    }

    const connection = await pool.getConnection();
    
    console.log('Executing database query with values:', [userId, firstName, lastName, dateOfBirth, phone, address, institution, department, qualification, experienceYears, specialization, bio]);
    
    // Insert or update teacher profile
    const result = await connection.query(`
      INSERT INTO teacher_profiles 
      (user_id, first_name, last_name, date_of_birth, phone, address, institution, department, qualification, experience_years, specialization, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      first_name = VALUES(first_name),
      last_name = VALUES(last_name),
      date_of_birth = VALUES(date_of_birth),
      phone = VALUES(phone),
      address = VALUES(address),
      institution = VALUES(institution),
      department = VALUES(department),
      qualification = VALUES(qualification),
      experience_years = VALUES(experience_years),
      specialization = VALUES(specialization),
      bio = VALUES(bio),
      updated_at = CURRENT_TIMESTAMP
    `, [userId, firstName, lastName, dateOfBirth, phone, address, institution, department, qualification, experienceYears, specialization, bio]);
    
    console.log('Database query result:', result);
    
    connection.release();
    res.json({ success: true, message: 'Teacher profile saved successfully' });
  } catch (error) {
    console.error('Error saving teacher profile:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to save teacher profile', details: error.message });
  }
});

// Get student profile endpoint
app.get('/api/student-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    
    const [profiles] = await connection.query(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    
    connection.release();
    
    if (profiles.length === 0) {
      return res.json({ profile: null });
    }
    
    res.json({ profile: profiles[0] });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
});

// Get teacher profile endpoint
app.get('/api/teacher-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    
    const [profiles] = await connection.query(
      'SELECT * FROM teacher_profiles WHERE user_id = ?',
      [userId]
    );
    
    connection.release();
    
    if (profiles.length === 0) {
      return res.json({ profile: null });
    }
    
    res.json({ profile: profiles[0] });
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    res.status(500).json({ error: 'Failed to fetch teacher profile' });
  }
});

// Get student test completion count
app.get('/api/student-test-count/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const connection = await pool.getConnection();
    
    // Use stored procedure to get test count
    const [result] = await connection.query(
      'CALL GetStudentTestCount(?)',
      [studentId]
    );
    
    connection.release();
    
    res.json({ 
      completedTests: result[0][0].completed_tests 
    });
  } catch (error) {
    console.error('Error fetching student test count:', error);
    res.status(500).json({ error: 'Failed to fetch test count' });
  }
});

// Get student lesson completion count
app.get('/api/student-lesson-count/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'SELECT COUNT(*) as completed_lessons FROM lesson_completions WHERE student_id = ?',
      [studentId]
    );
    
    connection.release();
    
    res.json({ 
      completedLessons: result[0].completed_lessons 
    });
  } catch (error) {
    console.error('Error fetching student lesson count:', error);
    res.status(500).json({ error: 'Failed to fetch lesson count' });
  }
});

// Get upcoming tests for student dashboard
app.get('/api/upcoming-tests-student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const connection = await pool.getConnection();
    
    // Get upcoming tests that haven't been submitted by the student yet
    // Tests are considered upcoming if they have a start_time in the future OR
    // they have started but the attempt_deadline hasn't passed yet
    const [tests] = await connection.query(`
      SELECT 
        t.id,
        t.test_name,
        t.test_code,
        t.description,
        t.start_time,
        t.attempt_deadline,
        t.time_limit_minutes,
        t.created_at,
        tp.first_name as teacher_first_name,
        tp.last_name as teacher_last_name,
        u.email as teacher_email
      FROM tests t
      JOIN users u ON t.teacher_id = u.id
      LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
      LEFT JOIN student_test_submissions sts ON t.id = sts.test_id AND sts.student_id = ?
      WHERE t.deleted_at IS NULL 
        AND sts.id IS NULL
        AND (
          (t.start_time IS NOT NULL AND t.start_time > NOW()) OR
          (t.start_time IS NULL OR t.start_time <= NOW()) AND 
          (t.attempt_deadline IS NULL OR t.attempt_deadline > NOW())
        )
      ORDER BY 
        CASE 
          WHEN t.start_time IS NOT NULL AND t.start_time > NOW() THEN t.start_time
          WHEN t.attempt_deadline IS NOT NULL THEN t.attempt_deadline
          ELSE t.created_at
        END ASC
      LIMIT 10
    `, [studentId]);
    
    connection.release();
    
    res.json({ upcomingTests: tests });
    
  } catch (error) {
    console.error('Error fetching upcoming tests for student:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming tests' });
  }
});

// Get students by class teacher for reports
app.get('/api/students-by-teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const connection = await pool.getConnection();
    
    // Get teacher's full name
    const [teacher] = await connection.query(`
      SELECT tp.first_name, tp.last_name
      FROM teacher_profiles tp
      WHERE tp.user_id = ?
    `, [teacherId]);
    
    let teacherFullName = null;
    if (teacher.length > 0 && teacher[0].first_name && teacher[0].last_name) {
      teacherFullName = `${teacher[0].first_name} ${teacher[0].last_name}`;
    }
    
    // If teacher profile is not complete, return empty array
    if (!teacherFullName) {
      connection.release();
      return res.json({ students: [], message: 'Teacher profile incomplete' });
    }
    
    // Get students whose class teacher matches exactly
    const [students] = await connection.query(`
      SELECT 
        u.id,
        u.email,
        sp.first_name,
        sp.last_name,
        sp.grade_year,
        sp.school_college,
        sp.class_teacher_name,
        COUNT(DISTINCT sts.id) as total_tests
      FROM users u
      INNER JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN student_test_submissions sts ON u.id = sts.student_id
      WHERE u.role = 'student'
        AND sp.class_teacher_name = ?
      GROUP BY u.id, u.email, sp.first_name, sp.last_name, sp.grade_year, sp.school_college, sp.class_teacher_name
      ORDER BY sp.last_name, sp.first_name
    `, [teacherFullName]);
    
    connection.release();
    
    res.json({ students });
    
  } catch (error) {
    console.error('Error fetching students by teacher:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get student report details (filtered by class teacher)
app.get('/api/student-report/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { teacherId } = req.query;
    const connection = await pool.getConnection();
    
    // Get teacher's full name if provided
    let teacherFullName = null;
    if (teacherId) {
      const [teacher] = await connection.query(`
        SELECT tp.first_name, tp.last_name
        FROM teacher_profiles tp
        WHERE tp.user_id = ?
      `, [teacherId]);
      
      if (teacher.length > 0 && teacher[0].first_name && teacher[0].last_name) {
        teacherFullName = `${teacher[0].first_name} ${teacher[0].last_name}`;
      }
    }
    
    // Verify student belongs to this teacher's class
    const [studentCheck] = await connection.query(`
      SELECT sp.class_teacher_name
      FROM student_profiles sp
      WHERE sp.user_id = ?
    `, [studentId]);
    
    if (teacherFullName && studentCheck.length > 0 && 
        studentCheck[0].class_teacher_name && 
        studentCheck[0].class_teacher_name !== teacherFullName) {
      connection.release();
      return res.status(403).json({ error: 'Access denied: Student not in your class' });
    }
    
    // Get student's test submissions and performance data
    const [submissions] = await connection.query(`
      SELECT 
        t.id as test_id,
        t.test_name,
        sts.submitted_at,
        t.created_at
      FROM student_test_submissions sts
      JOIN tests t ON sts.test_id = t.id
      WHERE sts.student_id = ?
      ORDER BY sts.submitted_at DESC
    `, [studentId]);
    
    connection.release();
    
    res.json({ submissions });
    
  } catch (error) {
    console.error('Error fetching student report:', error);
    res.status(500).json({ error: 'Failed to fetch student report' });
  }
});

// Get detailed student submissions with answers and questions
app.get('/api/student-submissions/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const connection = await pool.getConnection();
    
    // Get student's test submissions with detailed information
    const [submissions] = await connection.query(`
      SELECT 
        sts.id as submission_id,
        t.id as test_id,
        t.test_name,
        t.test_code,
        t.time_limit_minutes,
        sts.submitted_at,
        t.created_at,
        COUNT(DISTINCT tq.id) as total_questions,
        COUNT(DISTINCT sa.id) as answered_questions,
        u.email as teacher_email,
        tp.first_name as teacher_first_name,
        tp.last_name as teacher_last_name
      FROM student_test_submissions sts
      JOIN tests t ON sts.test_id = t.id
      JOIN users u ON t.teacher_id = u.id
      LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
      LEFT JOIN test_questions tq ON t.id = tq.test_id
      LEFT JOIN student_answers sa ON sts.id = sa.submission_id
      WHERE sts.student_id = ?
      GROUP BY sts.id, t.id, t.test_name, t.test_code, t.time_limit_minutes, 
               sts.submitted_at, t.created_at, u.email, tp.first_name, tp.last_name
      ORDER BY sts.submitted_at DESC
    `, [studentId]);
    
    connection.release();
    
    res.json({ submissions });
    
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ error: 'Failed to fetch student submissions' });
  }
});

// Get recent submissions for ongoing tests (teacher dashboard)
app.get('/api/recent-submissions/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const connection = await pool.getConnection();
    
    // Get teacher's full name
    const [teacher] = await connection.query(`
      SELECT tp.first_name, tp.last_name
      FROM teacher_profiles tp
      WHERE tp.user_id = ?
    `, [teacherId]);
    
    let teacherFullName = null;
    if (teacher.length > 0 && teacher[0].first_name && teacher[0].last_name) {
      teacherFullName = `${teacher[0].first_name} ${teacher[0].last_name}`;
    }
    
    // Get recent submissions from ongoing tests
    // Filter by students whose class_teacher_name matches the teacher's full name
    // A test is considered ongoing if it has started and hasn't passed its attempt deadline
    
    // If teacher profile is incomplete, return empty array
    if (!teacherFullName) {
      connection.release();
      return res.json({ submissions: [] });
    }
    
    const [submissions] = await connection.query(`
      SELECT 
        sts.id as submission_id,
        sts.submitted_at,
        t.test_name,
        t.test_code,
        t.start_time,
        t.attempt_deadline,
        t.time_limit_minutes,
        u.email as student_email,
        sp.first_name as student_first_name,
        sp.last_name as student_last_name,
        sp.class_teacher_name
      FROM student_test_submissions sts
      JOIN tests t ON sts.test_id = t.id
      JOIN users u ON sts.student_id = u.id
      INNER JOIN student_profiles sp ON u.id = sp.user_id
      WHERE t.teacher_id = ?
        AND t.deleted_at IS NULL
        AND sp.class_teacher_name = ?
        AND (
          (t.start_time IS NULL OR t.start_time <= NOW()) AND
          (t.attempt_deadline IS NULL OR t.attempt_deadline >= NOW())
        )
      ORDER BY sts.submitted_at DESC
      LIMIT 20
    `, [teacherId, teacherFullName]);
    
    connection.release();
    
    res.json({ submissions });
    
  } catch (error) {
    console.error('Error fetching recent submissions:', error);
    res.status(500).json({ error: 'Failed to fetch recent submissions' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
