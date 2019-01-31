const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
// const passport = require('passport');
// const localStrategy = require('passport-local').Strategy;
// const bcrypt = require('bcryptjs');

const models = require('../models/index');

router.get('/', (req,res) => {
res.render('signup',{ layout: 'signup', message: req.flash() })
});

router.post('/next',(req,res) => {
console.log(`${JSON.stringify(req.body)}`)

    res.render('signup2',{ layout: 'signup', message: req.flash(), role:req.body.role, country:req.body.country});
})

router.post('/addlab',(req,res) => {
    console.log(`${JSON.stringify(req.body)}`)
    return models.sequelize.transaction(t => {
        labObj = {
            name: req.body.name,
            address: req.body.address,
            country: req.body.country,
            phone: req.body.phone,
            additional: req.body.info1,
            license: req.body.license,
            issued: req.body.issued,
            expiry: req.body.expiry,
            updates: req.body.updates
        }
        return models.Lab.create(labObj,{transaction:t}).then((labRecord) =>{
            console.log('Lab created');
            userObj = {userName:req.body.name,
                       email:req.body.email,
                       type:3,
                       LabId: labRecord.id,
                       password: req.body.password }
            console.log(`User => ${JSON.stringify(userObj)}`)
            return models.User.create(userObj).then((userRecord) =>{
                console.log(`user: ${userObj.userName} has been created (id:${userRecord.id})`)
            });
        })

    }).
    then((record) => {
        res.redirect(`/`);
    })
    .catch((err) => {
        console.log('error creating lab');
        res.send(`Err: ${err}`)
        //res.redirect('admin/labs');
    })
})


module.exports = router;
