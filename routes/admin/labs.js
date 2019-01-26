const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');

const models = require('../../models/index');
const ownCtl = require('../../controllers/Owner');

router.get('/', (req, res) => {
    models.Lab.findAll({ order : Sequelize.literal('id','ASC') })
        .then((labs) => {
            res.render('labs', { labs });
        })
        .catch(err => console.log(err));
});

router.get('/add', (req, res) => {
    res.render('addlab',{
        update:false,
        title : 'Add',
        button: 'Add Lab',
        record: {
        //copy from model
        name: 'Lab name',
        address: 'Lab Address',
        user_name: 'Lab User Name',
        user_email: 'Lab User E-mail',
        user_pass: 'Lab User Password', // encrypted
        }
    });
});

router.post('/added', (req, res) => {
    return models.sequelize.transaction(t => {
        labObj = {
            name: req.body.name,
            address: req.body.address,
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
            return models.User.create(userObj).then((userRecord) =>{
                console.log(`user: ${userObj.userName} has been created (id:${userRecord.id})`)
            });
        })

    }).
    then((record) => {
        res.redirect(`/admin/labs`);
    })
    .catch((err) => {
        console.log('error creating lab');
        res.redirect('admin/labs');
    })
});

router.post('/edit/update', (req, res) => {
    models.Lab.findOne({where:{id : req.body.id}}).then((lab) =>{
        lab.update(req.body).
        then((result) => {
            console.log('new lab updated');
            res.redirect(`/admin/labs`);
        })
        .catch((err) => {
            console.log('error updating lab');
            res.redirect('/admin/labs');
        })
    }).catch((err) => {
        console.log('error updating lab');
        res.redirect('/admin/labs');
    });

});

router.get('/:lab_id', (req, res) => {
    models.Lab.findAll({ where: { id: req.params.lab_id } },
        { order : Sequelize.literal('id','ASC') }
    ).then((lab) => {
            lab[0].getOwners({ order : Sequelize.literal('id','ASC') })
                .then((ownersList) => {
                    lab[0].getUsers().then((usersList) =>{
                        res.render('lab', { lab, ownersList, usersList });
                    })
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

router.get('/reverse/:lab_id', (req, res) => {
    models.Lab.findAll({ where: { id: req.params.lab_id } },
        { order : Sequelize.literal('id','ASC') }
    ).then((lab) =>{
        var toDel = (lab[0].deleted) ? false:true;
        lab[0].update({ deleted: toDel }, { where: { id : req.params.lab_id } }).
        then((result) => {
            res.redirect('/admin/labs');
        }).catch((err)=>console.log('error deleting lab (B) : ',err));
    }).catch((err) => console.log('error deleting lab (A) : ',err))
});

router.get('/:lab_id/owners/:owner_id/reverse',(req,res) =>{
    ownCtl.deleteOwner(req.params.owner_id,req.params.lab_id).then((result)=>{
    res.redirect(`/admin/labs/${req.params.lab_id}`);
    }).catch((err)=>{
        res.redirect(`/admin/labs/${req.params.lab_id}`);
    })
})

router.get('/edit/:lab_id', (req, res) => {
    models.Lab.findAll({ where: { id: req.params.lab_id } },{ order : Sequelize.literal('id','ASC') })
    .then((lab) =>{
        res.render('addlab',{
            update:true,
            title:'Edit', 
            button:'Update Lab Details',
            record : lab[0].dataValues});
    }).catch((err) => console.log('error editing lab (A) : ',err))
});

module.exports = router;
