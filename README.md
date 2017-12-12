![Image](undefined)
# tweet-chrome server
Front end app is hosted at [https://protected-thicket-15731.herokuapp.com/](https://protected-thicket-15731.herokuapp.com/)
Front end is made with ReactJs. The backend server is made with NodeJS and express. The database used in backend is MongoDB.
Frontend github repo: [https://github.com/madhavrathi/tweet-chrome/](https://github.com/madhavrathi/tweet-chrome)
Backend server is hosted here: [https://twitter-chrome-server.herokuapp.com/](https://twitter-chrome-server.herokuapp.com/)

## Features:
1. Fetches 30 latest tweets of handles you add in settings.
1. Organise tweets into three different categories: text, images and text with images.
1. Sort the tweets according to time (latest shown first).
1. The database is updated in realtime.
1. Pops a notification when a added handle posts a new tweet.

## Running on localhost:
1. Download as zip or clone it.
1. Open terminal and cd into the downloaded folder.
1. Run
```javascript
npm run dev
```
![Image](undefined)
## Handles:
- /get_tweets : For getting all the tweets
- /handles : For updating the tweets as the handles are removed or added
- /gethandles : For getting the list of current handles
- /newtweet : For checking if new tweets are added or not.
