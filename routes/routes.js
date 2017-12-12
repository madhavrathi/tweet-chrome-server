var Twitter = require('twitter');
const mongoose = require('mongoose');
const keys = require('../config/keys');
const cors = require('cors');

const Tweets = mongoose.model('tweets');
const Handles = mongoose.model('handles');
const Main = mongoose.model('main');

// var newTweets = new Tweets({
//   text: text,
//   images: image,
//   text_images: text_image
// }).save();
// var newHandles = new Handles({
//   handles: ['mdhvrthi']
// }).save();

var client = new Twitter({
  consumer_key: keys.consumer_key,
  consumer_secret: keys.consumer_secret,
  access_token_key: keys.access_token_key,
  access_token_secret: keys.access_token_secret
});

var newtweet = 'none';
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

function getNewTweets(handle){
  var params = {screen_name: handle,count: '2'};
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      Main.find({handle: handle}, (err, h) => {
          var date = new Date(tweets[0].created_at);
          //console.log(new Date(h[0].text_images[0].time),handle);
          //console.log(tweets[0]);
          if(tweets[0].entities.media && (tweets[0].text.substring(0,4) !== 'http') ){
            if( date > new Date(h[0].text_images[0].time) ){
              //console.log(date > new Date(h[0].text_images[0].time),date,new Date(h[0].text[0].time),handle)
              var obj={};
              obj['time'] = tweets[0].created_at;
              obj['handle'] = tweets[0].user.screen_name;
              obj['text'] = tweets[0].text;
              obj['media'] = tweets[0].entities.media;
              text_image.push(obj);
              existing_tweets.text_images = text_image;
              Tweets.update({},{ $set:
                {text_images: text_image}},(err, raw) => {
                  console.log(raw);});
              Main.update({handle: handle},{ $set:{text_images: h[0].text_images.unshift(obj)}},(err, raw) => {console.log(raw);});
              newtweet = 'text_image';
            }

          }
          else if(tweets[0].entities.media){
            if(h[0].images){

              if( date > new Date(h[0].images[0].time) ){
                //console.log(date > new Date(h[0].images[0].time),date,new Date(h[0].text[0].time),handle)
                var obj={};
                obj['time'] = tweets[0].created_at;
                obj['handle'] = tweets[0].user.screen_name;
                obj['media'] = tweets[0].entities.media;
                image.push(obj);
                existing_tweets.images = image;
                Tweets.update({},{ $set:
                  {images: image}},(err, raw) => {
                    console.log(raw);});
                Main.update({handle: handle},{ $set:{images: h[0].images.unshift(obj)}},(err, raw) => {console.log(raw);});
                newtweet = 'image';
              }

            }else{
              var obj={};
              obj['time'] = tweets[0].created_at;
              obj['handle'] = tweets[0].user.screen_name;
              obj['media'] = tweets[0].entities.media;
              image.push(obj);
              existing_tweets.images = image;
              Tweets.update({},{ $set:
                {images: image}},(err, raw) => {
                  console.log(raw);});
              Main.update({handle: handle},{ $set:{images: h[0].images.unshift(obj)}},(err, raw) => {console.log(raw);});
              newtweet = 'image';
            }


          }
          else{
            if( date > new Date(h[0].text[0].time) ){
              //console.log(date > new Date(h[0].text[0].time),date,new Date(h[0].text[0].time),handle)
              var obj={};
              obj['time'] = tweets[0].created_at;
              obj['handle'] = tweets[0].user.screen_name;
              obj['text'] = tweets[0].text;
              text.push(obj);
              existing_tweets.text = text;
              Tweets.update({},{ $set:
                {text: text}},(err, raw) => {
                  console.log(raw);});

              Main.update({handle: handle},{ $set:{text: h[0].text.unshift(obj)}},(err, raw) => {console.log(raw);});
              newtweet = 'text';
            }

          }


      });




    }
  });
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
        //saveToDB(tweets);
        var arrayLength = tweets.length;
        var maintext=[], mainimage=[],maintext_image=[];
        for (var i = 0; i < arrayLength; i++) {
          var obj={};
          obj['time'] = tweets[i].created_at;
          obj['handle'] = tweets[i].user.screen_name;
          //console.log(tweets[0].text.substring(0,4) !== 'http',tweets[0].text)
            if(tweets[i].entities.media && (tweets[i].text.substring(0,4) !== 'http') ){
              obj['text'] = tweets[i].text;
              obj['media'] = tweets[i].entities.media;
              text_image.push(obj);
              maintext_image.push(obj);
            }
            else if(tweets[i].entities.media){
              obj['media'] = tweets[i].entities.media;
              image.push(obj);
              mainimage.push(obj);
            }
            else{
              obj['text'] = tweets[i].text;
              text.push(obj);
              maintext.push(obj);
            }
        }

        existing_tweets.text = text;
        existing_tweets.images = image;
        existing_tweets.text_images = text_image;
        //SAVE IN MONGO DB
        Tweets.update({},{ $set:
          {text: text,images: image,text_images: text_image}},(err, raw) => {
            console.log(raw);});
        var newMain = new Main({handle: handle,text: maintext,images: mainimage,text_images: maintext_image}).save();
      }
    });
  }

}

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

      Main.remove({ handle: handle }, function (err) {
        if (!err) console.log('removed')
        // removed!
      });

  }

}
//FUNCTION TO UPDATE IN REAL TIME////
setInterval(() => {                //
  if(handles.length > 0){          //
    handles.map(getNewTweets)      //
  }                                //
                                   //
}, 2000);                          //
//FUNCTION TO UPDATE IN REAL TIME////

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
    //console.log(obj,handles);
    if( Object.keys(obj).length !== 0 ){
      if(obj.new_handles){
          //console.log(obj.new_handles);
          obj.new_handles.map(addHandles);
      }
      if(obj.removed_handles){
          //console.log(obj.removed_handles);
          obj.removed_handles.map(removeFromDB);
      }
      console.log({
        "existing_tweets": existing_tweets,
        "handles": handles
      })
      setTimeout(() => {
        res.send({
          "existing_tweets": existing_tweets,
          "handles": handles
        })
      }, 2000);
    }
  });

  app.get('/gethandles', (req,res) => {
    Handles.find({}, (err, h) => {
        res.send({"handles": h[0].handles});
    });
    //res.send({"handles": handles})
  });

  app.get('/newtweet', (req,res) => {
    res.send(newtweet);
    newtweet = 'none';
  });
}
