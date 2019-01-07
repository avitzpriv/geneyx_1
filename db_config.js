require('dotenv').config()

module.exports = {
  development: {
    database: process.env.DEV_DB,
    username: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASS,
    host: process.env.DEV_HOST,
    port: 5432,
    dialect: 'postgres',
    logging: false
  },
  test: {
    database: process.env.TEST_DB,
    username: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASS,
    host: process.env.TEST_HOST,
    port: 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    database: process.env.PROD_DB,
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASS,
    host: process.env.PROD_HOST,
    port: 5432,
    dialect: 'postgres',
    loggind: false
  }
}