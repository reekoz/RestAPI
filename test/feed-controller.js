const expect = require('chai').expect;
const mongoose = require('mongoose');

const User = require('../models/user');
const FeedController = require('../controllers/feed');

describe('Feed Controller', function () {
    before(function (done) {
        mongoose
            .connect(
                `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_ADDRESS}/test-messages`, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }
            )
            .then(result => {
                const user = new User({
                    email: 'test@test.com',
                    name: 'prpepe',
                    password: 'tester',
                    posts: [],
                    _id: '5c0f66b979af55031b34728a'
                });
                return user.save();
            })
            .then(() => {
                done();
            });
    });
    
    after(async () => {
        await User.deleteMany({});
        mongoose.disconnect();
    });
});