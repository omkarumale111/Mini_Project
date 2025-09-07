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
      
      // Test query to check table structure
      const [rows] = await connection.query('DESCRIBE users');
      console.log('Users table structure:', rows);
      
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

// Create users table if not exists
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // First create the users table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'student') DEFAULT 'student' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS WEQ1 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();

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

// Add WEQ1 submission endpoint
app.post('/api/weq1', async (req, res) => {
  try {
    const { userId, content } = req.body;
    
    if (!userId || !content) {
      return res.status(400).json({ message: 'User ID and content are required' });
    }

    // Insert into WEQ1 table
    const [result] = await pool.query(
      'INSERT INTO WEQ1 (user_id, content) VALUES (?, ?)',
      [userId, content]
    );

    res.status(201).json({ 
      message: 'WEQ1 submission saved successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error saving WEQ1 submission:', error);
    res.status(500).json({ message: 'Error saving submission' });
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
    
    if (!student_id || !lesson_id) {
      return res.status(400).json({ message: 'student_id and lesson_id are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO lesson_completions (student_id, lesson_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE completed_at = CURRENT_TIMESTAMP',
      [student_id, lesson_id]
    );

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
    
    const [rows] = await pool.execute(
      'SELECT lesson_id FROM lesson_completions WHERE student_id = ?',
      [student_id]
    );

    const completedLessons = rows.map(row => row.lesson_id);
    
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
      
      progress[lessonId] = {
        completed: isCompleted,
        unlocked: isUnlocked,
        status: isCompleted ? 'completed' : (isUnlocked ? 'available' : 'locked')
      };
    });

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
      prompt: `Identify the grammatical errors and spelling errors in a short and concise manner:\n\nText: ${text}`,
      maxTokens: 150,
      temperature: 0.3,
    });

    console.log('Starting content feedback...');
    // Content Feedback
    const feedbackResponse = await cohere.generate({
      prompt: `Analyze the following text and provide detailed feedback on content strength, clarity, organization, and overall impact:\n\nText: ${text}`,
      maxTokens: 150,
      temperature: 0.3,
    });

    console.log('Starting suggestions...');
    // Suggestions
    const suggestionsResponse = await cohere.generate({
      prompt: `Provide specific, actionable suggestions for improving the following text, focusing on style, structure, and engagement:\n\nText: ${text}`,
      maxTokens: 150,
      temperature: 0.3,
    });

    res.json({
      spellAndGrammar: grammarResponse.generations[0].text,
      contentFeedback: feedbackResponse.generations[0].text,
      suggestions: suggestionsResponse.generations[0].text
    });

  } catch (error) {
    console.error('Text analysis error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Error analyzing text' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
