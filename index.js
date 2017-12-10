const express = require('express');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const app = express();
require('./models/model');
require('./routes/routes')(app);

app.get('/', (req, res) => {
  res.send('TWITTER CHROME EXTENSION SERVER');
})

mongoose.connect(keys.mongoURI);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
