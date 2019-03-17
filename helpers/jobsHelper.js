const models = require('../models/index')

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
  console.log("runJobs found task: ", task.taskData)
  const taskDataArr = task.taskData.split('&')
  const ownerId  = taskDataArr[0].split('=')[1]
  const filePath = taskDataArr[1].split('=')[1]
  console.log(`ownerId: ${ownerId}, filePath: ${filePath}`)
}


module.exports = runJobNextTask