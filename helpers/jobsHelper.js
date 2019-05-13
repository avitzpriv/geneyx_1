const models = require('../models/index')
const sequelize = models.sequelize
// const s3sdk = require('./s3sdkHelper')
const s3sdk = require('./bufferedS3sdkHelper')
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

    // Look for a task that's waiting for rerun
    const reruntask = await models.Task.findOne({
      where: {status: 'rerun'},
      order: [['created_at', 'DESC']],
      limit: 1
    })
    if (reruntask !== null) {
      // If there is such a task, but we went through too many re-runs then mark 
      // the entire job as an error.
      if (reruntask.num_reruns >= 2) {
        const rettask = await models.Task.update(
          {status: 'error'},
          {where: {id: reruntask.id}}
        )
        const retjob = models.Job.update(
          {status: 'error', error_message: `task: ${reruntask.id} finnished with errors`},
          {where: {id: reruntask.job_id}}
        )
      }

      console.log('runJobNextTask() - ReRunning task: ', reruntask.id)
      // before re-running, update the status
      const ret = await models.Task.update(
        {num_reruns: reruntask.num_reruns + 1},
        {where: {id: reruntask.id}}
      )
      runTask(reruntask)
      return
    }

    // Look for the next that is ready task
    const readytask = await models.Task.findOne({
                        where: {status: 'ready'},
                        order: [['created_at', 'DESC']],
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
  const { file_path } = JSON.parse( task.task_data )
  const taskId = task.id

  finnalizeOwner(task, {Bucket: 'geneyx-prod-bucket',
                        Key: 'na',
                        uploadId: 'na'
                      })
  return

  /**
   * This one is a handfull:
   * start a multipart Upload.
   * If fails because of upload then update the task accordingly.
   * If succeeds then need to:
   *   1 - Update the task
   *   2 - If was the last task then update the job
   *   3 - Update the Genome owner details
   *   4 - connect owner to the lab
   *   5 - connect the owner to the file
   * These last 5 are a single transaction.
   */
  s3sdk.startMultipartUpload(task, file_path)
        .then( doneParams => {finnalizeOwner(task, doneParams)} )
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

const finnalizeOwner = (task, doneParams) => {
  console.log('jobsHelper - upload task is done')
  //sequelize.transaction(async (t) => {
      console.log('jobsHelper - Update task with ID: ', task.id)
    models.Task.update(
        {status: 'done'},
        {where: {id: task.id}}
    )
    .then( async () => { return await getOwner(task) })
    .then( async (owner) => { return await updateOwner(owner, task) } )
    .then( async (owner) => { return await updateFile(owner, doneParams) } )
    .then( () => { updateJobStatus(task) } )
  //})
  .then(() => {
    console.log('Task done')
  })
  .catch( err => {
    errorMsg = `Trasaction failed at end of task with error: ${err}`
    console.warn(errorMsg)
    console.log(err.stack)
    models.Task.update(
      {status: 'error', error_message: errorMsg},
      {where: {id: task.id}})
  })
}

const getOwner = async (task) => {
  const { owner_id } = JSON.parse( task.task_data )
  const owner = await models.Owner.findOne({
    where: {identity: `${owner_id}`}
  })
  return owner
}

const updateFile = (owner, doneParams) => {
  console.log('jobsHelper - Update file')
  console.log('+++++++++++++++++++++++++++++++++')
  console.log(doneParams)
  console.log('+++++++++++++++++++++++++++++++++')
  const fileMetaData = JSON.stringify({
    bucket: doneParams.Bucket,
    key: doneParams.Key,
    uploadId: doneParams.uploadId
  })
  console.log('fileMetaData: ', fileMetaData)
  
  return models.File.create({
      url: doneParams.Key,
      file_meta_data: fileMetaData,
      OwnerId: owner.id,
      uploadDatae: Date.now
    })
}

/** If the owner doesn't exist yet, then create it */
const updateOwner = async (owner, task) => {
  if ( _.isNil(owner) ) {
    console.log('jobsHelper - Update owner')
    const {owner_id, hpo_terms, relation, 
          ethnicity, gender} = JSON.parse( task.task_data )
    owner = await models.Owner.create({
        identity: owner_id, hpo_terms: hpo_terms, relation: relation,
        ethnicity: ethnicity, gender: gender
      })

    console.log('jobsHelper - Update lab_owner')
    const {lab_id} = JSON.parse( task.task_data )
    await models.lab_owner.create({
        lab_id: lab_id,
        owner_id: owner.id,
      })
  }
  return owner
}

const updateJobStatus = async (task) => {
  console.log('jobsHelper - check Job')
  const liveTasksNum = await models.task.count(
    {where: {job_id: task.job_id,
     $or: [ 
            {status: {$eq: 'ready'}},
            {status: {$eq: 'running'}},
            {status: {$eq: 'rerun'}},
          ]}})
  console.log(liveTasksNum)

  const errorTasksNum = await models.task.count(
    {where: {job_id: task.job_id, status: 'error'}})

  let stat
  let errorMsg = ''

  console.log(`jobsHelper - live tasks: ${liveTasksNum}, tasks with errors: ${errorTasksNum}`)

  if (liveTasksNum === 0) {
    if (errorTasksNum > 0) {
      stat = 'error'
      errorMsg = 'Failed tasks'
    } else {
      stat = 'done'
    }
    console.log('jobsHelper - update job')
    return models.job.update({status: stat, error_message: errorMsg}, {where: {id: task.job_id}})
  }

  console.log('jobsHelper - not updating job')
  return 'Nothing to do'
}

module.exports = runJobNextTask