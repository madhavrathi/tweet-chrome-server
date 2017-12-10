var Twitter = require('twitter');
const mongoose = require('mongoose');
const keys = require('../config/keys');

const Tweets = mongoose.model('tweets');
const Handles = mongoose.model('handles');

var client = new Twitter({
  consumer_key: keys.consumer_key,
  consumer_secret: keys.consumer_secret,
  access_token_key: keys.access_token_key,
  access_token_secret: keys.access_token_secret
});

//Assingning Tweets from existing DB
var existing_tweets = [],text=[],image=[],text_image=[];
Tweets.find({}, (err, tweets) => {
    existing_tweets=tweets[0];
    text=existing_tweets.text;
    image=existing_tweets.image;
    text_image=existing_tweets.text_image;
});


function saveToDB(tweets) {
  var arrayLength = tweets.length;
  for (var i = 0; i < arrayLength; i++) {

    var obj={};
    obj['time'] = tweets[i].created_at;
    obj['handle'] = tweets[i].user.screen_name;

      if(tweets[i].entities.media && tweets[i].text){
        obj['text'] = tweets[i].text;
        obj['media'] = tweets[i].entities.media;
        text_image.push(obj);
      }
      else if(tweets[i].entities.media){
        obj['media'] = tweets[i].entities.media;
        image.push(obj);
      }
      else{
        obj['text'] = tweets[i].text;
        text.push(obj);
      }
  }
  //SAVE IN MONGO DB

  //
  // var newTweets = new Tweets({
  //   text: text,
  //   images: image,
  //   text_images: text_image
  // }).save();

  Tweets.update({},{ $set:
    {
      text: text,
      images: image,
      text_images: text_image
    }
  },(err, raw) => {
      console.log(raw);
      }
    );
}

function handles(handle){
  var params = {screen_name: handle,count: '30'};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      saveToDB(tweets);
    }
  });
}

module.exports = (app) => {
  app.get('/get_tweets', (req,res) => {
    res.send(existing_tweets);
  });
}
