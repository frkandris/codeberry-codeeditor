var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var randomWords = require('random-words');

/* Init variables */

// We'll store folders+files created by users in here
var contentFolder = './public/content/editorContent/'; 

// The default content of a new editor instance is here
var defaultContentFolder = './public/content/defaultEditorContent/';



/* Handling URLs without codeEditorInstanceId, eg. "/", "/edit", "/view" */

function redirectToNewEditorCreater(req, res, next) {

  // Create new codeEditorInstanceId with 3 random words, separated by "-"
  var codeEditorInstanceId = randomWords({exactly:1, wordsPerString:3, separator:'-'});

  // Redirect to open a new editor
  res.redirect('/edit/' + codeEditorInstanceId);
};

router.get("/", redirectToNewEditorCreater);
router.get("/edit", redirectToNewEditorCreater);
router.get("/view", redirectToNewEditorCreater);



/* Save Ajax edit requests coming from the client. */

router.post('/save/', function(req, res, next) {

  // These are the variables that we recive from the client via Ajax:
  response = {
    codeEditorInstanceId : req.body.codeEditorInstanceId,
    htmlText : req.body.htmlText,
    cssText : req.body.cssText,
    javascriptText : req.body.javascriptText
  };

  // Debug
  // console.log(response);

  // Removing evil stuff from codeEditorInstanceId
  codeEditorInstanceIdSafe = response.codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, "").substring(0,255);
  
  // If something sketchy is going on, just return, do not save.
  if (codeEditorInstanceIdSafe != response.codeEditorInstanceId) {
    res.end();
  } else {
    codeEditorInstanceId = codeEditorInstanceIdSafe;
  }

  // The directory where we're going to store the files
  var dir = contentFolder + codeEditorInstanceId + '/';

  // If it does not exist, create it
  if (!fs.existsSync(dir)) {
    fs.mkdir(dir, err => {})
  }

  // Old version: we store everything in 1 file
  // var resultText = '\<html\>\<head\>\<style\>' + req.body.cssText + '\<\/style\>\<\/head\>\<body\>' + req.body.htmlText + '\<script\>' + req.body.javascriptText + '\<\/script\>\<\/body\>\</html\>';

  // New version: we store everything in 3 files
  fs.writeFileSync(dir + 'index.html', response.htmlText, 'utf-8');
  fs.writeFileSync(dir + 'index.css', response.cssText, 'utf-8');
  fs.writeFileSync(dir + 'index.js', response.javascriptText, 'utf-8');

  // Return (no rendering needed, as this is a server side process)
  res.end();
});



/* View the result page separately (so not in the code editor) */

router.get('/view/:codeEditorInstanceId/', function(req, res) {

  var codeEditorInstanceId = req.params.codeEditorInstanceId;

  // Removing evil stuff from codeEditorInstanceId
  codeEditorInstanceIdSafe = codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, "").substring(0,255);

  // If something sketchy is going on, redirect to a safe editor URL
  if (codeEditorInstanceId != codeEditorInstanceIdSafe) {
    res.redirect('/edit/' + codeEditorInstanceIdSafe);
  } else {
    codeEditorInstanceId = codeEditorInstanceIdSafe;
  }

  var dir = contentFolder + codeEditorInstanceId + '/';

  // If we find directory belonging to the codeEditorInstanceId, restart the editor with a safe editor URL
  if (!fs.existsSync(dir)) {
    res.redirect('/edit/' + codeEditorInstanceIdSafe);
  } else {

    // Old version: send 1 string, where we previously compiled html+css+js
    // var dir = '../public/content/' + codeEditorInstanceId;
    // res.sendFile(path.join(__dirname, dir, 'index.html'));

    // New version: send 1 string, where we concatenate html+css+js now
    try {
      htmlText = fs.readFileSync(dir + 'index.html', 'utf8');
    } catch (err) {
      var htmlText = '';
    }
    try {
      cssText = fs.readFileSync(dir + 'index.css', 'utf8');
    } catch (err) {
      var cssText = '';
    }
    try {
      javascriptText = fs.readFileSync(dir + 'index.js', 'utf8');
    } catch (err) {
      var javascriptText = '';
    }

    // Concatenate html+css+js into 1 string
    var resultText = '\<html\>\<head\>\<style\>' + cssText + '\<\/style\>\<\/head\>\<body\>' + htmlText + '\<script\>' + javascriptText + '\<\/script\>\<\/body\>\</html\>';

    // Debug
    // console.log(resultText);

    // Render page
    res.send(resultText);
  }
});



/* Render a code editor page */

router.get('/edit/:codeEditorInstanceId/', function (req, res) {

  var codeEditorInstanceId = req.params.codeEditorInstanceId;

  // Removing evil stuff from codeEditorInstanceId
  codeEditorInstanceIdSafe = codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, "").substring(0,255);

  // If something sketchy is going on, redirect to a safe editor URL
  if (codeEditorInstanceId != codeEditorInstanceIdSafe) {
    res.redirect('/edit/' + codeEditorInstanceIdSafe);
  } else {
    codeEditorInstanceId = codeEditorInstanceIdSafe;
  }

  // If the directory for the editor content does not exist, create it
  var dir = contentFolder + codeEditorInstanceId + '/';
  if (!fs.existsSync(dir)) {
    fs.mkdir(dir, err => {})
  }

  // If it exists, read the content, otherwise read the default content
  try {
    htmlText = fs.readFileSync(dir + 'index.html', 'utf8');
  } catch (err) {
    var htmlText = fs.readFileSync(defaultContentFolder + 'index.html', 'utf8');
  }
  try {
    cssText = fs.readFileSync(dir + 'index.css', 'utf8');
  } catch (err) {
    var cssText = fs.readFileSync(defaultContentFolder + 'index.css', 'utf8');
  }
  try {
    javascriptText = fs.readFileSync(dir + 'index.js', 'utf8');
  } catch (err) {
    var javascriptText = fs.readFileSync(defaultContentFolder + 'index.js', 'utf8');
  }

  // Render page
  res.render('index', { 
    codeEditorInstanceId: codeEditorInstanceId,
    htmlText: htmlText,
    cssText: cssText,
    javascriptText: javascriptText
  });

})

module.exports = router;
