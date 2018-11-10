var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var randomWords = require('random-words');
var jquery = require('jquery');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

/* Init variables */

// We'll store folders+files created by users in here
var contentFolder = './public/content/editorContent/'; 

// The default content of a new editor instance is here
var defaultContentFolder = './public/content/defaultEditorContent/';




/* Render a multifile code editor page */

router.get('/a/edit/:codeEditorInstanceId/', function (req, res) {

  var codeEditorInstanceId = req.params.codeEditorInstanceId;

  // Removing evil stuff from codeEditorInstanceId
  var codeEditorInstanceIdSafe = codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, '').substring(0,255);

  // If something sketchy is going on, redirect to a safe editor URL
  if (codeEditorInstanceId != codeEditorInstanceIdSafe) {
    res.redirect('/a/edit/' + codeEditorInstanceIdSafe);
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
    assignmentText = fs.readFileSync(dir + 'assignment.css', 'utf8');
  } catch (err) {
    var assignmentText = fs.readFileSync(defaultContentFolder + 'assignment.css', 'utf8');
  }
  try {
    validatorText = fs.readFileSync(dir + 'validator.js', 'utf8');
  } catch (err) {
    var validatorText = fs.readFileSync(defaultContentFolder + 'validator.js', 'utf8');
  }

  // Render page
  res.render('editor-assignment', { 
    codeEditorInstanceId: codeEditorInstanceId,
    htmlText: htmlText,
    cssText: cssText,
    javascriptText: javascriptText,
    assignmentText: assignmentText,
    validatorText: validatorText
  });

});

/* Save Ajax edit requests coming from the client. */

router.post('/a/save/', function(req, res, next) {

  // These are the variables that we recive from the client via Ajax:
  var response = {
    codeEditorInstanceId : req.body.codeEditorInstanceId,
    assignmentText : req.body.assignmentText
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
  fs.writeFileSync(dir + 'assignment.css', response.assignmentText, 'utf-8');

  // Return (no rendering needed, as this is a server side process)
  res.end();
});


/* Validate code coming from the client */

router.post('/a/validate/', function(req, res, next) {

  // Concatenate HTML+CSS+JS into 1 string
  var resultText = '\<html\>\<head\>\<style\>' + req.body.cssText + req.body.assignmentText + '\<\/style\>\<\/head\>\<body\>' + req.body.htmlText + '\<script\>' + req.body.javascriptText + '\<\/script\>\<\/body\>\</html\>';

  // Create a virtual DOM using jsdom
  const dom = new JSDOM(resultText);
  const $ = (jquery)(dom.window);

  var dir = contentFolder + req.body.codeEditorInstanceId + '/';
  try {
    validatorText = fs.readFileSync(dir + 'validator.js', 'utf8');
  } catch (err) {
    var validatorText = fs.readFileSync(defaultContentFolder + 'validator.js', 'utf8');
  }

  // Check validator rule #1
  try {
    var rule = (eval(validatorText));
    if (rule) {
      validatorRule1Result = true;
    } else {
      validatorRule1Result = false;
    }
  } catch(e) {
    console.log(e);
  }

  // Prepare string, that will be returned to the Ajax script, that called this route
  var validatorResult = JSON.stringify({ 
    validatorRule1Result: validatorRule1Result
  });

  // Return
  res.end(validatorResult);


  // Return
  res.end();
});




/* Handling URLs without codeEditorInstanceId, eg. '/', '/edit', '/view' */

function redirectToNewEditorCreaterAssignmentFile(req, res, next) {

  // Create new codeEditorInstanceId with 3 random words, separated by '-'
  var codeEditorInstanceId = randomWords({exactly:1, wordsPerString:3, separator:'-'});

  // Redirect to open a new editor
  res.redirect('/a/edit/' + codeEditorInstanceId);
};

router.get('/a/', redirectToNewEditorCreaterAssignmentFile);
router.get('/a/edit', redirectToNewEditorCreaterAssignmentFile);
router.get('/a/view', redirectToNewEditorCreaterAssignmentFile);

module.exports = router;