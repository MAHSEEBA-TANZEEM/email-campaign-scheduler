const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Campaign = require('../models/Campaign');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function startEmailScheduler() {
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const campaigns = await Campaign.find({
      scheduledTime: { $lte: now },
      status: 'pending'
    });

    for (const campaign of campaigns) {
      let deliveryReport = [];

      for (const recipient of campaign.recipients) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: recipient,
            subject: campaign.title,
            html: campaign.message
          });
          deliveryReport.push({ email: recipient, status: 'success' });
        } catch (err) {
          deliveryReport.push({ email: recipient, status: 'failed' });
        }
      }

      campaign.status = 'sent';
      campaign.deliveryReport = deliveryReport;
      await campaign.save();
    }
  });
}

module.exports = startEmailScheduler;
