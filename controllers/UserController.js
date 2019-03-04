// const config = require('config.json')
const express = require('express')
const router = express.Router()
const _ = require('lodash')
const userHelper = require('../helpers/userHelper')

/**
 * Add a new user to the system
 */
const createUser = (req, res, next) => {
  console.log('UserController - create_user()')
  const {userName, email, password} = req.body
  const ressult = userHelper.createUser(userName, email, password)
  if (!ressult === null) {
    res.status(200).json({status: 'error', message: res})
  } else {
    res.status(200)
  }
}

router.post('/create_user', createUser)

module.exports = router