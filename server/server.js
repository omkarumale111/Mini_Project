import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { CohereClient } from 'cohere-ai';

dotenv.config();

const app = express();

// Initialize Cohere
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        answer_text TEXT,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES student_test_submissions(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES test_questions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_submission_question (submission_id, question_id)
      )
    `);
    
    console.log('Database tables initialized successfully');
    
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
    
    res.status(201).json({ message: 'User created successfully' });
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

// Add problem statement endpoint
app.post('/api/problem-statements', async (req, res) => {
  try {
    const { userId, content } = req.body;
    
    if (!userId || !content) {
      return res.status(400).json({ message: 'User ID and content are required' });
    }

    // Insert problem statement
    const [result] = await pool.query(
      'INSERT INTO problem_statements (user_id, content) VALUES (?, ?)',
      [userId, content]
    );

    res.status(201).json({ 
      message: 'Problem statement saved successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error saving problem statement:', error);
    res.status(500).json({ message: 'Error saving problem statement' });
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
// Text analysis endpoint
app.post('/api/analyze-text', async (req, res) => {
  try {
    console.log('Received text for analysis:', req.body.text);
    console.log('Using OpenAI API Key:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text content is required' });
    }

    console.log('Starting grammar check...');
    // Grammar and Spell Check
    const grammarResponse = await cohere.generate({
      prompt: `Correct grammar and spelling. Output only the Incorrected words or phrases and thier correct form:\n\n${text}`,
      maxTokens: 60,
      temperature: 0
    });    

    console.log('Starting content feedback...');
    // Content Feedback
    const feedbackResponse = await cohere.generate({
      prompt: `Evaluate clarity, tone, and structure. Give 1–2 concise improvement notes per aspect:\n\n${text}`,
      maxTokens: 60,
      temperature: 0
    });
    

    console.log('Starting suggestions...');
    // Suggestions
    const suggestionsResponse = await cohere.generate({
      prompt: `List exactly 3 actionable ways to improve this text (no intro):\n\n${text}`,
      maxTokens: 60,
      temperature: 0
    });
    

    res.json({
      spellAndGrammar: grammarResponse.generations[0].text.replace(/^Here is an analysis of the text provided:\s*/i, '').trim(),
      contentFeedback: feedbackResponse.generations[0].text.replace(/^Here is an analysis of the text provided:\s*/i, '').trim(),
      suggestions: suggestionsResponse.generations[0].text.replace(/^Here is an analysis of the text provided:\s*/i, '').trim()
    });

  } catch (error) {
    console.error('Text analysis error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Error analyzing text' });
  }
});

// Test Management API Endpoints

// Generate unique test code
function generateTestCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new test
app.post('/api/create-test', async (req, res) => {
  const { testName, description, questions, teacherId } = req.body;
  
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
      'INSERT INTO tests (teacher_id, test_name, test_code, description) VALUES (?, ?, ?, ?)',
      [teacherId, testName, testCode, description || null]
    );
    
    const testId = testResult.insertId;
    
    // Insert questions
    for (const question of questions) {
      await connection.execute(
        'INSERT INTO test_questions (test_id, question_text, question_order) VALUES (?, ?, ?)',
        [testId, question.text, question.order]
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
      WHERE t.teacher_id = ? AND t.is_active = 1
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
      'SELECT id, test_name FROM tests WHERE test_code = ? AND is_active = 1',
      [testCode]
    );
    
    connection.release();
    
    if (tests.length > 0) {
      res.json({ 
        valid: true, 
        test: tests[0] 
      });
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

// Get test data for students
app.get('/api/test/:testCode', async (req, res) => {
  const { testCode } = req.params;
  
  try {
    const connection = await pool.getConnection();
    
    // Get test info
    const [tests] = await connection.execute(
      'SELECT * FROM tests WHERE test_code = ? AND is_active = 1',
      [testCode]
    );
    
    if (tests.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Test not found or inactive' });
    }
    
    const test = tests[0];
    
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
  
  try {
    const connection = await pool.getConnection();
    
    const [submissions] = await connection.execute(`
      SELECT 
        sts.id,
        sts.submitted_at,
        u.email as student_email,
        u.id as student_id
      FROM student_test_submissions sts
      JOIN users u ON sts.student_id = u.id
      WHERE sts.test_id = ?
      ORDER BY sts.submitted_at DESC
    `, [testId]);
    
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

// Delete test
app.delete('/api/delete-test/:testId', async (req, res) => {
  const { testId } = req.params;
  
  try {
    const connection = await pool.getConnection();
    
    // Set test as inactive instead of deleting (to preserve data integrity)
    await connection.execute(
      'UPDATE tests SET is_active = 0 WHERE id = ?',
      [testId]
    );
    
    connection.release();
    
    res.json({ 
      success: true, 
      message: 'Test deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
