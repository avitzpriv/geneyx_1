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
            res.render('mylab', { name: lab.name, id: lab.id });
        })
        .catch(err => console.log(err));
});

router.get('/:lab_id/owners', (req, res) => {
    models.Lab.findOne({ where: { id: req.params.lab_id } })
        .then((lab) => {
            lab.getOwners().then((ownerList) => {
                res.render('mylab', { name: lab.name, id: lab.id, ownersList: ownerList });
            }).catch((err) => console.log(err))
        })
        .catch(err => console.log(err));
});

router.get('/:lab_id/test', (req, res) => {
    models.Lab.findOne({ where: { id: req.params.lab_id } })
        .then((lab) => {
            lab.getOwners().then((ownerList) => {
                res.render('mylab', { name: lab.name, id: lab.id, Test: true });
            }).catch((err) => console.log(err))
        })
        .catch(err => console.log(err));
});

router.post('/:lab_id/test2', (req, res) => {

    req.body.password = '12345';
    delete req.body.file;
    console.log(req.body);

    pp = ownCtl.createOwner(req.body, req.params.lab_id);

    res.redirect(`/lab/${req.params.lab_id}/`);
});


module.exports = router;
