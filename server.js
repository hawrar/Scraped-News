// The dependencies
var path = require('path');
var bodyParser = require('body-parser');

// The Express app
var express = require('express');
var app = express();

// The handlebars
var exphanbrs = require('express-handlebars');
//Intial layout for xphandbar.
var hbs = exphanbrs.create({
  defaultLayout: 'main',
  // Here we identify the helpers for the above xphandr instance.
  helpers: {
    addOne: function(value, options){
      return parseInt(value) + 1;
    }
  }
});
// engine setup
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// We require request and cheerio for scraping
var request = require('request');
var cheerio = require('cheerio');

// We require mongoose and mongodb objectid
var mongoose = require('mongoose');
var ObjectId = require('mongojs').ObjectID;

// This is the database configuration
mongoose.connect('mongodb://localhost/scraper');
var db = mongoose.connection;

// for displaying mongoose errors
db.on('error', function(err) {
  console.log('Database Error:', err);
});

// Wee rRequire our scrapedNews and comment models
var scrapedNews = require('./scrapednewsModel');

// Scrape data when app starts

var options = {
  url: 'https://www.vox.com/policy-and-politics/',
  headers: {
    'User-Agent': 'chrome /5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
  }
};
// We make a request from the website

request(options, function(error, response, html) {
  
  // We load the html body from request into cheerio
  
  var $ = cheerio.load(html);
  
  // This is for  the element with a "new-content-block" class
  $('div.new-content-block').each(function(i, element) {
    
    // Saving  the div and a tag
    var $a = $(this).children('a');
    var $div = $(this).children('div');
    
    // Saving the article url
    var articleURL = $a.attr('href');
    
    // Saving the img url of each element
    var imgURL = $a.children('img').attr('src');
    
    // Saving the title text
    var title = $div.children('h4').text();
    
    // Saving the synopsis text
    var synopsis = $div.children('p').text();
    
    // Createing mongoose model
    var scrapedNews = new ScrapedNews({
      title: title,
      imgURL: imgURL,
      synopsis: synopsis,
      articleURL: articleURL
    });
    
    // Saving data
    scrapedNews.save(function(err) {
      if (err) {
        
      }
      
    });
  });
});

// This is the use for the Express middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'));

// for sending to main page through main route
app.get('/', function(req, res) {
  ScrapedNews
    .findOne()
    .exec(function(err,data) {
      if (err) return console.error(err);
      // This is for rendering the successful data first
      res.render('index', {
        imgURL: data.imgURL,
        title: data.title,
        synopsis: data.synopsis,
        _id: data._id,
        articleURL: data.articleURL,
        comments: data.comments
      });
    })
});

// Retrieving next data from the db
app.get('/next/:id', function(req, res) {
  ScrapedNews
    .find({
      _id: {$gt: req.params.id}
    })
    .sort({_id: 1 })
    .limit(1)
    .exec(function(err,data) {
      if (err) return console.error(err);
      res.json(data);
    })
});

// Retrieving previous data from the db
app.get('/prev/:id', function(req, res) {
  ScrapedNews
    .find({
      _id: {$lt: req.params.id}
    })
    .sort({_id: -1 })
    .limit(1)
    .exec(function(err,data) {
      if (err) return console.error(err);
      res.json(data);
    })
});

// Adding comment data to the db
app.post('/comment/:id', function(req, res) {
  

  // Updating the  scraped data with comments
  ScrapedNews.findByIdAndUpdate(
    req.params.id,
    {$push: {
      comments: {
        text: req.body.comment
      }
    }},
    {upsert: true, new: true},
    function(err, data) {
      if (err) return console.error(err);
      res.json(data.comments);
    }
  );
});

// Removing the  comment data from the db
app.post('/remove/:id', function(req, res) {
  
  // Updating the  scraped data and removing comments
  ScrapedNews.findByIdAndUpdate(
    req.params.id,
    {$pull: {
      comments: {
        _id: req.body.id
      }
    }},
    {new: true},
    function(err, data) {
      if (err) return console.error(err);
      res.json(data.comments);
    }
  );
});

// Listening on port 8080
app.listen(8080, function() {
  console.log('App running on port 8080!');
});