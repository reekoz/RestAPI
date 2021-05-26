const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');
const io = require('../services/socket');
const unsplash = require('../services/unsplash');
const logger = require('../services/logger');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = req.query.perPage || 6;

  try {
    const totalItems = await Post.countDocuments();

    const posts = await Post.find()
      .populate('creator')
      .sort({
        createdAt: -1,
      })
      .skip((currentPage - 1) * perPage)
      .limit(+perPage);

    res.status(200).json({
      message: 'Fetched posts successfully',
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    next(error);
  }

  const title = req.body.title;
  const content = req.body.content;

  logger.info(`Try to get random photo with title '${title}'`);

  let image = await unsplash.getRandomPhoto(title, 50, 10);

  const imageUrl = image ? image.urls.small : null;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  logger.info('Creating Post ' +  JSON.stringify(post, null, 4));

  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();

    const totalItems = await Post.countDocuments();

    io.getIO().emit('posts', {
      action: 'create',
      post: {
        ...post._doc,
        creator: {
          _id: req.userId,
          name: user.name,
        },
      },
      totalItems: totalItems,
    });

    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: {
        _id: user._id,
        name: user.name,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId).populate('creator');

    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Post fetched',
      post: post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    next(error);
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl;

  try {
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    if (title !== post.title) {
      const image = await unsplash.getRandomPhoto(title, 50, 10);
      imageUrl = image ? image.urls.small : post.imageUrl;
    } else imageUrl = post.imageUrl;

    if (post.creator._id.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    logger.info('Updateing post ' +  JSON.stringify(post, null, 4));

    const result = await post.save();

    const totalItems = await Post.countDocuments();

    io.getIO().emit('posts', {
      action: 'update',
      post: result,
      totalItems: totalItems,
    });

    res.status(200).json({
      message: 'Post updated',
      post: result,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    
    logger.info('Deleting post ' +  JSON.stringify(post, null, 4));

    await Post.findByIdAndRemove(postId, { useFindAndModify: false });
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    io.getIO().emit('posts', {
      action: 'delete',
      post: postId,
    });

    res.status(200).json({
      message: 'Post deleted',
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
