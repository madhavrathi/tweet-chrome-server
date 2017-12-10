const mongoose = require('mongoose');
const {Schema} = mongoose;

const tweetSchema = new Schema({
  text: Object,
  images: Object,
  text_images: Object
});

mongoose.model('tweets',tweetSchema);
