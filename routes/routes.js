var Twitter = require('twitter');
const mongoose = require('mongoose');
const keys = require('../config/keys');
const cors = require('cors');

const Tweets = mongoose.model('tweets');
const Handles = mongoose.model('handles');

var client = new Twitter({
  consumer_key: keys.consumer_key,
  consumer_secret: keys.consumer_secret,
  access_token_key: keys.access_token_key,
  access_token_secret: keys.access_token_secret
});

//Assingning from existing DB
var existing_tweets = [],text=[],image=[],text_image=[],handles=[];
Tweets.find({}, (err, tweets) => {
    existing_tweets=tweets[0];
    text=existing_tweets.text;
    image=existing_tweets.images;
    text_image=existing_tweets.text_images;
});
Handles.find({}, (err, h) => {
    handles=h[0].handles;
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
  existing_tweets.text = text;
  existing_tweets.images = image;
  existing_tweets.text_images = text_image;

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

function addHandles(handle){

  if(handles.indexOf(handle) === -1){
    //Save to handles
    handles.push(handle);
    Handles.update({},{ $set:{ handles: handles } },(err, raw) => {
        console.log(raw);
        }
      );

    //Save to Tweets
    var params = {screen_name: handle,count: '30'};
      client.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (!error) {
        saveToDB(tweets);
      }
    });
  }

}
// var newHandles = new Handles({
//   handles: ['mdhvrthi']
// }).save();

function removeFromDB(handle){
  if (handles.indexOf(handle) !== -1){
    //Remove handle from Handles in DB
    handles = handles.filter(e => e !== handle);
    Handles.update({},{ $set:{ handles: handles } },(err, raw) => {
        console.log(raw);
        }
      );

    //Remove tweets of handle in DB

    text = text.filter(e => e.handle !== handle);
    image = image.filter(e => e.handle !== handle);
    text_image= text_image.filter(e => e.handle !== handle);
    existing_tweets.text = text;
    existing_tweets.images = image;
    existing_tweets.text_images = text_image;
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

}

module.exports = (app) => {
  app.use(cors());
  app.options('*', cors());

  app.get('/get_tweets', (req,res) => {
    Tweets.find({}, (err, tweets) => {
        res.send(tweets[0]);
    });
    //res.send(existing_tweets);
  });

  app.get('/handles', (req,res) => {
    var obj = req.query;
    if( Object.keys(obj).length !== 0 ){
      if(obj.new_handles){
          //console.log(obj.new_handles);
          obj.new_handles.map(addHandles);
      }
      if(obj.removed_handles){
          //console.log(obj.removed_handles);
          obj.removed_handles.map(removeFromDB);
      }
      var NEWTWEETS,NEWHANDLES;
      Tweets.find({}, (err, tweets) => {
          NEWTWEETS = tweets[0];
      });
      Handles.find({}, (err, h) => {
          NEWHANDLES=h[0].handles;
      });
      res.send({
        "existing_tweets": NEWTWEETS,
        "handles": NEWHANDLES
      });
    }

  });

  app.get('/gethandles', (req,res) => {
    Handles.find({}, (err, h) => {
        res.send({"handles": h[0].handles});
    });
    //res.send({"handles": handles})
  });
}
