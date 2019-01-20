const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const models = require('../models/index');

// router.post('/', (req,res) => {
//     console.log(`Username ${JSON.stringify(req.body)}`)
//     res.send('OK!');
// });


passport.use(new localStrategy(function(username, password, done) {
    username = username.toLowerCase();
    console.log(`Passport checking login ${username},${password}`);
    models.User.findOne({where : {email : username}}).then((userRecord) => {
        console.log(userRecord);
        console.log(`user ${username} found ${JSON.stringify(userRecord)}`);
        // user is an owner -> check password
        if(!bcrypt.compare(password, userRecord.password)) {
            // no match
            return done(null, false, {message : 'invalid username or password'});
        } else {
            return done(null, userRecord);
        }
    }).catch((err) =>{
            // user is also not a lab => no such user
            console.log('Error:',err)
            return done(null, false,{message : 'invalid user or password'});
        });
    }));

// router.post('/',
//     passport.authenticate('local', { failWithError: true }),
//     function(req, res, next) {
//     // handle success
//     if (req.xhr) { return res.json({ id: req.user.id }); }
//     return res.redirect('/');
//     },
//     function(err, req, res, next) {
//     // handle error
//     if (req.xhr) { return res.json(err); }
//     console.log(`Error: ${err}`);
//     return res.redirect('/kuji');
//     }
// );
router.post('/',
    passport.authenticate('local',{
        failureRedirect : '/',
        failureFlash : 'invalid username or password'
    }),
    (req,res) => {
        console.log('Checking login');
        req.flash('success','You are now logged in');
        res.redirect('/');
    }
);

passport.serializeUser((user,done) => {
    if(user.type===3) {
        console.log('Lab');
    } else {
        console.log('Owner');
    }

    done(null,user.id);
})

passport.deserializeUser((id, done) => {
   
    console.log(`deserialilze ${id}`);

    models.User.findOne({where : {id : id}}).then((userRecord) => {
        console.log(`User found ${userRecord.type}`);
        if(userRecord.OwnerId) {
            models.Owner.findOne({where:{id:userRecord.OwnerId}}).then((ownerRecord) =>{
                console.log(`Owner ${ownerRecord.identity}`);
                done(null,ownerRecord);
            }).catch((err) =>{console.log(err)})
        }
        if(userRecord.LabId) {
            models.Lab.findOne({where:{id:userRecord.LabId}}).then((labRecord) =>{
                console.log(`Lab ${labRecord.name}`);
                done(null,labRecord);
            }).catch((err) =>{console.log(err)})
        }
        else {
            console.log(`Admin!!`);
            done(null,userRecord)
        }
        //
    }).catch((err) => {
        console.log('Deserialize Error')
        done(err, null);
    })
})


module.exports = router;
