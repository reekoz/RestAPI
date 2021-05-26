const express = require('express');
const {
  json
} = require('body-parser');
const mongoose = require('mongoose');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const helmet = require('helmet');
const compression = require('compression');
const logger = require('./services/logger');

const app = express();

app.use(helmet());
app.use(compression());

app.use(json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  logger.error(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data,
  });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_ADDRESS}/${process.env.MONGO_DEFAULT_DATABASE}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(result => {
    const port = process.env.PORT || 3000;
    logger.info('Connected to MongoDB');
    const server = app.listen(port, () => logger.info(`Start listening to request on pFort: ${port}`));
    const io = require('./services/socket').init(server);
    io.on('connection', socket => {
      logger.info('[SOCKET.IO] Client connected');
    });
  })
  .catch(err => logger.error(error));