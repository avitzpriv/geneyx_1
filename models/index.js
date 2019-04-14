'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const db = {}
const config = require('../db_config')

const sequelize = new Sequelize(
  config[env].database,
  config[env].username,
  config[env].password,
  config[env]
)

fs.readdirSync(__dirname)
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
