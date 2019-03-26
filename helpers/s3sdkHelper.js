// Based on an example here: https://gist.github.com/sevastos/5804803

require('dotenv').config()
const models = require('../models/index')

const fs = require('fs')
const AWS = require('aws-sdk')

// Upload
const partSize = 1024 * 1024 * 5
const maxUploadTries = 3
const maxConcurrentUpload = 1
const TIME_BETWEEN_CHECKS = 5000 // millisecs

/************ Globals *****************/
// Track number of concurrent upload processes
let concurrentlyUploading

// How many parts are left
let numPartsLeft

// Upload start time
let startTime = new Date()

// How to find the file
let filePath

// What to call it in S3
let fileKey
/*************************************/

/**
 * Entrypoint to S3 multipart upload
 */
const startMultipartUpload = (taskId, _filePath) => {

  /** Setup */
  let partNum = 0
  filePath = _filePath
  fileKey = _filePath.split('/').pop()
  startTime = new Date()
  concurrentlyUploading = 0
  AWS.config.loadFromPath('./aws-config.json')
  const s3 = new AWS.S3()
  const buffer = fs.readFileSync(filePath)
  numPartsLeft = Math.ceil(buffer.length / partSize)
  const multiPartParams = {
    Bucket: process.env.S3_BUCKET,
    Key: fileKey,
    ContentType: 'text/plain'
  }
  const multipartMap = {
    Parts: []
  }
  
  
  /** Done with setup, start actual upload */
  return new Promise((resolve, reject) => {

    s3.createMultipartUpload(multiPartParams, async (mpErr, multipart) => {
      if (mpErr) { console.log('Error!', mpErr); reject(`Multipart create error: ${mpErr}`) }
      console.log("Got upload ID", multipart.UploadId)

      // Grab each partSize chunk and upload it as a part
      for (var rangeStart = 0 ;rangeStart < buffer.length; rangeStart += partSize) {
        while (concurrentlyUploading >= maxConcurrentUpload) {
          console.log(`LOOP concurrentlyUploading: ${concurrentlyUploading}`)
          console.log('Reached maxConcurrentUpload, will wait')
          await sleep(TIME_BETWEEN_CHECKS)
        }

        partNum++
        
        const end = Math.min(rangeStart + partSize, buffer.length)
        const partParams = {
                Body: buffer.slice(rangeStart, end),
                Bucket: process.env.S3_BUCKET,
                Key: fileKey,
                PartNumber: String(partNum),
                UploadId: multipart.UploadId
              }

        // Send a single part
        console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart, ', in task: ', taskId)

        await models.Task.update({ 
          task_state: JSON.stringify({partNum: partNum, uploadId: multipart.UploadId}),
          status: 'running'
        }, {
          where: {id: taskId}
        })

        console.log('>>>>>>>>>>>>>>>>>>>> 1')

        uploadPart(s3, multipart, partParams, 1, multipartMap, resolve, reject)
        concurrentlyUploading++
      }
    })
  })
}

const uploadPart = (s3, multipart, partParams, tryNum, multipartMap, resolve, reject) => {
  var tryNum = tryNum || 1
  s3.uploadPart(partParams, (multiErr, mData) => {
    console.log('>>>>>>>>>>>>>>>>>>>> 2')
    if (multiErr){
      let msg = `multiErr, upload part error: ${multiErr}`
      if (tryNum < maxUploadTries) {
        console.warn(`${msg}. Retrying upload of part: #${partParams.PartNumber}`)
        uploadPart(s3, taskId, multipart, partParams, tryNum + 1, resolve, reject)
      } else {
        msg = `Failed uploading part: #${partParams.PartNumber} with error: ${multiErr}`
        console.warn(msg)
      }

      reject(msg)
      return
    }
    multipartMap.Parts[partParams.PartNumber - 1] = {
      ETag: mData.ETag,
      PartNumber: Number(partParams.PartNumber)
    }
    console.log("Completed part", partParams.PartNumber)
    console.log('mData', mData)

    concurrentlyUploading--

    if (--numPartsLeft > 0) return // complete only when all parts uploaded
    
    const doneParams = {
      Bucket: process.env.S3_BUCKET,
      Key: fileKey,
      MultipartUpload: multipartMap,
      UploadId: multipart.UploadId
    }

    console.log("Completing upload...")
    completeMultipartUpload(s3, doneParams, resolve, reject)
  })
}

const sleep = async (ms) => {
  return new Promise(rslv => setTimeout(rslv, ms))
}

const completeMultipartUpload = (s3, doneParams, resolve, reject) => {
  console.log('In completeMultipartUpload()')
  s3.completeMultipartUpload(doneParams, (err, data) => {
    if (err) {
      const msg = `Error while completing multipart upload. S3 error msg: ${err}`
      console.warn(msg)
      reject(msg)
    } else {
      const delta = (new Date() - startTime) / 1000
      console.log(`Completed upload in ${delta} seconds. Final upload data:`)
      console.log(data)
      resolve(doneParams)
    }
  })
}

module.exports = {
  startMultipartUpload: startMultipartUpload
}