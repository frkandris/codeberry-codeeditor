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



/* Render a multifile code editor page */

router.get('/m/edit/:codeEditorInstanceId/', function (req, res) {

  var codeEditorInstanceId = req.params.codeEditorInstanceId;

  // Removing evil stuff from codeEditorInstanceId
  var codeEditorInstanceIdSafe = codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, '').substring(0,255);

  // If something sketchy is going on, redirect to a safe editor URL
  if (codeEditorInstanceId != codeEditorInstanceIdSafe) {
    res.redirect('/m/edit/' + codeEditorInstanceIdSafe);
  } else {
    codeEditorInstanceId = codeEditorInstanceIdSafe;
  }

  // If the directory for the editor content does not exist, create it
  var dir = contentFolder + codeEditorInstanceId + '/';
  if (!fs.existsSync(dir)) {
    fs.mkdir(dir, err => {})
    fs.createReadStream(defaultContentFolder + 'index.html').pipe(fs.createWriteStream(dir + 'index.html'));
    fs.createReadStream(defaultContentFolder + 'index.css').pipe(fs.createWriteStream(dir + 'index.css'));
    fs.createReadStream(defaultContentFolder + 'index.js').pipe(fs.createWriteStream(dir + 'index.js'));
  }


  var fileListArray = [];
  fs.readdirSync(dir).forEach(file => {
    fileListArray.push(file);
  });

  // Render page
  res.render('editor-multifile', { 
    codeEditorInstanceId: codeEditorInstanceId,
    fileListArray: fileListArray
  });

});


/* Save Ajax edit requests coming from the client. */

router.post('/m/save/', function(req, res, next) {

  // These are the variables that we recive from the client via Ajax:
  var response = {
    codeEditorInstanceId : req.body.codeEditorInstanceId,
    editorText : req.body.editorText,
    fileName : req.body.fileName
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
  fs.writeFileSync(dir + response.fileName, response.editorText, 'utf-8');

  // Return (no rendering needed, as this is a server side process)
  res.end();
});



router.post('/m/getfile/', function(req, res, next) {

  var response = {
    codeEditorInstanceId : req.body.codeEditorInstanceId,
    fileSelected : req.body.fileSelected
  };


  // Removing evil stuff from codeEditorInstanceId
  var codeEditorInstanceIdSafe = response.codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, '').substring(0,255);

  // If something sketchy is going on, redirect to a safe editor URL
  if (response.codeEditorInstanceId != codeEditorInstanceIdSafe) {
    res.redirect('/m/edit/' + codeEditorInstanceIdSafe);
  } else {
    var codeEditorInstanceId = codeEditorInstanceIdSafe;
  }

  // If the directory for the editor content does not exist, create it
  var dir = contentFolder + codeEditorInstanceId + '/';
  if (!fs.existsSync(dir)) {
    fs.mkdir(dir, err => {})
  }

  // If it exists, read the content, otherwise read the default content
  try {
    var editorText = fs.readFileSync(dir + response.fileSelected, 'utf8');
  } catch (err) {
    var editorText = fs.readFileSync(defaultContentFolder + 'index.html', 'utf8');
  }

  // Prepare string, that will be returned to the Ajax script, that called this route
  var getFileResult = JSON.stringify({ 
    editorText: editorText, 
    fileSelected: response.fileSelected 
  });

  // Return
  res.end(getFileResult);
});


router.get('/m/view/:codeEditorInstanceId/', function(req, res) {

  if (req.url.slice(-1) != '/') {
    res.redirect(req.url + '/');
  };

  var codeEditorInstanceId = req.params.codeEditorInstanceId;

  // Removing evil stuff from codeEditorInstanceId
  var codeEditorInstanceIdSafe = codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, '').substring(0,255);

  // If something sketchy is going on, redirect to a safe editor URL
  if (codeEditorInstanceId != codeEditorInstanceIdSafe) {
    res.redirect('/m/edit/' + codeEditorInstanceIdSafe);
  } else {
    codeEditorInstanceId = codeEditorInstanceIdSafe;
  }

  var dir = contentFolder + codeEditorInstanceId + '/';

  // If we find directory belonging to the codeEditorInstanceId, restart the editor with a safe editor URL
  if (!fs.existsSync(dir)) {
    res.redirect('/m/edit/' + codeEditorInstanceIdSafe);
  } else {

    var fileName = "index.html";
    var localFileName = path.join(__dirname, "../"+dir, fileName)

    res.sendFile(localFileName);

  }
});

router.get('/m/view/:codeEditorInstanceId/:fileName', function(req, res) {

  var codeEditorInstanceId = req.params.codeEditorInstanceId;

  // Removing evil stuff from codeEditorInstanceId
  var codeEditorInstanceIdSafe = codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, '').substring(0,255);

  // If something sketchy is going on, redirect to a safe editor URL
  if (codeEditorInstanceId != codeEditorInstanceIdSafe) {
    res.redirect('/m/edit/' + codeEditorInstanceIdSafe);
  } else {
    codeEditorInstanceId = codeEditorInstanceIdSafe;
  }

  var dir = contentFolder + codeEditorInstanceId + '/';

  // If we find directory belonging to the codeEditorInstanceId, restart the editor with a safe editor URL
  if (!fs.existsSync(dir)) {
    res.redirect('/m/edit/' + codeEditorInstanceIdSafe);
  } else {

    var fileName = req.params.fileName;
    var localFileName = path.join(__dirname, "../"+dir, fileName)

    res.sendFile(localFileName);

  }
});




router.post('/m/deletefile/', function(req, res, next) {

  var response = {
    codeEditorInstanceId : req.body.codeEditorInstanceId,
    fileSelected : req.body.fileSelected
  };


  // Removing evil stuff from codeEditorInstanceId
  var codeEditorInstanceIdSafe = response.codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, '').substring(0,255);

  // If something sketchy is going on, redirect to a safe editor URL
  if (response.codeEditorInstanceId != codeEditorInstanceIdSafe) {
    res.redirect('/m/edit/' + codeEditorInstanceIdSafe);
  } else {
    var codeEditorInstanceId = codeEditorInstanceIdSafe;
  }

  var dir = contentFolder + codeEditorInstanceId + '/';

  fs.unlink(dir + response.fileSelected, (err) => {
    if (err) throw err;
  });

  // Return
  res.end();
});




/* Handling URLs without codeEditorInstanceId, eg. '/', '/edit', '/view' */

function redirectToNewEditorCreaterMultiFile(req, res, next) {

  // Create new codeEditorInstanceId with 3 random words, separated by '-'
  var codeEditorInstanceId = randomWords({exactly:1, wordsPerString:3, separator:'-'});

  // Redirect to open a new editor
  res.redirect('/m/edit/' + codeEditorInstanceId);
};

router.get('/m/', redirectToNewEditorCreaterMultiFile);
router.get('/m/edit', redirectToNewEditorCreaterMultiFile);
router.get('/m/view', redirectToNewEditorCreaterMultiFile);

module.exports = router;