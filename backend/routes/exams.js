const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all exams
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM exams';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to get exams' });
    res.json(results);
  });
});

// Get single exam
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM exams WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to get exam' });
    if (results.length === 0) return res.status(404).json({ message: 'Exam not found' });
    res.json(results[0]);
  });
});

// Add new exam (admin)
router.post('/', (req, res) => {
  const { exam_name, subject, exam_date, last_date_to_register, fee, total_seats } = req.body;
  const sql = 'INSERT INTO exams (exam_name, subject, exam_date, last_date_to_register, fee, total_seats) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [exam_name, subject, exam_date, last_date_to_register, fee, total_seats], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to add exam' });
    res.status(201).json({ message: 'Exam added successfully' });
  });
});

module.exports = router;