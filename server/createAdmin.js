import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const adminEmail = 'admin@writeedge.com';
    const adminPassword = 'admin123'; // In a real app, use a more secure password
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Insert admin user
    const [result] = await connection.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE email = email',
      [adminEmail, hashedPassword, 'admin']
    );
    
    if (result.affectedRows > 0) {
      console.log('Admin user created/updated successfully!');
      console.log('Email:', adminEmail);
      console.log('Password: admin123');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await connection.end();
  }
}

createAdmin();
