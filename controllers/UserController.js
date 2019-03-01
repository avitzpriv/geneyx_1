// const config = require('config.json')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const models = require('../models/index')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
const jwtHelper = require('../helpers/jwtHelper')

/**
 * Authenticate a user
 */
const authenticate = (req, res, next) => {
  console.log('UserController - auth() - req: ', req.body)
  const { userName, password } = req.body
  console.log('UserController - auth(), username: ', userName)

  models.User
    .findOne({where: {userName: userName}})
    .then((user) => {
      if (user) {
        console.log('UserController - auth() - users email: ', user.email)
        console.log('db password: ', user.password)
        
        const passwordHash = bcrypt.compare(password, user.password, (err, result) => {
          if (result === true) {
            console.log('Password and username match')
            const token = jwtHelper.sign({userType: 'user'}, {issuer: 'Geneyx'})
            console.log(`token: ${token}`)
            res.status(200).json( {email: user.email, token: token} )
          } else {
            console.log('No match')
            res.status(403).json({message: '1 - Username or password is incorrect'})
            res.redirect('/login')
          }

        })
      } else {
        res.status(400).json({ message: '2 - Username or password is incorrect' })
        res.redirect('/login')
      }
    })
}

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

/**
 * Display a login screen
 */
const login = (req, res, next) => {
  res.render('login')
}

router.post('/authenticate', authenticate)
router.post('/create_user', createUser)
router.get('/login', login)

module.exports = router