// const config = require('config.json')
const express = require('express')
const router = express.Router()
const models = require('../models/index')
const _ = require('lodash')

/**
 * Add a new user to the system
 */
const createUser = (req, res, next) => {
  console.log('UserController - create_user()')
  const {userName, email, password} = req.body

  models.User.create({userName: userName, email: email, password: password})
             .then(r => {
               console.log(`User: ${userName} saved successfully`)
               res.status(200)
             })
             .catch(err => {
               console.error(`Failed to save user: ${userName}. Error message: ${err.message}`)
               res.status(200).json({status: 'error', message: 'Failed to save user'})
             })
}

router.post('/create_user', createUser)

module.exports = router