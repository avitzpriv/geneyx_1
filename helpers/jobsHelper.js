// const sequelize = require('sequelize')
const models = require('../models/index')
const sequelize = models.sequelize
const s3sdk = require('./s3sdkHelper')
const _ = require('lodash')

const runJobNextTask = () => {

  console.log('runJobNextTask() - Try to run task')
  models.Task.count({
    where: {status: 'running'}
  }).then( async num => {

    // Do not run if there's another upload running
    if (num > 0) {
      console.log('runJobNextTask() - Another task running')
      return
    }

    // Look for the next that is ready task
    const reruntask = await models.Task.findOne({
      where: {status: 'rerun'},
      order: [['createdAt', 'DESC']],
      limit: 1
    })
    if (reruntask !== null) {
      if (reruntask.num_reruns >= 2) {
        
      }
      console.log('runJobNextTask() - Running task: ')
      runTask(reruntask)
      return
    }

    // Look for the next that is ready task
    const readytask = await models.Task.findOne({
                        where: {status: 'ready'},
                        order: [['createdAt', 'DESC']],
                        limit: 1
                      })
    if (readytask !== null) {
      console.log('runJobNextTask() - Running task: ')
      runTask(readytask)
      return
    }

    console.log('runJobNextTask() - No tasks in queue')  
    return
  })
}

const runTask = (task) => {
  console.log('=========================')
  console.log("Start task: ", JSON.stringify(task))
  console.log('=========================')
  const {owner_id, hpo_terms, relation, 
         ethnicity, gender, file_path} = JSON.parse( task.task_data )
  const taskId = task.id

  /**
   * This one is a handfull:
   * start a multipart Upload.
   * If fails because of upload then update the task accordingly.
   * If succeeds then need to:
   *   1 - Update the task
   *   2 - If was the last task then update the job
   *   3 - Update the Genome owner details
   * These last three are handled using a transaction.
   */
  s3sdk.startMultipartUpload(taskId, file_path)
        .then((doneParams) =>
        {
          console.log('jobsHelper - upload task is done')
          sequelize.transaction(async (t) => {
              console.log('jobsHelper - Update task with ID: ', taskId)
              return await models.Task.update(
                {status: 'done'},
                {where: {id: taskId}, transaction: t}
            )
            .then( async () => {
 
              console.log('jobsHelper - check Job')
              const liveTasksNum = await models.Task.count(
                {where: {job_id: task.job_id,
                 $or: [ 
                        {status: {$eq: 'ready'}},
                        {status: {$eq: 'running'}},
                        {status: {$eq: 'rerun'}},
                      ]}, transaction: t})
              console.log(liveTasksNum)

              const errorTasksNum = await models.Task.count(
                {where: {job_id: task.job_id, status: 'error'}, transaction: t})

              let stat
              let errorMsg = ''

              console.log(`jobsHelper - live tasks: ${liveTasksNum}, tasks with errors: ${errorTasksNum}`)

              if (liveTasksNum === 0) {
                if (errorTasksNum > 0) {
                  stat = 'error'
                } else {
                  stat = 'done'
                  errorMsg = 'Failed tasks'
                }
                console.log('jobsHelper - update job')
                return models.Job.update({status: stat, error_message: errorMsg}, {where: {id: task.job_id}, transaction: t})
              }

              console.log('jobsHelper - not updating job')
              return 'Nothing to do'
            })
            .then(() => {
              console.log('jobsHelper - Update owner')
              return models.Owner.create(
                {
                  identity: owner_id, hpo_terms: hpo_terms, relation: relation,
                  ethnicity: ethnicity, gender: gender
                }, {transaction: t}
              )
            })
          })
          .then(() => {
            console.log('Task done')
          })
          .catch( err => {
            errorMsg = `Trasaction failed at end of task with error: ${err}`
            console.warn(errorMsg)
            console.log(err.stack)
            models.Task.update(
              {status: 'error', error_message: errorMsg},
              {where: {id: taskId}})
          })
        })
        .catch( errMsg => {
          errorMsg = `Multipart upload failed with error: ${errMsg}`
          console.warn(errorMsg)
          console.log(errMsg.stack)
          models.Task.update(
            {status: 'rerun', error_message: errorMsg, num_reruns: task.num_reruns + 1},
            {where: {id: taskId}})
        })
        .finally(() => {
          console.log('=========================')
          console.log("End task")
          console.log('=========================')
        })
}

module.exports = runJobNextTask