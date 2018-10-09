# CodeBerry - Code Editor

## 0. Meta - what is this?
This is an inline code editor – you can edit HTML, CSS, JavaScript live in your browser.

## 1. Prerequisites
You need to have the repository cloned to your machine and have git, Node.js and Nodemon installed.

### 1.1. Clone the repository to your machine
* Open a command prompt
* Clone the repository to the `codeberry-codeeditor` directory:
```sh
git clone git@github.com:frkandris/codeberry-codeeditor.git`
```

### 1.2. Installing Node.js
* Go to https://nodejs.org/en/
* Download & install the version you prefer.

### 1.3. Installing Nodemon
* In the command promtp, with administrator permission, install Nodemon:
```sh
npm install -g nodemon
```

## 2. Running the application
### 2.1. Run the application in your command prompt
Type this in the command prompt to install modules, run the code & watch for changes in your application:
```sh
sh start.sh
```

Running this will start a Node.js server on your computer, which can be accessed at `http://localhost:3000` from your browser. Nodemon also watches for code changes, so if you change anything in your application folder (eg. you update your code, modify a file etc.), it restarts the Node.js server, so when you refresh your page in the browser, you’ll see the newest version all the time.

### 2.2. View the application from your browser
In your browser, type this to see the appilcation:
`http://localhost:3000`



## 3. Where is everything

A quick info about the folders & files.

### 3.1. Routing & server side logic for the editor

`routes/index.js`
This file handles the URLs we have (eg. `/edit/almafa`, `/view/almafa`), also handles the server side logic (showing the editor, saving data from the client)

### 3.2. Views

`views` directory 
This has the HTML files in it, instead of `.html` we use `.hbs`, as we are using Handlebars as a templating engine (it can handle including files, using variables and so on).

### 3.3. Assets

`public/assets/…` 
Here are all the css, img, js folders. If you want to access anything here, in the HTML code just use `/assets/...`

### 3.4. Default editor content

`public/content/defaultEditorContent` 
This folder has the default content of the newly created editors (it has an HTML, a CSS and a JS file with some default dummy content).

### 3.5. Default editor content

`public/content/editorContent` 
Every editor opened in the client has a folder here, with the latest saved state of the HTML, CSS and JS file they use.


## Built With
* HTML, CSS, JavaScript, jQuery, Bootstrap
* Node.JS, Express.JS
* Text Editor: [CodeMirror](https://codemirror.net)