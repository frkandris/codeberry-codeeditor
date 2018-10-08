var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

/* GET home page. */

router.get('/', function(req, res, next) {

  var defaultHtmlText = fs.readFileSync('./public/content/default/index.html', 'utf8');
  var defaultCssText = fs.readFileSync('./public/content/default/index.css', 'utf8');
  var defaultJavascriptText = fs.readFileSync('./public/content/default/index.js', 'utf8');

  res.render('index', { 
    htmlText: defaultHtmlText,
    cssText: defaultCssText,
    javascriptText: defaultJavascriptText
  });

});

/* Save client edits via Ajax. */

router.post('/save/', function(req, res, next) {

  response = {
    codeEditorInstanceId : req.body.codeEditorInstanceId,
    htmlText : req.body.htmlText,
    cssText : req.body.cssText,
    javascriptText : req.body.javascriptText
  };

  // console.log(response);

  codeEditorInstanceId = req.body.codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, "").substring(0,255);
  
  var dir = './public/content/'+codeEditorInstanceId;

  if (!fs.existsSync(dir)) {
    fs.mkdir(dir, err => {})
  }

  // var resultText = '\<html\>\<head\>\<style\>' + req.body.cssText + '\<\/style\>\<\/head\>\<body\>' + req.body.htmlText + '\<script\>' + req.body.javascriptText + '\<\/script\>\<\/body\>\</html\>';

  fs.writeFileSync(dir + '/index.html', req.body.htmlText, 'utf-8');
  fs.writeFileSync(dir + '/index.css', req.body.cssText, 'utf-8');
  fs.writeFileSync(dir + '/index.js', req.body.javascriptText, 'utf-8');

  res.end();
});

/* View full page output from a codeEditor. */

router.get('/view/:codeEditorInstanceId/', function(req, res) {

  var codeEditorInstanceId = req.params.codeEditorInstanceId;

  codeEditorInstanceIdSafe = codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, "").substring(0,255);
  if (codeEditorInstanceId != codeEditorInstanceIdSafe) {
    res.redirect('/view/' + codeEditorInstanceIdSafe);
  } else {
    codeEditorInstanceId = codeEditorInstanceIdSafe;
  }

  var dir = './public/content/' + codeEditorInstanceId;
  if (!fs.existsSync(dir)) {
    res.redirect('/edit/' + codeEditorInstanceIdSafe);
  } else {
    // var dir = '../public/content/' + codeEditorInstanceId;
    // res.sendFile(path.join(__dirname, dir, 'index.html'));

    try {
      htmlText = fs.readFileSync('./public/content/' + codeEditorInstanceId + '/index.html', 'utf8');
    } catch (err) {
      var htmlText = '';
    }
    try {
      cssText = fs.readFileSync('./public/content/' + codeEditorInstanceId + '/index.css', 'utf8');
    } catch (err) {
      var cssText = '';
    }
    try {
      javascriptText = fs.readFileSync('./public/content/' + codeEditorInstanceId + '/index.js', 'utf8');
    } catch (err) {
      var javascriptText = '';
    }
    var resultText = '\<html\>\<head\>\<style\>' + cssText + '\<\/style\>\<\/head\>\<body\>' + htmlText + '\<script\>' + javascriptText + '\<\/script\>\<\/body\>\</html\>';

    res.send(resultText);
  }
});


router.get('/edit/:codeEditorInstanceId/', function (req, res) {

  var codeEditorInstanceId = req.params.codeEditorInstanceId;

  // remove unsafe characters from codeEditorInstanceId, redirect to safe URL

  codeEditorInstanceIdSafe = codeEditorInstanceId.replace(/[^a-zA-Z0-9\-]/g, "").substring(0,255);
  if (codeEditorInstanceId != codeEditorInstanceIdSafe) {
    res.redirect('/edit/' + codeEditorInstanceIdSafe);
  } else {
    codeEditorInstanceId = codeEditorInstanceIdSafe;
  }

  var dir = './public/content/'+codeEditorInstanceId;
  if (!fs.existsSync(dir)) {
    fs.mkdir(dir, err => {})
  }

  try {
    htmlText = fs.readFileSync('./public/content/' + codeEditorInstanceId + '/index.html', 'utf8');
  } catch (err) {
    var htmlText = fs.readFileSync('./public/content/default/index.html', 'utf8');
  }
  try {
    cssText = fs.readFileSync('./public/content/' + codeEditorInstanceId + '/index.css', 'utf8');
  } catch (err) {
    var cssText = fs.readFileSync('./public/content/default/index.css', 'utf8');
  }
  try {
    javascriptText = fs.readFileSync('./public/content/' + codeEditorInstanceId + '/index.js', 'utf8');
  } catch (err) {
    var javascriptText = fs.readFileSync('./public/content/default/index.js', 'utf8');
  }

  res.render('index', { 
    codeEditorInstanceId: codeEditorInstanceId,
    htmlText: htmlText,
    cssText: cssText,
    javascriptText: javascriptText
  });

})

module.exports = router;
