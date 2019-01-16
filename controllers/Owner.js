//const sequelize = require('sequelize');
const express = require('express');
const bcrypt = require('bcryptjs');

const models = require('../models/index');

module.exports.createOwner = {
    createOwner(ownerObj, userObj, labid = null) => {
        return true;
        return models.sequelize.transaction(function (t) {

            if (labid) {
                return models.Lab.findOne({
                    where: { id: labid }
                }, { transaction: t }).then((labRecord) => {
                    // lab found
                    // create owner details
                    return models.Owner.create(ownerObj, { transaction: t }).then((ownerRecord) => {
                        // create owner info

                        idstr = '' + ownerRecord.id;
                        return models.OwnerInfo.create({
                            owner_id: bcrypt.hashSync(idstr, 8),
                            name: ownerObj.name
                        },{transaction:t}).then((oiRecord) => {
                            userObj.type=2; // owner
                            userObj.ownerId=ownerRecord.id;
                            return models.User.create(userObj).then((userRecord) => {
                                return ({ l: labRecord, o: ownerRecord, u:userRecord })
                            })
                        })
                    })
                })
            }
            else {
                console.log(`Owner Obj: ${JSON.stringify(ownerObj)}`);
                return models.Owner.create(
                    ownerObj
                , { transaction: t }).then((ownerRecord) => {
                    // create owner info
                    var idstr = '' + ownerRecord.id;
                    return models.OwnerInfo.create({
                        owner_id: bcrypt.hashSync(idstr, 8),
                        name: ownerObj.name
                    }, { transaction: t }).then((oiRecord) =>{
                        userObj.type=1; //admin
                        return models.User.create(userObj);
                    })
                })
            }

        }).then(function (result) {
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
            if (result.l) {
                return result.o.setLabs(result.l).then((res) => {
                    console.log('Owner controller success, in create user');
                }).catch((err) => console.log('Association failed:', err));
            }
        }).catch(function (err) {
            console.log("*** Create User General Error ***");
            console.log(err);
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
        });
    },
    deleteOwner: (ownerId, labid = null) => {
        return models.sequelize.transaction(function (t) {

            if (labid) {
                console.log(`deleting: ${ownerId} from ${labid}`);
                return models.Owner.findOne({
                    where: { id: ownerId }
                }, { transaction: t }).then((ownerRecord) => {
                    // Owner found
                    // mark as deleted
                    console.log(`Owner: ${ownerRecord.name}`);
                    var toDel = (ownerRecord.deleted) ? false : true;
                    return ownerRecord.update({ deleted: toDel }, { transaction: t }).
                        then((result) => {
                            console.log(`toDel: ${toDel}`);
                            return models.LabOwner.findOne({
                                    where: {
                                        OwnerId: ownerId,
                                        LabId: labid
                                    }
                                }, { transaction: t }).then((labOwnerRecord) => {
                                    console.log('labownerrec: ',JSON.stringify(labOwnerRecord));
                                    console.log(`todel: ${toDel}`);
                                    return labOwnerRecord.update({deleted:toDel},{transaction:t});
                                })
                        })
                })
            }
            else {
                return models.Owner.findOne({ where: { id: ownerId } }, { transaction: t })
                    .then((ownerRecord) => {
                        toDel = (ownerRecord.deleted) ? false : true;
                        return ownerRecord.update({ deleted: toDel }, { transaction: t });
                    })
            }

        }).then(function (result) {
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
            if (result.l) {
                console.log('owner deleted');            
            }

        }).catch(function (err) {
            console.log("*** Delete User General Error ***");
            console.log(err);
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
        });
    }
