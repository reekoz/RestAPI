const express = require('express');
const {
    body
} = require('express-validator/check');
const User = require('../models/user');

const authController = require('../controllers/auth');

const router = express.Router();

// PUT /auth/signup
router.put('/signup', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, {
        req
    }) => {
        return User
            .find({
                email: value
            })
            .then(userDoc => {
                if (userDoc && userDoc.length > 0)
                    return Promise.reject('E-Mail address already exists!')
            })

    })
    .normalizeEmail(),
    body('password')
    .trim()
    .isLength({
        min: 5
    }),
    body('name')
    .trim()
    .notEmpty()
], authController.signup);

// POST /auth/login
router.post('/login', authController.login);

module.exports = router;