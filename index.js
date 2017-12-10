const express = require('express');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const app = express();

app.get('/home', (req, res) => {
  // do something here
  res.send('TWITTER CHROME EXTENSION');
})

mongoose.connect(keys.mongoURI);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
