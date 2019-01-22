const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');

const models = require('../models/index');
const ownCtl = require('../controllers/Owner');

router.get('/', (req, res) => {
    res.render('mylab')
});

router.get('/:lab_id', (req, res) => {
    var statistics = {}
    models.Lab.findOne({ where: { id: req.params.lab_id } })
        .then((lab) => {
            models.LabOwner.count({ where: { LabId: lab.id } }).then((cnt) => {
                statistics.numOwners = cnt;
                lab.getOwners().then((ownerList) => {
                    if (ownerList) {
                        if(ownerList.length) {
                        statistics.minBirth = new Date(ownerList.reduce((min, p) => p.birth_date < min ? p.birth_date : min, ownerList[0].birth_date)).toDateString();
                        statistics.maxBirth = new Date(ownerList.reduce((max, p) => p.birth_date > max ? p.birth_date : max, 0)).toDateString();
                        statistics.numFemale = ownerList.reduce((ftot,p) => p.gender ? (ftot+1):ftot,0);
                        statistics.numMale = cnt-statistics.numFemale;
                        }
                    }
                    // res.render('mylab', { name: lab.name, id: lab.id, statistics: statistics })
                    res.render('mylab', { name: lab.name, id: lab.id, Test: true })
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
});

router.get('/:lab_id/owners', (req, res) => {
    models.Lab.findOne({ where: { id: req.params.lab_id } }, { order: Sequelize.literal('id', 'ASC') })
        .then((lab) => {
            lab.getOwners({ order: Sequelize.literal('id', 'ASC') }).then((ownerList) => {
                res.render('mylab', { name: lab.name, id: lab.id, ownersList: ownerList });
            }).catch((err) => console.log(err))
        })
        .catch(err => console.log(err));
});

router.get('/:lab_id/owners/:owner_id/reverse', (req, res) => {

    ownCtl.deleteOwner(req.params.owner_id, req.params.lab_id).then((result) => {
        res.redirect(`/lab/${req.params.lab_id}/owners/`);
    }).catch((err) => {
        res.redirect(`/lab/${req.params.lab_id}/owners/`);
    })
});

router.get('/:lab_id/test', (req, res) => {
    models.Lab.findOne({ where: { id: req.params.lab_id } })
        .then((lab) => {
            lab.getOwners().then((ownerList) => {
                res.render('mylab', { name: lab.name, id: lab.id, Test: true });
            }).catch((err) => console.log(`lab.getOwners (/:lab_id/test). Exception:  ${err}`))
        })
        .catch(err => console.log(`lab.findOne (/:lab_id/test). Exception: ${err}`))
});

router.post('/:lab_id/test2', (req, res) => {
    delete req.body.file;

    console.log(`Adding ${JSON.stringify(req.body)}`)
    userObj={ userName: req.body.name, email: req.body.email, password: '12345'}
    // delete req.body.name;
    // delete req.body.email;
    // delete req.body.password;

    ownCtl.createOwner(req.body, userObj, req.params.lab_id).then((result) => {
    res.redirect(`/lab/${req.params.lab_id}/`);
    }).catch((err) => console.log(err));

});


module.exports = router;
