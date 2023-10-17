const express = require('express');
const UserModel = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const routes = express.Router();

// duumy api for testing
routes.get('/dummyapi', (req, res) => {
    res.send("dummy api working");
})


// user login api
routes.get('/login', async  (req, res) => {
    // validate user req body (username and password);
    console.log(req.body);
    if (!req.body.userName) {
        res.status(400).send("username can not be empty");
    } else if (!req.body.password) {
        res.status(400).send("password can not be empty");
    } else {
        // validate from mongodb
        let user = await UserModel.findOne({ userName: req.body.userName});
        if (!user) {
            return res.status(400).json("Invalid Cardentials");
        }
       let isMatch = await bcrypt.compare(req.body.password,user.password)
       if (!isMatch) {
        return res.status(400).json("invalid cardentials");
       }
       const payload = {
        id: user._id,
        name: req.body.name,
    }
    const token = await jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:
    32556926})
    console.log(token);
    res.json({
        success: true,
        id: user._id,
        userName: user.userName,
        name: user.name,
        token: token
    })
    }
})

// user signup api
routes.get('/', async (req, res) => {
    // from user api header
    let token = req.headers.auth;
    // check token is present
    if (!token) {
        return res.status(400).json("unauthorized no token");
    }
    // validating token 0 => payload, 1=>secret, 2=>option with expiry
    let jwtUser;
    try {
        jwtUser = await jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    } catch (err) {
        console.log(err);
        return res.status(400).json("invalid token");
    }
    console.log({ jwtUser });
    // jwtUser is alooged in user
    if (!jwtUser) {
        return res.status(400).json("unauthorized");
    }
    // find all users and send 
    let users = await UserModel.aggregate()
        .project({
            password: 0,
            date: 0,
            __v: 0
        });
    res.send(users)
})

module.exports = routes;