const mongoose = require('mongoose');
const {Schema} = mongoose;

const tweetSchema = new Schema({
  text: [],
  images: [],
  text_images: []
});

const handleSchema = new Schema({
  handles: []
});

mongoose.model('tweets',tweetSchema);
mongoose.model('handles',handleSchema);
