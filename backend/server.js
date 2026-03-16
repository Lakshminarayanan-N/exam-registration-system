const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');
const paymentRoutes = require('./routes/payments');
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/payments', paymentRoutes);
app.get('/', (req, res) => {
  res.send('Exam Registration API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});