const express = require('express');

const models = require('../models/index');

module.exports = {
    createLab(obj) {
        return new Promise(function (resolve, reject) {
            models.Lab.create(obj).
                then((res) => {
                    console.log('new lab created');
                    resolve (res);
                })
                .catch((err) => {
                    console.log('error creating lab');
                    reject (err);
                })
        })
    }
}