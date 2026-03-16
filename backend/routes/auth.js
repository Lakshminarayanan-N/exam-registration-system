const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// Register
router.post('/register', (req, res) => {
  const { full_name, email, password, phone, date_of_birth } = req.body;

  const checkEmail = 'SELECT * FROM students WHERE email = ?';
  db.query(checkEmail, [email], (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO students (full_name, email, password, phone, date_of_birth) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [full_name, email, hashedPassword, phone, date_of_birth], (err, result) => {
      if (err) return res.status(500).json({ message: 'Registration failed' });
      res.status(201).json({ message: 'Student registered successfully' });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM students WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (results.length === 0) {
      return res.status(400).json({ message: 'Email not found' });
    }

    const student = results[0];
    const isMatch = bcrypt.compareSync(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ id: student.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token, student });
  });
});

module.exports = router;