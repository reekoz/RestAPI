const express = require('express');
const { body } = require('express-validator/check');
const { createApi } = require('unsplash-js');
const nodeFetch = require('node-fetch');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post(
  '/post',
  isAuth,
  [
    body('title').trim().isLength({
      min: 5,
    }),
    body('content').trim().isLength({
      min: 5,
    }),
  ],
  feedController.createPost
);

// GET /feed/post/:postId
router.get('/post/:postId', isAuth, feedController.getPost);

// PUT /feed/post/:postId
router.put(
  '/post/:postId',
  isAuth,
  [
    body('title').trim().isLength({
      min: 5,
    }),
    body('content').trim().isLength({
      min: 5,
    }),
  ],
  feedController.updatePost
);

// DELETE /feed/post/:postId
router.delete('/post/:postId', isAuth, feedController.deletePost);

// GET /auth/status
router.get('/status', isAuth, feedController.getStatus);

// PUT /auth/status
router.put(
  '/status',
  isAuth,
  [body('status').trim().notEmpty()],
  feedController.updateStatus
);

// GET /feed/photo
router.get('/photo', isAuth, async (req, res, next) => {
  try {
    const unsplash = createApi({
      accessKey: process.env.UNSPLASH_KEY,
      fetch: nodeFetch
    });

    const result = await unsplash.search.getPhotos({
      query: req.query.term
    });

    if (result.errors) {
        const error = new Error(result.errors.join(', '));
        error.statusCode = 500;
        throw error;
    }

    res.status(200).json({
      message: 'Fetched photo successfully',
      photo: result.response
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
});

module.exports = router;
