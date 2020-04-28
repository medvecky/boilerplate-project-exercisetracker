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
    const description = req.body.description;
    const duration = req.body.duration;
    const date = req.body.date;

    const logEntry = {description, duration};
    if (date) logEntry.date = Date.parse(date);

    User.findOneAndUpdate({_id: req.body.userId},
        {
            $push: {log: logEntry},
            $inc: {count: 1},
        }, (err, docs) => {
            if(err) {
                res.send('User does not exist.');
            } else {
               let returnValue = docs;
               console.log(docs);
               returnValue.count += 1;
               returnValue.log.push(logEntry);
               res.json(returnValue);
            }
        });

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

    User.findById(userid).then((user) => {
        if (user == null){
            res.send({"error":"User not found"});
        }else{
            let results = user.log;
            let userId = user._id;
            let userName = user.username;
            let count = user.count;
            let log = user.log;
            let fromDate = new Date(req.query.from);
            let toDate = new Date(req.query.to);
            let limit = Number(req.query.limit);
            //check if to is defined
            if (isValidDate(toDate)){
                log = log.filter((item) => (item.date >= fromDate && item.date <= toDate));
                //check if just from defined
            }else if(isValidDate(fromDate)){
                log = log.filter((item)=>(item.date >= fromDate))
            }
            //apply limit if defined and applicable
            if (!isNaN(limit) && results.length > limit){
                log = log.slice(0,limit);
            }

            res.json({
                _id: userId,
                username: userName,
                count: count,
                log
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