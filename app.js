var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));

//may be the wrong spot for this function, if issues arise, put it in the MongoClient function
function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).render('error_template', { error: err });
}

MongoClient.connect('mongodb://localhost:27017/video', function(err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");


    app.get('/', function(req, res, next){

        db.collection('movies').find({}).toArray(function(err, docs) {
            res.render('movies', { 'movies': docs } );
        });
    });

    app.post('/movies-2', function(req, res, next){
      var title = req.body.title;
      var year = req.body.year;
      var imdb = req.body.imdb;
      if((year=='')|| (title=='') || (imdb=='')){
        next('Please input all fields');
    } else {
      db.collection('movies').insertOne(
        {'title': title, 'year': year, 'imdb': imdb},
        function(err, r) {
          assert.equal(null, err);
          db.collection('movies').find({}).toArray(function(err, docs) {
            res.render('movies-2', { 'movies': docs } );
          });
        }
      );
    }
  });

app.use(errorHandler);

    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });

});
