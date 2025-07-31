const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const axios = require('axios');

const app = express();

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// GET home page
app.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3000/api/campaigns');
    const campaigns = response.data;

    campaigns.forEach(c => {
      c.scheduledTime = new Date(c.scheduledTime).toLocaleString();
    });

    res.render('home', { campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error.message);
    res.render('home', {
      campaigns: [],
      error: 'Unable to load campaigns at the moment.'
    });
  }
});

// POST route to create a campaign
app.post('/create-campaign', async (req, res) => {
  const { title, message, recipients, scheduledTime } = req.body;

  try {
    await axios.post('http://localhost:3000/api/campaigns', {
      title,
      message,
      recipients: recipients.split(',').map(r => r.trim()),
      scheduledTime
    });
    res.redirect('/');
  } catch (error) {
    console.error('Error creating campaign:', error.message);
    res.redirect('/');
  }
});

app.listen(4000, () => console.log("Frontend running on port 4000"));
