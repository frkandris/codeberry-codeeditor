var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var randomWords = require('random-words');
var jquery = require('jquery');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
var common = require('./common');


/* Render the editor-for-the-student page */

router.get('/a/edit/:assignmentDefinitionId/:studentId/', function (req, res) {

  const assignmentDefinitionId = req.params.assignmentDefinitionId;
  const studentId = req.params.studentId;

  // If something sketchy is going on, redirect to a safe editor URL
  if (common.checkAssignmentDefinitionIdIntegrity(assignmentDefinitionId)==false) {
    res.redirect('/a/');
  }
  if (common.checkStudentIdIntegrity(studentId)==false) {
    res.redirect('/a/');
  }

  // If it exists, read the content, otherwise read the default content
  const htmlText = common.getStudentSubmissionContent('index.html', assignmentDefinitionId, studentId);
  const cssText = common.getStudentSubmissionContent('index.css', assignmentDefinitionId, studentId);
  const javascriptText = common.getStudentSubmissionContent('index.js', assignmentDefinitionId, studentId);
  const assignmentText = common.getStudentSubmissionContent('assignment.css', assignmentDefinitionId, studentId);
  const validatorText = common.getStudentSubmissionContent('validator.js', assignmentDefinitionId, studentId);

  // Render page
  res.render('editor-assignment', { 
    assignmentDefinitionId: assignmentDefinitionId,
    studentId: studentId,
    htmlText: htmlText,
    cssText: cssText,
    javascriptText: javascriptText,
    assignmentText: assignmentText,
    validatorText: validatorText
  });

});

/* Save Ajax edit requests coming from the client. */

router.post('/a/save/', function(req, res, next) {

  const assignmentDefinitionId = req.body.assignmentDefinitionId;
  const studentId = req.body.studentId;
  const assignmentText = req.body.assignmentText;

  // If something sketchy is going on, do not save, just return
  if (common.checkAssignmentDefinitionIdIntegrity(assignmentDefinitionId)==false) {
    res.end();
  }
  if (common.checkStudentIdIntegrity(studentId)==false) {
    res.end();
  }

  common.saveStudentSubmissionContent(assignmentText, 'assignment.css', assignmentDefinitionId, studentId);

  res.end();
});


/* Validate code coming from the client */

router.post('/a/validate/', function(req, res, next) {

  const assignmentDefinitionId = req.body.assignmentDefinitionId;
  const assignmentText = req.body.assignmentText;
  htmlText = common.getAssignmentDefinitionContent('index.html', assignmentDefinitionId);
  cssText = common.getAssignmentDefinitionContent('index.css', assignmentDefinitionId);
  javascriptText = common.getAssignmentDefinitionContent('index.js', assignmentDefinitionId);
  validatorText = common.getAssignmentDefinitionContent('validator.js', assignmentDefinitionId);

  // Concatenate HTML+CSS+JS into 1 string
  var resultText = '\<html\>\<head\>\<style\>' + cssText + assignmentText + '\<\/style\>\<\/head\>\<body\>' + htmlText + '\<script\>' + javascriptText + '\<\/script\>\<\/body\>\</html\>';

  // Create a virtual DOM using jsdom
  const dom = new JSDOM(resultText);
  const $ = (jquery)(dom.window);

  // Check validator rule #1
  try {
    var rule = (eval(validatorText)); /* FIXME: eval is evil. */
    if (rule) {
      validatorRule1Result = true;
    } else {
      validatorRule1Result = false;
    }
  } catch(e) {
    console.log(e);
    validatorRule1Result = false;
  }

  // Prepare string, that will be returned to the Ajax script, that called this route
  var validatorResult = JSON.stringify({ 
    validatorRule1Result: validatorRule1Result
  });

  // Return
  res.end(validatorResult);
});



/* Create a new AssignmentDefinition. */

router.get('/a/create-assignment/:assignmentDefinitionId', function(req, res, next) {

  let assignmentDefinitionId = req.params.assignmentDefinitionId;
  common.createAssignmentDefinition(assignmentDefinitionId);

  res.end("assignment #"+assignmentDefinitionId+" created");
});


/* No student id? We'll create one. */

router.get('/a/edit/:assignmentDefinitionId', function(req, res, next) {

  let assignmentDefinitionId = req.params.assignmentDefinitionId;

  // If something sketchy is going on, redirect to a safe editor URL
  if (common.checkAssignmentDefinitionIdIntegrity(assignmentDefinitionId)==false) {
    res.redirect('/a/');
  }

  const studentId = randomWords({exactly:1, wordsPerString:3, separator:'-'});
  common.createStudent(studentId);
  common.createAssignmentForStudent(studentId, assignmentDefinitionId);

  res.redirect('/a/edit/' + assignmentDefinitionId + '/' + studentId);
});




// /* Handling URLs without assignmentDefinitionId, eg. '/', '/edit', '/view' */

// function redirectToNewEditorCreaterAssignmentFile(req, res, next) {

//   // Create new assignmentDefinitionId with 3 random words, separated by '-'
//   const assignmentDefinitionId = 1;
//   const studentId = randomWords({exactly:1, wordsPerString:1, separator:'-'});

//   common.createStudent(studentId);
//   common.createAssignmentForStudent(studentId, assignmentDefinitionId);

//   // Redirect to open a new editor
//   res.redirect('/a/edit/' + assignmentDefinitionId + '/' + studentId);
// };

// router.get('/a/', redirectToNewEditorCreaterAssignmentFile);
// router.get('/a/edit', redirectToNewEditorCreaterAssignmentFile);


/* iFrame demo */

router.get('/a/iframedemo/', function(req, res, next) {
  res.render('iframedemo', { 
  });
});

module.exports = router;