// const sequelize = require('sequelize')
const models = require('../models/index')
const sequelize = models.sequelize
const s3sdk = require('./s3sdkHelper')

const runJobNextTask = () => {


  models.Task.findOne({
    where: {status: 'ready'},
    order: [['createdAt', 'DESC']],
    limit: 1
  }).then((res) => {
    runTask(res)
  }).catch((err) => {
    console.error(err)
  })
}

const runTask = (task) => {
  console.log('=========================')
  console.log("Start task")
  console.log('=========================')
  const {ownerId, hpoTerms, relation, 
         ethnicity, gender, filePath} = JSON.parse( task.task_data )
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
  s3sdk.startMultipartUpload(taskId, filePath)
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
                  identity: ownerId, hop_terms: hpoTerms, relation: relation,
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
            {status: 'rerun', error_message: errorMsg},
            {where: {id: taskId}})
        })
        .finally(() => {
          console.log('=========================')
          console.log("End task")
          console.log('=========================')
        })
}

const updateTask = async (taskId, status, msg) => {
  let upd = {}
  if (status === 'error') {
    upd.status = 'error'
    upd.errorMsg = msg
  } else {
    upd.status = 'done'
  }
  await models.Task.update(upd, {where: {id: taskId}})
}

module.exports = runJobNextTask