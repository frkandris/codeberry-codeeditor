var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var randomWords = require('random-words');
var common = require('./common');



/* Render a code editor page */

router.get('/v/edit/:assignmentDefinitionId/', function (req, res) {

  const assignmentDefinitionId = req.params.assignmentDefinitionId;

  // If something sketchy is going on, redirect to a safe editor URL
  if (common.checkAssignmentDefinitionIdIntegrity(assignmentDefinitionId)==false) {
    res.redirect('/a/');
  }

  htmlText = common.getAssignmentDefinitionContent('index.html', assignmentDefinitionId);
  cssText = common.getAssignmentDefinitionContent('index.css', assignmentDefinitionId);
  javascriptText = common.getAssignmentDefinitionContent('index.js', assignmentDefinitionId);
  validatorText = common.getAssignmentDefinitionContent('validator.js', assignmentDefinitionId);
  assignmentText = common.getAssignmentDefinitionContent('assignment.css', assignmentDefinitionId);

  // Render page
  res.render('editor-assignment-editor', { 
    assignmentDefinitionId: assignmentDefinitionId,
    htmlText: htmlText,
    cssText: cssText,
    javascriptText: javascriptText,
    validatorText: validatorText,
    assignmentText: assignmentText
  });

})


/* Save Ajax edit requests coming from the client. */

router.post('/v/save/', function(req, res, next) {

  const assignmentDefinitionId = req.body.assignmentDefinitionId;
  const htmlText = req.body.htmlText;
  const cssText = req.body.cssText;
  const javascriptText = req.body.javascriptText;
  const validatorText = req.body.validatorText;
  const assignmentText = req.body.assignmentText;

  // If something sketchy is going on, do not save, just return
  if (common.checkAssignmentDefinitionIdIntegrity(assignmentDefinitionId)==false) {
    res.end();
  }

  common.saveAssignmentDefinitionContent(htmlText, 'index.html', assignmentDefinitionId);
  common.saveAssignmentDefinitionContent(cssText, 'index.css', assignmentDefinitionId);
  common.saveAssignmentDefinitionContent(javascriptText, 'index.js', assignmentDefinitionId);
  common.saveAssignmentDefinitionContent(validatorText, 'validator.js', assignmentDefinitionId);
  common.saveAssignmentDefinitionContent(assignmentText, 'assignment.css', assignmentDefinitionId);

  res.end();
});


// /* Handling URLs without assignmentDefinitionId, eg. '/', '/edit', '/view' */

// function redirectToNewEditorCreater(req, res, next) {

//   // Create new assignmentDefinitionId with 3 random words, separated by '-'
//   var assignmentDefinitionId = randomWords({exactly:1, wordsPerString:3, separator:'-'});

//   // Redirect to open a new editor
//   res.redirect('/v/edit/' + assignmentDefinitionId);
// };

// router.get('/v/', redirectToNewEditorCreater);
// router.get('/v/edit', redirectToNewEditorCreater);
// router.get('/v/view', redirectToNewEditorCreater);





module.exports = router;