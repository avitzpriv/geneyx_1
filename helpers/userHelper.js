const models = require('../models/index')

const createUser = (userName, email, password, type, labId) => {
  models.User
    .create({user_name: userName, email: email, password: password, type: type, lab_id: labId})
    .then(r => {
      console.log(`User: ${userName} saved successfully`)
      return null
    })
    .catch(err => {
      console.error(`Failed to save user: ${userName}. Error message: ${err.message}`)
      return `Failed to save user with error: ${err.message}`
    })
}

module.exports = {
  createUser: createUser
}