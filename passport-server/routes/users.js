var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;


var User = require('../models/user');


passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {message: 'Unknown User'});
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }));

var jwtOptions = {}


jwtOptions.jwtFromRequest = ExtractJwt.fromHeader("authorization");
jwtOptions.secretOrKey = 'secret';

var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);
    // usually this would be a database call:
    User.getUserById(jwt_payload.id, function(err, user) {
        if (user) {
            next(null, user);
        } else {
            next(null, false);
        }
    });
});

passport.use(strategy);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});


router.get('/user', passport.authenticate('jwt', {session: false}), function (req, res) {
    res.send(req.user);
})


router.post('/user', passport.authenticate('jwt', {session: false}), function (req, res) {
    var user = req.body;
    delete user._id;
    delete user.username;


    var c = function (err, user) {
        if (err) res.status(500)
        res.send(user);
    }


    if (user.password) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                user.password = hash;
                User.updateUser(req.user._id, user, c)
            })
        })
    } else {
        User.updateUser(req.user._id, user, c)
    }

})

router.get('/delete', passport.authenticate('jwt', {session: false}), function (req, res) {

    User.deleteUser(req.user._id, (err, user) => {
        if (err) res.status(500)
        res.send(user);
    })
})


// Register User
router.post('/register', passport.authenticate('jwt', {session: false}), function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        res.status(401)
        res.send(errors)
    } else {
        var newUser = new User({
            username: username,
            password: password
        });

        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log("create user", user);
        });


        res.send(newUser);
    }
});


router.post('/login',
    passport.authenticate('local', {session: false}),
    function (req, res) {
        console.log("login", req.user);

        var payload = {id: req.user._id};
        var token = jwt.sign(payload, jwtOptions.secretOrKey)
        res.send({message: "ok", token: token})

    });

module.exports = router;