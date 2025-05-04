import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();

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
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
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
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
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
      user: { id: user.id, email: user.email }
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

const PORT = process.env.PORT || 5001; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
