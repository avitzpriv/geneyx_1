//const sequelize = require('sequelize');
const express = require('express');
const bcrypt = require('bcryptjs');

const models = require('../models/index');

module.exports = {
    createOwner(name, email, password, labid = null) {
        return models.sequelize.transaction(function (t) {

            if (labid) {
                return models.Lab.findOne({
                    where: { id: labid }
                }, { transaction: t }).then((labRecord) => {
                    // lab found
                    // create owner details
                    return models.Owner.create({
                        name: name,
                        email: email,
                        password: password
                    }, { transaction: t }).then((ownerRecord) => {
                        // create owner info

                        idstr = '' + ownerRecord.id;
                        return models.OwnerInfo.create({
                            owner_id: bcrypt.hashSync(idstr, 8),
                            name: name
                        }).then((oiRecord) => {
                            return ({ l: labRecord, o: ownerRecord })
                        })
                    })
                })
            }
            else {
                return models.Owner.create({
                    name: name,
                    email: email,
                    password: password
                }, { transaction: t }).then((ownerRecord) => {
                    // create owner info
                    var idstr = '' + ownerRecord.id;
                    return models.OwnerInfo.create({
                        owner_id: bcrypt.hashSync(idstr, 8),
                        name: name
                    }, { transaction: t })
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
    }
}
