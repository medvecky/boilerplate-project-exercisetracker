const mongoose = require('mongoose');
const model = require('./model');
const userSchema = model.userSchema;
const User = mongoose.model('User', userSchema);

const addUser = (req, res) => {
    const newUser = new User(req.body);
    newUser
        .save()
        .then(() => {
            res.json({
                username: newUser.username,
                _id: newUser._id
            });
        })
        .catch(() => res.send('User exists'));
};

const getAllUsers = (req, res) => {
    User.find({}, (err, docs) => res.json(docs)).select({count: 0, __v: 0, log: 0});
};

const addExerciseToUserLog = (req, res) => {
    const description = req.body.description;
    const duration = req.body.duration;
    const date = req.body.date;

    const logEntry = {description, duration};
    if (date) logEntry.date = new Date(date).toDateString();

    User.findOneAndUpdate({_id: req.body.userId},
        {
            $push: {log: logEntry},
            $inc: {count: 1},
        }, (err, docs) => {
            if (err) {
                res.send('User does not exist.');
            } else {
                let dateString;
                if (date) {
                    dateString = new Date(date).toDateString();
                } else {
                    dateString = new Date().toDateString();
                }
                let returnValue = {
                    username: docs.username,
                    _id: docs._id,
                    description: description,
                    duration: parseInt(duration),
                    date: dateString
                };
                res.json(returnValue);
            }
        });
};

const getUserLog = (req, res) => {

    const userId = req.query.userId;

    User.findById(userId).then((user) => {
        if (user == null) {
            res.send({"error": "User not found"});
        } else {
            let results = user.log;
            let userId = user._id;
            let userName = user.username;
            let count = user.count;
            let log = user.log;
            let fromDate = new Date(req.query.from);
            let toDate = new Date(req.query.to);
            let limit = Number(req.query.limit);

            if (isValidDate(toDate)) {
                log = log.filter((item) => (item.date >= fromDate && item.date <= toDate));
            } else if (isValidDate(fromDate)) {
                log = log.filter((item) => (item.date >= fromDate))
            }
            if (!isNaN(limit) && results.length > limit) {
                log = log.slice(0, limit);
            }

            res.json({
                username: userName,
                _id: userId,
                log,
                count: count
            });
        }
    });
};

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

module.exports = {
    addUser: addUser,
    getAllUsers: getAllUsers,
    addExerciseToUserLog: addExerciseToUserLog,
    getUserLog: getUserLog
};