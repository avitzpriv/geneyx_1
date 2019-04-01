const express = require('express')
const router = express.Router()
const _ = require('lodash')
const models = require('../models/index')
const sequelize = models.sequelize


const progressBar = (req, res, next) => {
  console.log('JobsController - progress_bar()')

  models.Job.findOne({
    attributes: ['id'],
    where: {status: 'open'},
    order: [['createdAt', 'DESC']],
    limit: 1
  }).then( job => {

    if (job === null) {
      res.status(200).json({})
      return
    }

    models.Task.findAll({
      attributes: ['status', [sequelize.fn('count', sequelize.col('status')), 'cnt']],
      where: {job_id: job.id},
      group: ['status']
    }).then( statuses => {
      const result = {}
      _.each(statuses, s => {
        const stat = s.get()
        result[stat['status']] = stat['cnt']
      })
      console.log('rethash: ' + JSON.stringify(result) )
      res.status(200).json(result)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({status: 'error', message: err.message})  
    })
  })
  .catch(err => {
    console.error(err)
    res.status(500).json({status: 'error', message: err.message})  
  })
}

router.get('/progress_bar', progressBar)

module.exports = router