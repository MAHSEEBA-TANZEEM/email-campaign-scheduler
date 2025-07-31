const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  title: String,
  message: String,
  recipients: [String],
  scheduledTime: Date,
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  deliveryReport: [{ email: String, status: String }]
});

module.exports = mongoose.model('Campaign', CampaignSchema);
