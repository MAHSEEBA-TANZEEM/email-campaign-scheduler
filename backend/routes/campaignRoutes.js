const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');

// 🔧 Create Campaign
router.post('/', async (req, res) => {
  try {
    const { title, message, recipients, scheduledTime } = req.body;
    const campaign = await Campaign.create({ title, message, recipients, scheduledTime });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📋 List Campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ scheduledTime: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving campaigns' });
  }
});

// 🗑️ Delete Campaign by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCampaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!deletedCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ message: 'Campaign deleted successfully', campaign: deletedCampaign });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting campaign' });
  }
});

module.exports = router;
