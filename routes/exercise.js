const express = require('express');
const router = express.Router();

const controller =  require('../controller');
const addUser = controller.addUser;
const getAllUsers = controller.getAllUsers;
const addExerciseToUserLog  = controller.addExerciseToUserLog;
const getUserLog = controller.getUserLog;

router.post('/new-user', addUser);
router.get('/users', getAllUsers);
router.post('/add', addExerciseToUserLog);
router.get('/log/:userid', getUserLog);


module.exports = router;
