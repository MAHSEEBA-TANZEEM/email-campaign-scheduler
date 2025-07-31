// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const Campaign = require('./models/Campaign');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🔗 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Connection failed:", err.message));

// 📬 Set up Nodemailer transporter with SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,         // e.g., 'smtp.example.com'
  port: Number(process.env.SMTP_PORT), // e.g., 587
  secure: false,                       // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ✉️ Async Email Sender with Logging
async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send to ${to}:`, error.message);
  }
}

// 🛠️ Create Campaign - POST /api/campaigns
app.post('/api/campaigns', async (req, res) => {
  try {
    let { title, message, recipients, scheduledTime } = req.body;

    // Split comma-separated string
    if (typeof recipients === 'string') {
      recipients = recipients.split(',').map(r => r.trim());
    }

    const deliveryReport = [];

    for (const email of recipients) {
      try {
        await sendEmail(email, `New Campaign: ${title}`, message);
        deliveryReport.push({ email, status: 'sent' });
      } catch {
        deliveryReport.push({ email, status: 'failed' });
      }
    }

    const newCampaign = new Campaign({
      title,
      message,
      recipients,
      scheduledTime,
      deliveryReport
    });

    await newCampaign.save();
    res.status(201).json({ message: 'Campaign created successfully', campaign: newCampaign });
  } catch (error) {
    console.error('❌ Error creating campaign:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🔄 Additional Campaign Routes
app.use('/api/campaigns', require('./routes/campaignRoutes'));

// 🔔 Optional: Start your scheduler
const startEmailScheduler = require('./services/emailScheduler');
startEmailScheduler();

// 🚀 Start Express Server
app.listen(3000, () => console.log("🚀 Server running on port 3000"));
