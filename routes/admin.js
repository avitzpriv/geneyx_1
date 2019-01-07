const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');

router.get('/', (req, res) => {
    res.render('admin');
});

router.use('/labs', require('./admin/labs'));

module.exports = router;
