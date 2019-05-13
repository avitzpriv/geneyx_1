const test = require('./bufferedS3SdkHelper')
const { pipeline, Transform } = require('stream')

pipeline(
  process.stdin,
  new test.TestTransform(),
  process.stdout,
  err => {
    if (err) {
      console.log('Pipeline failed: ')
    } else {
      console.log('Pipeline succeeded.')
    }
  }
)
