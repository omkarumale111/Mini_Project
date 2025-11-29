import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const app = express();

// Initialize Google's Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

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

    // Create AI evaluations table to cache AI-generated reports
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ai_test_evaluations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL UNIQUE,
        review_score INT NOT NULL,
        grammar_score INT NOT NULL,
        content_score INT NOT NULL,
        creativity_score INT NOT NULL,
        summary_feedback TEXT NOT NULL,
        grammar_issues TEXT NOT NULL,
        suggestions TEXT NOT NULL,
        final_remarks TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES student_test_submissions(id) ON DELETE CASCADE
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

    // Create writing_evaluations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS writing_evaluations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        student_name VARCHAR(255),
        teacher_name VARCHAR(255),
        essay_text LONGTEXT NOT NULL,
        score INT NOT NULL,
        grammatical_accuracy TEXT,
        content_quality TEXT,
        feedback_summary TEXT,
        suggestions TEXT,
        final_remarks TEXT,
        submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
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

    // Create view for student-teacher performance mapping
    await connection.query('DROP VIEW IF EXISTS student_teacher_performance');
    await connection.query(`
      CREATE VIEW student_teacher_performance AS
      SELECT 
          sts.student_id,
          t.teacher_id,
          u.email as student_email,
          sp.first_name as student_first_name,
          sp.last_name as student_last_name,
          tu.email as teacher_email,
          tp.first_name as teacher_first_name,
          tp.last_name as teacher_last_name,
          COUNT(DISTINCT sts.id) as total_tests,
          AVG(ate.review_score) as avg_overall_score,
          AVG(ate.grammar_score) as avg_grammar_score,
          AVG(ate.content_score) as avg_content_score,
          AVG(ate.creativity_score) as avg_creativity_score,
          MIN(sts.submitted_at) as first_test_date,
          MAX(sts.submitted_at) as last_test_date
      FROM student_test_submissions sts
      JOIN tests t ON sts.test_id = t.id
      JOIN users u ON sts.student_id = u.id
      JOIN users tu ON t.teacher_id = tu.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN teacher_profiles tp ON tu.id = tp.user_id
      LEFT JOIN ai_test_evaluations ate ON sts.id = ate.submission_id
      WHERE t.deleted_at IS NULL
      GROUP BY sts.student_id, t.teacher_id, u.email, sp.first_name, sp.last_name,
               tu.email, tp.first_name, tp.last_name
    `);

    console.log('Database tables, procedures, and views initialized successfully');
    
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
      'SELECT lesson_id, completed_at FROM lesson_completions WHERE student_id = ?',
      [student_id]
    );

    const completedLessons = rows.map(row => row.lesson_id);
    console.log('Completed lessons:', completedLessons);
    
    // Define lesson progression logic for writing modules
    const writingLessonOrder = [
      'm1l1', 'm1l2', 'm1l3', 'm1l4',
      'm2l1', 'm2l2', 'm2l3', 'm2l4', 
      'm3l1', 'm3l2', 'm3l3', 'm3l4',
      'm4l1', 'm4l2', 'm4l3', 'm4l4'
    ];

    // Define lesson progression logic for listening modules
    const listeningLessonOrder = [
      'L1l1', 'L1l2', 'L1l3', 'L1l4', 'L1l5', 'L1l6', 'L1l7', 'L1l8', 'L1l9', 'L1l10',
      'L2l1', 'L2l2', 'L2l3', 'L2l4', 'L2l5', 'L2l6', 'L2l7', 'L2l8', 'L2l9', 'L2l10'
    ];

    const progress = {};
    
    // Process writing lessons
    writingLessonOrder.forEach((lessonId, index) => {
      const isCompleted = completedLessons.includes(lessonId);
      const isUnlocked = index === 0 || completedLessons.includes(writingLessonOrder[index - 1]);
      
      progress[lessonId] = {
        completed: isCompleted,
        unlocked: isUnlocked,
        status: isCompleted ? 'completed' : (isUnlocked ? 'available' : 'locked'),
        completed_at: isCompleted ? rows.find(r => r.lesson_id === lessonId)?.completed_at : null
      };
    });

    // Process listening lessons
    listeningLessonOrder.forEach((lessonId, index) => {
      const isCompleted = completedLessons.includes(lessonId);
      // L1l1 is always unlocked, L2l1 unlocks after L1l10, others unlock after previous lesson
      let isUnlocked;
      if (lessonId === 'L1l1') {
        isUnlocked = true;
      } else if (lessonId === 'L2l1') {
        isUnlocked = completedLessons.includes('L1l10');
      } else {
        isUnlocked = completedLessons.includes(listeningLessonOrder[index - 1]);
      }
      
      progress[lessonId] = {
        completed: isCompleted,
        unlocked: isUnlocked,
        status: isCompleted ? 'completed' : (isUnlocked ? 'available' : 'locked'),
        completed_at: isCompleted ? rows.find(r => r.lesson_id === lessonId)?.completed_at : null
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

// Audio transcription endpoint using Google's Generative AI
app.post('/api/transcribe-audio', upload.single('audio'), async (req, res) => {
  try {
    console.log('Received transcription request');
    
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const { student_id, lesson_id, input_field } = req.body;
    const audioPath = req.file.path;

    console.log('Audio file path:', audioPath);
    console.log('Request body:', { student_id, lesson_id, input_field });

    // Read the audio file
    const audioBuffer = fs.readFileSync(audioPath);
    const base64Audio = audioBuffer.toString('base64');

    // Determine MIME type based on file extension
    const mimeType = 'audio/wav'; // Default to wav since frontend sends wav

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    console.log('Starting audio transcription with Gemini...');

    // Use Gemini's multimodal capabilities to transcribe audio
    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Audio,
        },
      },
      {
        text: 'Please transcribe this audio. Provide only the transcribed text without any additional commentary or formatting.',
      },
    ]);

    const result = await response.response;
    const transcript = result.text().trim();

    console.log('Transcription successful:', transcript);

    // Save to database if student_id and lesson_id are provided
    if (student_id && lesson_id && input_field) {
      try {
        await pool.execute(
          'INSERT INTO lesson_inputs (student_id, lesson_id, input_field, input_value) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE input_value = VALUES(input_value), updated_at = CURRENT_TIMESTAMP',
          [student_id, lesson_id, input_field, transcript]
        );
        console.log('Transcript saved to database');
      } catch (dbError) {
        console.error('Error saving transcript to database:', dbError);
        // Continue anyway - transcription was successful
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(audioPath);

    res.json({
      transcript: transcript,
      message: 'Audio transcribed successfully'
    });

  } catch (error) {
    console.error('Audio transcription error:', error.message);
    console.error('Full error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ message: 'Error transcribing audio', error: error.message });
  }
});

// Endpoint for analyzing listening comprehension (L1 specific)
app.post('/api/analyze-listening-l1', async (req, res) => {
  try {
    console.log('Received L1 listening analysis request');
    const { transcript, correctAnswer } = req.body;
    
    if (!transcript || !correctAnswer) {
      return res.status(400).json({ message: 'Transcript and correctAnswer are required' });
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const analysisPrompt = `
Compare the student's transcription with the correct answer and provide feedback.

Student's transcription: "${transcript}"
Correct answer: "${correctAnswer}"

Provide feedback in the following format:
1. Accuracy: [percentage match, e.g., "85% accurate"]
2. Missing words: [list any words that were missed, or "None"]
3. Extra words: [list any extra words added, or "None"]
4. Suggestions: [1-2 brief suggestions for improvement]

Keep the response concise and constructive.
`;

    const response = await model.generateContent(analysisPrompt, {
      maxOutputTokens: 200,
    });

    const result = await response.response;
    const feedback = result.text().trim();

    console.log('L1 listening analysis complete');

    res.json({
      feedback: feedback,
      studentTranscript: transcript,
      correctAnswer: correctAnswer
    });

  } catch (error) {
    console.error('L1 listening analysis error:', error.message);
    res.status(500).json({ message: 'Error analyzing listening response', error: error.message });
  }
});

// Comprehensive listening comprehension feedback endpoint (similar to writing evaluation)
app.post('/api/analyze-listening', async (req, res) => {
  try {
    console.log('Received comprehensive listening analysis request');
    const { transcript, studentId } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Get overall score (0-100)
    const scorePrompt = `
Evaluate this transcribed audio response and provide ONLY a numeric score from 0 to 100 based on:
- Clarity and articulation
- Grammar and vocabulary usage
- Coherence and logical flow
- Completeness of response
- Pronunciation accuracy (inferred from transcription)

Return ONLY the number, nothing else.

Transcript:
${transcript}
`;
    
    const scoreResult = await model.generateContent(scorePrompt);
    const scoreText = scoreResult.response.text().trim();
    const score = parseInt(scoreText) || 0;

    // Get pronunciation and clarity feedback
    const pronunciationPrompt = `
Analyze this transcribed audio for pronunciation and clarity. Provide feedback on:
1. Clarity of speech
2. Pace and rhythm
3. Accent or pronunciation issues (if any)
4. Overall intelligibility

Format as:
CLARITY: [assessment]
PACE: [assessment]
PRONUNCIATION: [assessment]
INTELLIGIBILITY: [assessment]

Keep each assessment to 1-2 sentences.

Transcript:
${transcript}
`;

    const pronunciationResult = await model.generateContent(pronunciationPrompt);
    const pronunciationFeedback = pronunciationResult.response.text().trim();

    // Get grammar and vocabulary evaluation
    const grammarPrompt = `
Evaluate the grammar and vocabulary in this transcribed audio response.

Provide feedback in this format:
GRAMMAR ISSUES: [list any grammar errors found, or "No significant errors"]
VOCABULARY USAGE: [assessment of vocabulary level and appropriateness]
SENTENCE STRUCTURE: [assessment of how sentences are constructed]

Transcript:
${transcript}
`;

    const grammarResult = await model.generateContent(grammarPrompt);
    const grammarFeedback = grammarResult.response.text().trim();

    // Get content quality evaluation
    const contentPrompt = `
Evaluate the content quality of this transcribed audio response. Provide assessment on:
- Relevance to the topic
- Completeness of ideas
- Logical organization
- Supporting details

Format as:
RELEVANCE: [assessment]
COMPLETENESS: [assessment]
ORGANIZATION: [assessment]
DETAILS: [assessment]

Transcript:
${transcript}
`;

    const contentResult = await model.generateContent(contentPrompt);
    const contentQuality = contentResult.response.text().trim();

    // Get strengths and areas for improvement
    const feedbackPrompt = `
Provide constructive feedback on this transcribed audio response:

STRENGTHS (what the student did well):
[List 2-3 specific strengths]

AREAS FOR IMPROVEMENT:
[List 2-3 specific areas to improve]

Transcript:
${transcript}
`;

    const feedbackResult = await model.generateContent(feedbackPrompt);
    const feedbackSummary = feedbackResult.response.text().trim();

    // Get actionable suggestions
    const suggestionsPrompt = `
Provide exactly 5 actionable suggestions to improve this listening comprehension response. Focus on:
- Listening skills
- Speaking clarity
- Grammar improvement
- Vocabulary expansion
- Response completeness

Format as:
1. [Suggestion 1]
2. [Suggestion 2]
3. [Suggestion 3]
4. [Suggestion 4]
5. [Suggestion 5]

Transcript:
${transcript}
`;

    const suggestionsResult = await model.generateContent(suggestionsPrompt);
    const suggestions = suggestionsResult.response.text().trim();

    // Get final remarks
    const remarksPrompt = `
Write a brief, encouraging closing comment (2-3 sentences) for a student based on their listening comprehension response. 
Be positive and motivating while acknowledging their effort.

Transcript:
${transcript}
`;

    const remarksResult = await model.generateContent(remarksPrompt);
    const finalRemarks = remarksResult.response.text().trim();

    console.log('Comprehensive listening analysis complete');

    res.json({
      score,
      pronunciationFeedback,
      grammarFeedback,
      contentQuality,
      feedbackSummary,
      suggestions,
      finalRemarks,
      studentTranscript: transcript,
      submissionTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Comprehensive listening analysis error:', error.message);
    res.status(500).json({ message: 'Error analyzing listening response', error: error.message });
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
        'INSERT INTO student_answers (submission_id, question_id, answer) VALUES (?, ?, ?)',
        [submissionId, answer.questionId, answer.answerText]
      );
    }
    
    connection.release();
    
    // Trigger AI evaluation asynchronously (don't wait for it)
    generateAndSaveAIEvaluation(submissionId).catch(err => {
      console.error('Error generating AI evaluation:', err);
    });
    
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
          sa.answer,
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

// Get single submission details for report
app.get('/api/submission-details/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const connection = await pool.getConnection();
    
    // Get submission with test and student details
    const [submissions] = await connection.execute(`
      SELECT 
        sts.id as submission_id,
        sts.submitted_at,
        t.id as test_id,
        t.test_name,
        t.test_code,
        t.description,
        t.time_limit_minutes,
        u.email as student_email,
        sp.first_name as student_first_name,
        sp.last_name as student_last_name,
        tu.email as teacher_email,
        tp.first_name as teacher_first_name,
        tp.last_name as teacher_last_name
      FROM student_test_submissions sts
      JOIN tests t ON sts.test_id = t.id
      JOIN users u ON sts.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      JOIN users tu ON t.teacher_id = tu.id
      LEFT JOIN teacher_profiles tp ON tu.id = tp.user_id
      WHERE sts.id = ?
    `, [submissionId]);
    
    if (submissions.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const submission = submissions[0];
    
    // Get questions and answers
    const [answers] = await connection.execute(`
      SELECT 
        tq.id as question_id,
        tq.question_text,
        tq.question_order,
        tq.word_limit,
        sa.answer
      FROM test_questions tq
      LEFT JOIN student_answers sa ON tq.id = sa.question_id AND sa.submission_id = ?
      WHERE tq.test_id = ?
      ORDER BY tq.question_order
    `, [submissionId, submission.test_id]);
    
    submission.questions_and_answers = answers;
    
    connection.release();
    
    res.json({ submission });
    
  } catch (error) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({ error: 'Failed to fetch submission details' });
  }
});

// Helper function to generate and save AI evaluation
async function generateAndSaveAIEvaluation(submissionId) {
  const connection = await pool.getConnection();
  
  try {
    // Check if evaluation already exists
    const [existingEval] = await connection.execute(
      'SELECT id FROM ai_test_evaluations WHERE submission_id = ?',
      [submissionId]
    );
    
    if (existingEval.length > 0) {
      console.log(`AI evaluation already exists for submission ${submissionId}`);
      connection.release();
      return;
    }
    
    // Get submission with all answers
    const [submissions] = await connection.execute(`
      SELECT 
        sts.id as submission_id,
        t.test_name,
        u.email as student_email,
        sp.first_name as student_first_name,
        sp.last_name as student_last_name
      FROM student_test_submissions sts
      JOIN tests t ON sts.test_id = t.id
      JOIN users u ON sts.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE sts.id = ?
    `, [submissionId]);
    
    if (submissions.length === 0) {
      connection.release();
      console.log(`Submission ${submissionId} not found`);
      return;
    }
    
    const submission = submissions[0];
    
    // Get all questions and answers
    const [answers] = await connection.execute(`
      SELECT 
        tq.question_text,
        tq.question_order,
        sa.answer
      FROM test_questions tq
      LEFT JOIN student_answers sa ON tq.id = sa.question_id AND sa.submission_id = ?
      WHERE tq.test_id = (SELECT test_id FROM student_test_submissions WHERE id = ?)
      ORDER BY tq.question_order
    `, [submissionId, submissionId]);
    
    // Don't release connection yet - we'll need it later for saving
    
    // Combine all answers into one text for evaluation
    const combinedText = answers.map((qa, index) => 
      `Question ${index + 1}: ${qa.question_text}\nAnswer: ${qa.answer || 'No answer provided'}`
    ).join('\n\n');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // OPTIMIZED: Single AI call instead of 8 separate calls
    const combinedPrompt = `
Evaluate this student's test submission and provide a comprehensive analysis in the following EXACT format:

REVIEW_SCORE: [number 0-100]
GRAMMAR_SCORE: [number 0-10]
CONTENT_SCORE: [number 0-10]
CREATIVITY_SCORE: [number 0-10]

SUMMARY_FEEDBACK:
[2-3 sentences providing overall assessment, be encouraging but honest]

GRAMMAR_ISSUES:
[Analyze grammar, spelling, and language errors. For each error use this format:
EXCERPT: [incorrect text, max 10 words]
ERROR_TYPE: [type of error]
CORRECTION: [corrected text]
---
If no errors, write: "No significant errors found."
Limit to maximum 8 most important errors.]

SUGGESTIONS:
1. [Specific actionable suggestion]
2. [Specific actionable suggestion]
3. [Specific actionable suggestion]
4. [Specific actionable suggestion]
5. [Specific actionable suggestion]

FINAL_REMARKS:
[2-3 encouraging sentences acknowledging effort and motivating improvement]

Student's Test Submission:
${combinedText}
`;
    
    console.log(`Generating AI evaluation for submission ${submissionId}...`);
    const result = await model.generateContent(combinedPrompt);
    const responseText = result.response.text().trim();
    
    // Parse the response
    const reviewScore = parseInt(responseText.match(/REVIEW_SCORE:\s*(\d+)/)?.[1] || '0');
    const grammarScore = parseInt(responseText.match(/GRAMMAR_SCORE:\s*(\d+)/)?.[1] || '0');
    const contentScore = parseInt(responseText.match(/CONTENT_SCORE:\s*(\d+)/)?.[1] || '0');
    const creativityScore = parseInt(responseText.match(/CREATIVITY_SCORE:\s*(\d+)/)?.[1] || '0');
    
    const summaryFeedback = responseText.match(/SUMMARY_FEEDBACK:\s*([\s\S]*?)(?=GRAMMAR_ISSUES:|$)/)?.[1]?.trim() || 'No feedback available';
    const grammarIssues = responseText.match(/GRAMMAR_ISSUES:\s*([\s\S]*?)(?=SUGGESTIONS:|$)/)?.[1]?.trim() || 'No significant errors found.';
    const suggestions = responseText.match(/SUGGESTIONS:\s*([\s\S]*?)(?=FINAL_REMARKS:|$)/)?.[1]?.trim() || '1. Continue practicing';
    const finalRemarks = responseText.match(/FINAL_REMARKS:\s*([\s\S]*?)$/)?.[1]?.trim() || 'Keep up the good work!';
    
    // Save evaluation to database
    await connection.execute(
      `INSERT INTO ai_test_evaluations 
       (submission_id, review_score, grammar_score, content_score, creativity_score, 
        summary_feedback, grammar_issues, suggestions, final_remarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [submissionId, reviewScore, grammarScore, contentScore, creativityScore,
       summaryFeedback, grammarIssues, suggestions, finalRemarks]
    );
    
    connection.release();
    console.log(`AI evaluation generated and saved for submission ${submissionId}`);
    
  } catch (error) {
    console.error('Error generating AI evaluation:', error);
    try {
      connection.release();
    } catch (releaseError) {
      // Connection might already be released
    }
  }
}

// AI Test Evaluation Endpoint - Check cache first
app.post('/api/evaluate-test-submission', async (req, res) => {
  try {
    const { submissionId } = req.body;
    
    if (!submissionId) {
      return res.status(400).json({ error: 'Submission ID is required' });
    }

    const connection = await pool.getConnection();
    
    // Check if evaluation exists in cache
    const [cachedEval] = await connection.execute(
      'SELECT * FROM ai_test_evaluations WHERE submission_id = ?',
      [submissionId]
    );
    
    if (cachedEval.length > 0) {
      // Return cached evaluation
      connection.release();
      return res.json({
        evaluation: {
          reviewScore: cachedEval[0].review_score,
          grammarScore: cachedEval[0].grammar_score,
          contentScore: cachedEval[0].content_score,
          creativityScore: cachedEval[0].creativity_score,
          summaryFeedback: cachedEval[0].summary_feedback,
          grammarIssues: cachedEval[0].grammar_issues,
          suggestions: cachedEval[0].suggestions,
          finalRemarks: cachedEval[0].final_remarks
        },
        cached: true
      });
    }
    
    connection.release();
    
    // If not cached, trigger generation and return pending status
    generateAndSaveAIEvaluation(submissionId).catch(err => {
      console.error('Error generating AI evaluation:', err);
    });
    
    res.json({ 
      message: 'Evaluation is being generated. Please try again in a moment.',
      pending: true 
    });
    
  } catch (error) {
    console.error('Test evaluation error:', error);
    res.status(500).json({ error: 'Failed to evaluate test submission', details: error.message });
  }
});

// Writing Evaluation API Endpoint
app.post('/api/evaluate-writing', async (req, res) => {
  try {
    const { text, studentName, teacherName, studentId } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text content is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Get overall score (0-100)
    const scorePrompt = `
Evaluate this essay and provide ONLY a numeric score from 0 to 100 based on:
- Writing quality (grammar, vocabulary, sentence structure)
- Clarity and coherence
- Content relevance and depth
- Organization and structure

Return ONLY the number, nothing else.

Essay:
${text}
`;
    
    const scoreResult = await model.generateContent(scorePrompt);
    const scoreText = scoreResult.response.text().trim();
    const score = parseInt(scoreText) || 0;

    // Get grammatical errors and corrections
    const grammarPrompt = `
Analyze this text for grammatical errors. For each error found, provide:
1. The incorrect phrase/sentence
2. The correction
3. Brief explanation

Format each error as:
ERROR: [incorrect text]
CORRECTION: [corrected text]
EXPLANATION: [brief explanation]

If no errors, write: "No grammatical errors found."

Text:
${text}
`;

    const grammarResult = await model.generateContent(grammarPrompt);
    const grammarText = grammarResult.response.text().trim();

    // Get content quality evaluation
    const contentPrompt = `
Evaluate this essay's content quality. Provide a brief assessment (2-3 sentences) covering:
- Coherence and logical flow
- Structure and organization
- Originality and depth of ideas

Text:
${text}
`;

    const contentResult = await model.generateContent(contentPrompt);
    const contentQuality = contentResult.response.text().trim();

    // Get feedback summary
    const feedbackPrompt = `
Provide feedback on this essay in two parts:

STRENGTHS (what the student did well):
[List 2-3 specific strengths]

AREAS FOR IMPROVEMENT:
[List 2-3 specific areas to improve]

Text:
${text}
`;

    const feedbackResult = await model.generateContent(feedbackPrompt);
    const feedbackSummary = feedbackResult.response.text().trim();

    // Get detailed suggestions
    const suggestionsPrompt = `
Provide exactly 5 actionable suggestions to improve this essay. Focus on:
- Clarity and precision
- Tone and style
- Structure and organization
- Vocabulary enhancement
- Argument strength

Format as:
1. [Suggestion 1]
2. [Suggestion 2]
3. [Suggestion 3]
4. [Suggestion 4]
5. [Suggestion 5]

Text:
${text}
`;

    const suggestionsResult = await model.generateContent(suggestionsPrompt);
    const suggestions = suggestionsResult.response.text().trim();

    // Get final remarks
    const remarksPrompt = `
Write a brief, encouraging closing comment (2-3 sentences) for a student based on their essay. 
Be positive and motivating while acknowledging their effort.

Text:
${text}
`;

    const remarksResult = await model.generateContent(remarksPrompt);
    const finalRemarks = remarksResult.response.text().trim();

    // Save to database if studentId is provided
    let evaluationId = null;
    if (studentId) {
      const connection = await pool.getConnection();
      try {
        const [result] = await connection.execute(
          `INSERT INTO writing_evaluations 
          (student_id, student_name, teacher_name, essay_text, score, grammatical_accuracy, 
           content_quality, feedback_summary, suggestions, final_remarks)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [studentId, studentName, teacherName, text, score, grammarText, 
           contentQuality, feedbackSummary, suggestions, finalRemarks]
        );
        evaluationId = result.insertId;
      } finally {
        connection.release();
      }
    }

    res.json({
      evaluationId,
      score,
      grammaticalAccuracy: grammarText,
      contentQuality,
      feedbackSummary,
      suggestions,
      finalRemarks,
      studentName: studentName || 'Student',
      teacherName: teacherName || 'Teacher',
      submissionTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Writing evaluation error:', error);
    res.status(500).json({ message: 'Error evaluating writing', error: error.message });
  }
});

// ============================================================================
// STUDENT-TEACHER MAPPING & PERFORMANCE TRACKING ENDPOINTS
// ============================================================================

// Get all students for a teacher with average performance
app.get('/api/teacher/:teacherId/students', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Use the student_teacher_performance view
      const [students] = await connection.query(`
        SELECT 
          student_id,
          student_email,
          student_first_name,
          student_last_name,
          total_tests,
          ROUND(avg_overall_score, 1) as avg_overall_score,
          ROUND(avg_grammar_score, 1) as avg_grammar_score,
          ROUND(avg_content_score, 1) as avg_content_score,
          ROUND(avg_creativity_score, 1) as avg_creativity_score,
          first_test_date,
          last_test_date
        FROM student_teacher_performance
        WHERE teacher_id = ?
        ORDER BY avg_overall_score DESC, student_last_name, student_first_name
      `, [teacherId]);
      
      // Also get additional student info
      const studentsWithDetails = await Promise.all(students.map(async (student) => {
        const [profileData] = await connection.query(`
          SELECT school_college, grade_year
          FROM student_profiles
          WHERE user_id = ?
        `, [student.student_id]);
        
        return {
          studentId: student.student_id,
          email: student.student_email,
          firstName: student.student_first_name || 'N/A',
          lastName: student.student_last_name || 'N/A',
          schoolCollege: profileData[0]?.school_college || 'N/A',
          gradeYear: profileData[0]?.grade_year || 'N/A',
          totalTests: student.total_tests,
          avgOverallScore: student.avg_overall_score,
          avgGrammarScore: student.avg_grammar_score,
          avgContentScore: student.avg_content_score,
          avgCreativityScore: student.avg_creativity_score,
          firstTestDate: student.first_test_date,
          lastTestDate: student.last_test_date
        };
      }));
      
      res.json({
        students: studentsWithDetails,
        totalStudents: studentsWithDetails.length
      });
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

// Get detailed performance for a specific student under a teacher
app.get('/api/teacher/:teacherId/student/:studentId/performance', async (req, res) => {
  try {
    const { teacherId, studentId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Get student info
      const [studentInfo] = await connection.query(`
        SELECT u.id, u.email, sp.first_name, sp.last_name,
               sp.school_college, sp.grade_year
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.id = ?
      `, [studentId]);
      
      if (studentInfo.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      // Get teacher info
      const [teacherInfo] = await connection.query(`
        SELECT u.id, u.email, tp.first_name, tp.last_name
        FROM users u
        LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
        WHERE u.id = ?
      `, [teacherId]);
      
      // Get overall statistics from view
      const [overallStats] = await connection.query(`
        SELECT 
          total_tests,
          ROUND(avg_overall_score, 1) as avg_overall_score,
          ROUND(avg_grammar_score, 1) as avg_grammar_score,
          ROUND(avg_content_score, 1) as avg_content_score,
          ROUND(avg_creativity_score, 1) as avg_creativity_score,
          first_test_date,
          last_test_date
        FROM student_teacher_performance
        WHERE student_id = ? AND teacher_id = ?
      `, [studentId, teacherId]);
      
      // Get individual test results
      const [individualTests] = await connection.query(`
        SELECT 
          sts.id as submission_id,
          sts.submitted_at,
          t.test_name,
          t.test_code,
          ate.review_score,
          ate.grammar_score,
          ate.content_score,
          ate.creativity_score
        FROM student_test_submissions sts
        JOIN tests t ON sts.test_id = t.id
        LEFT JOIN ai_test_evaluations ate ON sts.id = ate.submission_id
        WHERE sts.student_id = ?
          AND t.teacher_id = ?
          AND t.deleted_at IS NULL
        ORDER BY sts.submitted_at DESC
      `, [studentId, teacherId]);
      
      // Calculate trends
      let trends = {
        improvement: 0,
        strongestArea: 'N/A',
        weakestArea: 'N/A',
        consistency: 0
      };
      
      if (individualTests.length >= 2) {
        const firstScore = individualTests[individualTests.length - 1].review_score || 0;
        const lastScore = individualTests[0].review_score || 0;
        trends.improvement = ((lastScore - firstScore) / (firstScore || 1) * 100).toFixed(1);
        
        // Calculate consistency (standard deviation)
        const scores = individualTests.map(t => t.review_score || 0);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const stdDev = Math.sqrt(variance);
        trends.consistency = Math.max(0, 100 - stdDev).toFixed(1);
      }
      
      if (overallStats.length > 0) {
        const stats = overallStats[0];
        const areas = {
          grammar: stats.avg_grammar_score || 0,
          content: stats.avg_content_score || 0,
          creativity: stats.avg_creativity_score || 0
        };
        
        trends.strongestArea = Object.keys(areas).reduce((a, b) => areas[a] > areas[b] ? a : b);
        trends.weakestArea = Object.keys(areas).reduce((a, b) => areas[a] < areas[b] ? a : b);
      }
      
      res.json({
        studentInfo: {
          id: studentInfo[0].id,
          email: studentInfo[0].email,
          firstName: studentInfo[0].first_name || 'N/A',
          lastName: studentInfo[0].last_name || 'N/A',
          schoolCollege: studentInfo[0].school_college || 'N/A',
          gradeYear: studentInfo[0].grade_year || 'N/A'
        },
        teacherInfo: {
          id: teacherInfo[0]?.id,
          email: teacherInfo[0]?.email,
          firstName: teacherInfo[0]?.first_name || 'N/A',
          lastName: teacherInfo[0]?.last_name || 'N/A'
        },
        overallStats: overallStats.length > 0 ? {
          avgOverallScore: overallStats[0].avg_overall_score,
          avgGrammarScore: overallStats[0].avg_grammar_score,
          avgContentScore: overallStats[0].avg_content_score,
          avgCreativityScore: overallStats[0].avg_creativity_score,
          totalTests: overallStats[0].total_tests,
          firstTestDate: overallStats[0].first_test_date,
          lastTestDate: overallStats[0].last_test_date
        } : null,
        individualTests: individualTests.map(test => ({
          submissionId: test.submission_id,
          testName: test.test_name,
          testCode: test.test_code,
          submittedAt: test.submitted_at,
          reviewScore: test.review_score,
          grammarScore: test.grammar_score,
          contentScore: test.content_score,
          creativityScore: test.creativity_score
        })),
        trends
      });
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching student performance:', error);
    res.status(500).json({ message: 'Error fetching performance data', error: error.message });
  }
});

// Get teacher's student statistics summary
app.get('/api/teacher/:teacherId/statistics', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Get all students and their scores
      const [students] = await connection.query(`
        SELECT 
          student_id,
          student_first_name,
          student_last_name,
          total_tests,
          ROUND(avg_overall_score, 1) as avg_score
        FROM student_teacher_performance
        WHERE teacher_id = ?
      `, [teacherId]);
      
      // Calculate statistics
      const totalStudents = students.length;
      const totalTestsGiven = students.reduce((sum, s) => sum + s.total_tests, 0);
      const averageClassScore = students.length > 0
        ? (students.reduce((sum, s) => sum + (s.avg_score || 0), 0) / students.length).toFixed(1)
        : 0;
      
      // Top performers (top 5)
      const topPerformers = students
        .filter(s => s.avg_score !== null)
        .sort((a, b) => b.avg_score - a.avg_score)
        .slice(0, 5)
        .map(s => ({
          studentId: s.student_id,
          name: `${s.student_first_name || ''} ${s.student_last_name || ''}`.trim() || 'N/A',
          avgScore: s.avg_score
        }));
      
      // Students needing attention (bottom 5 with scores below 60)
      const needsAttention = students
        .filter(s => s.avg_score !== null && s.avg_score < 60)
        .sort((a, b) => a.avg_score - b.avg_score)
        .slice(0, 5)
        .map(s => ({
          studentId: s.student_id,
          name: `${s.student_first_name || ''} ${s.student_last_name || ''}`.trim() || 'N/A',
          avgScore: s.avg_score
        }));
      
      // Score distribution
      const scoreDistribution = {
        excellent: students.filter(s => s.avg_score >= 90).length,
        good: students.filter(s => s.avg_score >= 75 && s.avg_score < 90).length,
        average: students.filter(s => s.avg_score >= 60 && s.avg_score < 75).length,
        needsWork: students.filter(s => s.avg_score < 60).length
      };
      
      res.json({
        totalStudents,
        totalTestsGiven,
        averageClassScore: parseFloat(averageClassScore),
        topPerformers,
        needsAttention,
        scoreDistribution
      });
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching teacher statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
