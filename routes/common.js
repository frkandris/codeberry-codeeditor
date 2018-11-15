const fs = require('fs');

const assignmentDefinitionsRootFolder = './public/content/assignment-definitions/'; 
const studentSubmissionsRootFolder = './public/content/student-submissions/';


function checkAssignmentDefinitionIdIntegrity(assignmentDefinitionId){

    const assignmentDefinitionIdSafe = assignmentDefinitionId.replace(/[^a-zA-Z0-9\-]/g, '').substring(0,255);
    if (assignmentDefinitionId != assignmentDefinitionIdSafe) {
        return false;
    };

    const dir = assignmentDefinitionsRootFolder + assignmentDefinitionIdSafe + '/';
    if (!fs.existsSync(dir)) {
        createAssignmentDefinition(assignmentDefinitionIdSafe);
    }

    return true;
}


function checkStudentIdIntegrity(studentId){

    const studentIdSafe = studentId.replace(/[^a-zA-Z0-9\-]/g, '').substring(0,255);
    if (studentId != studentIdSafe) {
        return false;
    };

    const studentSubmissionFolder = studentSubmissionsRootFolder + studentIdSafe + '/';
    if (!fs.existsSync(studentSubmissionFolder)) {
        createStudent(studentIdSafe);
    }

    return true;
}


function getStudentSubmissionContent(fileName, assignmentDefinitionId, studentId) {

    try {
        const studentAssignmentFolder = studentSubmissionsRootFolder + studentId + '/' + assignmentDefinitionId + '/';
        contentText = fs.readFileSync(studentAssignmentFolder + fileName, 'utf8');
    } catch (err) {
        const defaultAssignmentDefinitionFolder = assignmentDefinitionsRootFolder + assignmentDefinitionId + '/';
        contentText = fs.readFileSync(defaultAssignmentDefinitionFolder + fileName, 'utf8');
    }

    return contentText;
}


function saveStudentSubmissionContent(contentText, fileName, assignmentDefinitionId, studentId) {
    const studentAssignmentFolder = studentSubmissionsRootFolder + studentId + '/' + assignmentDefinitionId + '/';
    // If it does not exist, create it
    if (!fs.existsSync(studentAssignmentFolder)) {
        fs.mkdirSync(studentAssignmentFolder, err => {})
    }
    fs.writeFileSync(studentAssignmentFolder + fileName, contentText, 'utf-8');
}


function saveAssignmentDefinitionContent(contentText, fileName, assignmentDefinitionId) {
    const assignmentDefinitionFolder = assignmentDefinitionsRootFolder + assignmentDefinitionId + '/';
    if (!fs.existsSync(assignmentDefinitionFolder)) {
        fs.mkdirSync(assignmentDefinitionFolder, err => {})
    }
    fs.writeFileSync(assignmentDefinitionFolder + fileName, contentText, 'utf-8');
}


function getAssignmentDefinitionContent(fileName, assignmentDefinitionId){
    const assignmentDefinitionFolder = assignmentDefinitionsRootFolder + assignmentDefinitionId + '/';
    contentText = fs.readFileSync(assignmentDefinitionFolder + fileName, 'utf8');
    return contentText;
}


function createStudent(studentId) {
    const studentSubmissionFolder = studentSubmissionsRootFolder + studentId + '/';
    // If it does not exist, create it
    if (!fs.existsSync(studentSubmissionFolder)) {
        fs.mkdirSync(studentSubmissionFolder, err => {})
    }
}


function createAssignmentForStudent(studentId, assignmentDefinitionId) {
    const studentAssignmentFolder = studentSubmissionsRootFolder + studentId + '/' + assignmentDefinitionId + '/';
    // If it does not exist, create it
    if (!fs.existsSync(studentAssignmentFolder)) {
        fs.mkdirSync(studentAssignmentFolder, err => {})
    }
    let assignmentText = getAssignmentDefinitionContent('assignment.css', assignmentDefinitionId);
    saveStudentSubmissionContent(assignmentText, 'assignment.css', assignmentDefinitionId, studentId);
}


function createAssignmentDefinition(assignmentDefinitionId) {
    saveAssignmentDefinitionContent('<h1>Your assignment is to make the background red.</h1>', 'index.html', assignmentDefinitionId);
    saveAssignmentDefinitionContent('body{background:#fff;}', 'index.css', assignmentDefinitionId);
    saveAssignmentDefinitionContent('', 'index.js', assignmentDefinitionId);
    saveAssignmentDefinitionContent('$("body").css("background") == "rgb(255, 0, 0)";', 'validator.js', assignmentDefinitionId);
    saveAssignmentDefinitionContent("body {\n\tbackground:#ff0;\n}", 'assignment.css', assignmentDefinitionId);
}

module.exports = {
    checkAssignmentDefinitionIdIntegrity, 
    checkStudentIdIntegrity, 
    getStudentSubmissionContent, 
    getAssignmentDefinitionContent,
    saveStudentSubmissionContent, 
    saveAssignmentDefinitionContent,
    createStudent,
    createAssignmentForStudent,
    createAssignmentDefinition
};