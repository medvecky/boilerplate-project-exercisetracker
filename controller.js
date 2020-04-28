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
    User.find({}, (err, docs) => res.json(docs)).select({count: 0, __v: 0});
};

const addExerciseToUserLog = (req, res) => {
    console.log("Add exercise log");
    console.log(req.body);
    let log;

    if(req.body.date === '') {
        log = {
            description: req.body.description,
            duration: req.body.duration
        };
    } else {
        log = {
            description: req.body.description,
            duration: req.body.duration,
            date: req.body.date
        };

    }

    User.findOneAndUpdate({_id: req.body.userId},
        {
            $push: {log: log},
            $inc: {count: 1},
        }, (err, docs) => (
            docs ? res.json(docs) : res.send('User does not exist.')));
};

const getUserLog = (req, res) => {

    const { userid } = req.params;
    const from = req.query['from'];
    const to = req.query['to'];
    const limit = req.query['limit'];

    console.log(from);
    console.log(to);
    console.log(limit);

    console.log(req.query);


    const fromFilter = (currentDate, fromDate) => (fromDate
        ? Date.parse(currentDate) > Date.parse(fromDate) : currentDate);

    const toFilter = (currentDate, toDate) => (toDate
        ? Date.parse(currentDate) < Date.parse(toDate) : currentDate);

    // User.findById(userid).then((user) => {
    //     const logs = user.log
    //         .filter(l => fromFilter(l.date, from))
    //         .filter(l => toFilter(l.date, to));
    //     if (limit && limit < logs.length) {
    //         res.send(logs.slice(0,limit));
    //     } else {
    //         res.send(logs);
    //     }
    // });

    User.findById(userid).then((user) => res.json(user));
};

module.exports = {
    addUser: addUser,
    getAllUsers: getAllUsers,
    addExerciseToUserLog: addExerciseToUserLog,
    getUserLog: getUserLog
};