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

const mainSchema = new Schema({
  handle: 'string',
  text: [],
  images: [],
  text_images: []
});

mongoose.model('tweets',tweetSchema);
mongoose.model('handles',handleSchema);
mongoose.model('main',mainSchema);
