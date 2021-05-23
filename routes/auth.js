const express = require('express');
const { body } = require('express-validator/check');
const User = require('../models/user');
const isAuth = require('../middleware/is-auth');

const authController = require('../controllers/auth');

const router = express.Router();

// PUT /auth/signup
router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        return User.find({
          email: value,
        }).then(userDoc => {
          if (userDoc && userDoc.length > 0)
            return Promise.reject('E-Mail address already exists!');
        });
      })
      .normalizeEmail(),
    body('password').trim().isLength({
      min: 5,
    }),
    body('name').trim().notEmpty(),
  ],
  authController.signup
);

// POST /auth/login
router.post('/login', authController.login);

// GET /auth/status
router.get('/status/:userId', isAuth, authController.getStatus);

// PUT /auth/status
router.put(
  '/status/:userId',
  isAuth,
  [body('status').trim()],
  authController.updateStatus
);

// PUT /auth/settings
router.put(
  '/settings/:userId',
  [
    body('name').trim().notEmpty(),
    body('themeMode').trim().notEmpty(),
    body('color').trim().notEmpty(),
    body('shade').trim(),
  ],
  authController.updateSettings
);

module.exports = router;
