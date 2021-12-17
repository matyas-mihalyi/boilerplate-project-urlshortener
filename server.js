require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { createNewUrl, findOriginalUrl, runAsyncWrapper } = require('./utils.js');
const res = require('express/lib/response');
const dns = require('dns');

const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 4000;


app.use(bodyParser.urlencoded({extended: false}))

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//add short url to database
app.post('/api/shorturl/', runAsyncWrapper(async(req, res) => {
  const inputUrl = req.body.url;
  const { hostname, protocol } = new URL(inputUrl);

  dns.lookup(hostname, async(err, address, family)=> {
    if (err || protocol === "ftp:") {
      res.json({ error: 'invalid url' });
    }
    else {
      const newUrl = await createNewUrl(inputUrl);
      res.json({ original_url: newUrl.original_url, short_url: newUrl.short_url});
    }
  });
}));

//redirect to original url
app.get('/api/shorturl/:url', runAsyncWrapper(async(req, res) => {
  const shortUrl = req.params.url;
  const originalUrl = await findOriginalUrl(shortUrl);
  res.redirect(originalUrl);
}));

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
