const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authentication');

    if (!authHeader) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        next(error);
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'mysupersecretscretsecret');
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        next(error);
    }

    req.userId = decodedToken.userId;
    next();
};