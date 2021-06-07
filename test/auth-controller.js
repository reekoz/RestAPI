const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller', function () {
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

    it('should throw an error with code 500 if accessing the database fails', async () => {
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: 'test@test.com',
                password: 'tester'
            }
        };

        const result = await AuthController.login(req, {}, () => {});
        expect(result).to.be.an('error');
        expect(result).to.have.property('statusCode', 500);
        User.findOne.restore();
    });

    it('should send a response with a valid user status for an existing user', async () => {
        const req = {
            params: {
                userId: '5c0f66b979af55031b34728a'
            }
        };

        const res = {
            statusCode: 500,
            userStatus: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userStatus = data.status;
            }
        };

        await AuthController.getStatus(req, res, () => {});
        expect(res.statusCode).to.be.equal(200);
        expect(res.userStatus).to.be.equal('I am new!');
    });
});