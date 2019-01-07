'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
// const config = require(__dirname + '/../config/config.json')[env]
const db = {}

let host, user, pass, database, logging
const dialect = process.env.DIALECT 

if (env === 'development') {
  host     = process.env.DEV_HOST
  user     = process.env.DEV_DB_USER
  pass     = process.env.DEV_DB_PASS
  database = process.env.DEV_DB
  logging  = (process.env.DEV_DB_LOGGING === true)
} else if (env === 'test') {
  host     = process.env.TEST_HOST
  user     = process.env.TEST_DB_USER
  pass     = process.env.TEST_DB_PASS
  database = process.TEST.DEV_DB
  logging  = (process.env.TEST_DB_LOGGING === true)
} else if (env === 'production') {
  host     = process.env.PROD_HOST
  user     = process.env.PROD_DB_USER
  pass     = process.env.PROD_DB_PASS
  database = process.env.PROD_DB
  logging  = (process.env.PROD_DB_LOGGING === true)
} else {
  throw new Error('Unknown environment kind: ', env)
}

const sequelize = new Sequelize(database, user, pass, {host: host, dialect: dialect, logging: logging})

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// one of my trials **AviY**
// //Models/tables
// db.owners = require('../models/owner.js')(sequelize, Sequelize);  
// db.labs = require('../models/lab.js')(sequelize, Sequelize);  
// db.ownerInfos = require('../models/ownerinfo.js')(sequelize, Sequelize);
// db.labOwner = require('../models/labowner.js')(sequelize, Sequelize);
// //Relations
// db.owners.belongsTo(db.labs);  
// db.labs.belongsTo(db.owners);  

module.exports = db;
