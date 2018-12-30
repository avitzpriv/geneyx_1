const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');

const models = require('../models/index');
const ownCtl = require('../controllers/Owner');

router.get('/', (req, res) => {
    res.render('mylab');
});

router.get('/:lab_id', (req, res) => {
    models.Lab.findOne({ where: { id: req.params.lab_id } })
        .then((lab) => {
            res.render('mylab',{name:lab.name,id:lab.id});
        })
        .catch(err => console.log(err));
});

router.get('/:lab_id/owners', (req, res) => {
    models.Lab.findOne({ where: { id: req.params.lab_id } })
        .then((lab) => {
            lab.getOwners().then((ownerList) => {
            res.render('mylab',{name:lab.name,id:lab.id,ownersList:ownerList});
            }).catch((err)=>console.log(err))
        })
        .catch(err => console.log(err));
});

router.get('/:lab_id/test', (req, res) => {
    models.Lab.findOne({ where: { id: req.params.lab_id } })
        .then((lab) => {
            lab.getOwners().then((ownerList) => {
            res.render('mylab',{name:lab.name,id:lab.id,Test:true});
            }).catch((err)=>console.log(err))
        })
        .catch(err => console.log(err));
});

router.get('/:lab_id/test2', (req, res) => {
    //console.log(req.body);
    console.log(req.query);
    //res.render('mylab',{name:lab.name,id:lab.id,Test:true});
    res.send('ko');
});

router.post('/:lab_id/newtest', (req, res) => {
    console.log(req.body);
    //ownCtl.createOwner(req.body.user_name,req.body.user_email,'12345',req.params.lab_id);
    res.redirect(`/lab/${req.params.lab_id}/test`);
});


module.exports = router;
