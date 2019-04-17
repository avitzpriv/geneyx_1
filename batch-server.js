
const runBatchJobs = require('./helpers/jobsHelper')
runBatchJobs()
setInterval(runBatchJobs, 1000 * 5)


