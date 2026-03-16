const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const db = require('../config/db');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
router.post('/create-order', (req, res) => {
  const { amount, exam_id, student_id } = req.body;

  const options = {
    amount: amount * 100,
    currency: 'INR',
    receipt: `receipt_${exam_id}_${student_id}`
  };

  razorpay.orders.create(options, (err, order) => {
    if (err) return res.status(500).json({ message: 'Failed to create order' });
    res.json(order);
  });
});

// Verify payment and save registration
router.post('/verify', (req, res) => {
  const { student_id, exam_id, transaction_id, amount } = req.body;

  const regSql = 'INSERT INTO registrations (student_id, exam_id, status) VALUES (?, ?, "approved")';
  db.query(regSql, [student_id, exam_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Registration failed' });

    const registration_id = result.insertId;
    const paySql = 'INSERT INTO payments (registration_id, student_id, amount, payment_status, transaction_id) VALUES (?, ?, ?, "success", ?)';
    db.query(paySql, [registration_id, student_id, amount, transaction_id], (err) => {
      if (err) return res.status(500).json({ message: 'Payment save failed' });

      const admitSql = 'INSERT INTO admit_cards (registration_id, student_id, exam_id) VALUES (?, ?, ?)';
      db.query(admitSql, [registration_id, student_id, exam_id], (err) => {
        if (err) return res.status(500).json({ message: 'Admit card generation failed' });
        res.json({ message: 'Payment successful and admit card generated!' });
      });
    });
  });
});

module.exports = router;