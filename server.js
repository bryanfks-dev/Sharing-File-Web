const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');

require('dotenv').config();

const app = express();

// Init express session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Init static file path
app.use(express.static(__dirname + '/src'));

// Init bodyparser configuration
app.use(bodyParser.urlencoded({ extended: true }));

// Init multer disk storage with methods
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + '/saved_files');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Init upload class
const upload = multer({ storage: storage }).array('files');

const SERVER_PORT = process.env.SERVER_PORT || 5000;

const loginMsg = {
    message: ''
};

let SESSION_ID = 0;

// "/" route
app.route('/')
    .get((req, res) => {
        if (req.session.user) {
            res.redirect('/files');
            return;
        }

        res.sendFile(__dirname + '/src/view/html/login.html');
    })
    .post((req, res) => {
        if (req.session.user) {
            res.redirect('/files');
            return;
        }

        const userPasswordReq = req.body.password;

        // Validate password
        if (userPasswordReq !== process.env.LOGIN_PASSWORD) {
            // Set invalid login message
            loginMsg.message = 'Invalid password';

            // Redirect user back to login page
            res.redirect('/');

            return;
        }

        // Create user session
        req.session.user = ++SESSION_ID;

        res.redirect('/files');
    });

// "files" route
app.get('/files', (req, res) => {
    if (!req.session.user) {
        res.redirect('/');
        return;
    }

    res.sendFile(__dirname + '/src/view/html/files.html');
});

app.post('/upload_files', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/');
        return;
    }

    // Upload file logic here
    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            return;
        }

        initFileRoute();
    })
});

app.post('/rm_file', async (req, res) => {
    const cred = {
        filename: req.body.filename,
        password: req.body.password
    }

    // Validate password
    if (cred.password === process.env.DELETE_PASSWORD) {
        // Validate filename
        if (fs.existsSync(__dirname + `/saved_files/${cred.filename}`)) {
            fs.stat(__dirname + `/saved_files/${cred.filename}`);

            console.log(`${cred.filename} has been deleted`);

            initFileRoute();
        }
        else {
            console.log(`Filename with ${cred.filename} not exist in storage`);
        }
    }
    else {
        console.log("Someone tried to delete a file");
    }
});

// Function to initialize file routing
const initFileRoute = () => {
    const savedFilesDir = __dirname + '/saved_files';
    const files = fs.readdirSync(savedFilesDir);

    for (const file of files) {
        app.get(`/file/${file}`, (req, res) => {
            if (!req.session.user) {
                res.redirect('/');
                return;
            }

            res.download(`${savedFilesDir}/${file}`);
        });
    }
}

initFileRoute();

// API route
app.get('/api/loginMsg', (req, res) => {
    if (req.session.user) {
        res.redirect('/files');
        return;
    }

    res.json(loginMsg);

    // Reset login message
    loginMsg.message = '';
});

app.get('/api/filesData', (req, res) => {
    if (!req.session.user) {
        res.redirect('/');
        return;
    }

    const data = {
        fileNames: [],
        filesLinks: []
    };

    // Read 'save_files' dir
    const files = fs.readdirSync(__dirname + '/saved_files')
        .filter((name) => !name.startsWith("."));

    // Push all file data into object
    for (const file of files) {
        data.fileNames.push(file);
        data.filesLinks.push(`/file/${file}`);
    }

    res.json(data);
});

app.get('/*', (req, res) => {
    res.redirect('/');
})

// Listen to port
app.listen(SERVER_PORT, () => {
    console.log('Server is running on port ' + SERVER_PORT);
});