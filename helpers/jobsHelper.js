const models = require('../models/index')
const s3sdk = require('./s3sdkHelper')

const runJobNextTask = () => {
  console.log('runJobs is running ...')

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
         ethnicity, gender, filePath} = JSON.parse( task.taskData )

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
  s3sdk.startMultipartUpload(task.id, filePath)
        .then((doneParams) =>
        {

          sequelize.transaction(t => {
            return models.Task.update(
              {status: 'done'},
              {where: {id: taskId}, transaction: t}
            )
            .then( async () => {

              const liveTasksNum = await models.Task.count(
                {where: {jobId: task.jobId,
                 $or: [ 
                        {status: {$eq: 'ready'}},
                        {status: {$eq: 'running'}},
                        {status: {$eq: 'rerun'}},
                      ]}})

              const errorTasksNum = await models.Task.count(
                {where: {jobId: task.jobId, status: 'error'}})

              let stat
              let errorMsg = ''
              if (liveTasksNum === 0) {
                if (errorTasksNum > 0) {
                  stat = 'error'
                } else {
                  stat = 'done'
                  errorMsg = 'Failed tasks'
                }
                return models.Job.update({status: stat, errorMsg: errorMsg}, {where: {id: task.jobId}, transaction: t})
              }
              return 'Nothing to do'
            })
            .then(() => {
              createOwner( relation, ethnicity, gender, doneParams)
              return models.Owner.create(
                {
                  identity: ownerId, hopTerms: hpoTerms, relation: relation,
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
            models.Task.update(
              {status: 'error', errorMsg = errorMsg},
              {where: {id: taskId}})
          })
        })
        .catch( errMsg => {
          errorMsg = `Multipart upload failed with error: ${errMsg}`
          console.warn(errorMsg)
          models.Task.update(
            {status: 'rerun', errorMsg = errorMsg},
            {where: {id: taskId}})
        })

  console.log('=========================')
  console.log("End task")
  console.log('=========================')
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