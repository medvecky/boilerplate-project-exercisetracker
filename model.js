const mongoose = require('mongoose');
const shortid = require('shortid');

const { Schema } = mongoose;

const exerciseSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    duration:{
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const userSchema = new Schema({
    _id: {
        type: String,
        default: shortid.generate,
    },
    username: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    log: [exerciseSchema],
});

userSchema.pre('save', function (next) {
    const self = this;
    mongoose.models.User.findOne({ username: self.username }, (err, user) => {
        if (!user) {
            next();
        } else {
            next(new Error('Username already exists!'));
        }
    });
});

module.exports = {
    exerciseSchema: exerciseSchema,
    userSchema: userSchema
}