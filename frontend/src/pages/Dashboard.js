import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const studentData = localStorage.getItem('student');
    if (!studentData) {
      navigate('/');
    } else {
      setStudent(JSON.parse(studentData));
    }
    axios.get(' https://exam-registration-system-01z9.onrender.com/api/exams')
      .then(res => setExams(res.data))
      .catch(err => console.log(err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    navigate('/');
  };

  const handlePayment = async (exam) => {
    try {
      const orderRes = await axios.post(' https://exam-registration-system-01z9.onrender.com/api/payments/create-order', {
        amount: exam.fee,
        exam_id: exam.id,
        student_id: student.id
      });

      const order = orderRes.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Exam Registration System',
        description: exam.exam_name,
        order_id: order.id,
        handler: async (response) => {
          await axios.post(' https://exam-registration-system-01z9.onrender.com/api/payments/verify', {
            student_id: student.id,
            exam_id: exam.id,
            transaction_id: response.razorpay_payment_id,
            amount: exam.fee
          });
          alert('Payment successful! Your admit card has been generated.');
        },
        prefill: {
          name: student.full_name,
          email: student.email,
          contact: student.phone
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Welcome, {student?.full_name}!</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>
      <h3>Available Exams</h3>
      {exams.length === 0 ? (
        <p>No exams available at the moment.</p>
      ) : (
        exams.map(exam => (
          <div key={exam.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
            <h4>{exam.exam_name}</h4>
            <p>Subject: {exam.subject}</p>
            <p>Date: {exam.exam_date}</p>
            <p>Fee: ₹{exam.fee}</p>
            <p>Last date to register: {exam.last_date_to_register}</p>
            <button onClick={() => handlePayment(exam)} style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Pay & Register</button>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;