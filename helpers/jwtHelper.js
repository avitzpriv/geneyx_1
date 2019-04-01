'use strict'

const fs  = require('fs')
const jwt = require('jsonwebtoken')
const _   = require('lodash')

// use 'utf8' to get string instead of byte array  (512 bit key)
const privateKEY = fs.readFileSync('./keys/private.key', 'utf8')
const publicKEY  = fs.readFileSync('./keys/public.key', 'utf8')  

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
    '/authenticate',
    '/login',
    '/css',
    '/img',
    '/js/login.js',
    '/users/create_user',
    '/js/mylab.js'
  ]
  /** Some paths should not be checked */
  if (_.find(excemptPaths, e => req.url.startsWith(e))) {
    next()
    return
  }

  /** Get the authorization token */
  const cookies = req.headers.cookie
  const cookiearr = cookies.split('; ')
  const auth = _.find(cookiearr, (coo) => {
    return coo.trim().startsWith('ngxtoken')
  })
  if (_.isNil(auth)) {
    res.redirect('/login')
    return
  }
  const token = auth.split('=')[1]

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
    if (err instanceof jwt.JsonWebTokenError) {
      return false
    } else if (err instanceof jwt.TokenExpiredError) {
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
