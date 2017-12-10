var Twitter = require('twitter');
const keys = require('../config/keys');
var client = new Twitter({
  consumer_key: keys.consumer_key,
  consumer_secret: keys.consumer_secret,
  access_token_key: keys.access_token_key,
  access_token_secret: keys.access_token_secret
});

function sendHome() {

}
module.exports = (app) => {
  app.get('/gettweets', (req,res) => {
    var params = {screen_name: 'mdhvrthi',count: '25'};
      client.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (!error) {
        res.send(tweets);
      }
    });

  });
}
