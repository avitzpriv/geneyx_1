'use strict'

const fs  = require('fs')
const jwt = require('jsonwebtoken')
const _   = require('lodash')

// use 'utf8' to get string instead of byte array  (512 bit key)
const privateKEY = fs.readFileSync('./keys/private.key', 'utf8')
const publicKEY  = fs.readFileSync('./keys/public.key', 'utf8')  

/*
   options = {
    issuer: "Geneyx",
    // subject: "user@acme.com", 
    // audience: "Client_Identity" // this should be provided by client
   }
 */

const sign = (payload, options) => { 
  // Token signing options
  const signOptions = {
    issuer:  options.issuer,
    // subject:  options.subject,
    expiresIn:  "1d",    // 1 day validity
    algorithm:  "RS256"    
  }
  return jwt.sign(payload, privateKEY, signOptions)
}

const middleWareVerify = (req, res, next) => {
  const excemptPaths = [
    '/users/authenticate',
    '/users/login',
    '/css/login.css',
    '/img/geneyx.png',
    '/img/user.png',
    '/img/notification.png'
  ]
  console.log('===========================')
  console.log('headers: ', req.headers)
  console.log('URL: ', req.url)

  /** Some paths should not be checked */
  if (_.find(excemptPaths, e => e === req.url)) {
    next()
    return
  }

  /** Get the authorization token */
  const auth = req.headers['authorization']
  if (_.isNil(auth)) {
    // res.status(403).json({message: 'Request denied'})
    res.redirect('/users/login')
    return
  }
  const token = auth.split(' ')[1]
  console.log('TOKEN: ', token)

  /** Use JWT to verify the token. It will also verify expiration date */
  if (verify(token, {issuer: 'Geneyx'})) {
    next()
  } else {
    res.status(403).json({message: 'Request denied'})
    res.redirect('/login')
  }
}

const verify = (token, option) => {
  const  verifyOptions = {
      issuer:  option.issuer,
      // subject:  option.subject,
      expiresIn:  "1d",
      algorithm:  ["RS256"]
  }

  try {
    jwt.verify(token, publicKEY, verifyOptions)
    return true
  } catch (err) {
    console.log('err: ', err)
    if (err instanceof JsonWebTokenError) {
      return false
    } else {
      throw new Error(`JWT verification error: ${err.message}`)
    }
  }
}

const decode = (token) => {
  return jwt.decode(token, {complete: true})
}

module.exports = {
  sign: sign,
  middleWareVerify: middleWareVerify,
  verify: verify,
  decode: decode
}
