const express = require('express');
const {
    json
} = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const {
    v4: uuidv4
} = require('uuid');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const {
    mongo
} = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '_' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/'))
        cb(null, true);
    else
        cb(null, false);
};

app.use(helmet());
app.use(compression());

app.use(json());

app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image'));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authentication');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    });
});

mongoose
    .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_ADDRESS}/${process.env.MONGO_DEFAULT_DATABASE}`)
    .then(result => {
        const server = app.listen(process.env.PORT || 3000);
        const io = require('./socket').init(server);
        io.on('connection', socket => {
            console.log('Client connected');
        });
    }).catch(err => console.log(err));