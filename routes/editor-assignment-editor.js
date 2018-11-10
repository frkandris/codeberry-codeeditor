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



/* Handling URLs without codeEditorInstanceId, eg. '/', '/edit', '/view' */

function redirectToNewEditorCreater(req, res, next) {

  // Create new codeEditorInstanceId with 3 random words, separated by '-'
  var codeEditorInstanceId = randomWords({exactly:1, wordsPerString:3, separator:'-'});

  // Redirect to open a new editor
  res.redirect('/v/edit/' + codeEditorInstanceId);
};

router.get('/v/', redirectToNewEditorCreater);
router.get('/v/edit', redirectToNewEditorCreater);
router.get('/v/view', redirectToNewEditorCreater);



/* Save Ajax edit requests coming from the client. */

router.post('/v/save/', function(req, res, next) {

  // These are the variables that we recive from the client via Ajax:
  var response = {
    codeEditorInstanceId: req.body.codeEditorInstanceId,
    htmlText: req.body.htmlText,
    cssText: req.body.cssText,
    javascriptText: req.body.javascriptText,
    validatorText: req.body.validatorText,
    assignmentText: req.body.assignmentText
  };

  // Debug
  // console.log(response);

  // Removing evil stuff from codeEditorInstanceId
  var codeEditorInstanceIdSafe = response.codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, '').substring(0,255);
  
  // If something sketchy is going on, just return, do not save.
  if (codeEditorInstanceIdSafe != response.codeEditorInstanceId) {
    res.end();
  } else {
    var codeEditorInstanceId = codeEditorInstanceIdSafe;
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
  fs.writeFileSync(dir + 'validator.js', response.validatorText, 'utf-8');
  fs.writeFileSync(dir + 'assignment.css', response.assignmentText, 'utf-8');

  // Return (no rendering needed, as this is a server side process)
  res.end();
});



/* Render a code editor page */

router.get('/v/edit/:codeEditorInstanceId/', function (req, res) {

  var codeEditorInstanceId = req.params.codeEditorInstanceId;

  // Removing evil stuff from codeEditorInstanceId
  var codeEditorInstanceIdSafe = codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, '').substring(0,255);

  // If something sketchy is going on, redirect to a safe editor URL
  if (codeEditorInstanceId != codeEditorInstanceIdSafe) {
    res.redirect('/v/edit/' + codeEditorInstanceIdSafe);
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
  try {
    validatorText = fs.readFileSync(dir + 'validator.js', 'utf8');
  } catch (err) {
    var validatorText = fs.readFileSync(defaultContentFolder + 'validator.js', 'utf8');
  }
  try {
    assignmentText = fs.readFileSync(dir + 'assignment.css', 'utf8');
  } catch (err) {
    var assignmentText = fs.readFileSync(defaultContentFolder + 'assignment.css', 'utf8');
  }

  // Render page
  res.render('editor-assignment-editor', { 
    codeEditorInstanceId: codeEditorInstanceId,
    htmlText: htmlText,
    cssText: cssText,
    javascriptText: javascriptText,
    validatorText: validatorText,
    assignmentText: assignmentText
  });

})


module.exports = router;