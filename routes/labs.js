const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');

const models = require('../models/index');

router.get('/', (req, res) => {
    models.Lab.findAll()
        .then((labs) => {
            console.log("LABS ARE:" + labs);
            res.render('labs', { labs });
        })
        .catch(err => console.log(err));
});

router.get('/add', (req, res) => {
    res.render('addlab');
});

router.post('/added', (req, res) => {
    console.log(req.body);
    models.Lab.create(req.body).
        then((record) => {
            console.log('new lab created');
            res.redirect(`/labs/${record.id}`);
        })
        .catch((err) => {
            console.log('error creating lab');
            res.redirect('/labs');
        })
});

router.get('/:lab_id', (req, res) => {
    models.Lab.findAll({ where: { id: req.params.lab_id } })
        .then((lab) => {
            lab[0].getOwners()
                .then((ownersList) => {
                    res.render('lab', { lab, ownersList });
                    //console.log('list ::: ' + JSON.stringify(ownersList[0]));
                    // res.send('OK');
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

module.exports = router;
