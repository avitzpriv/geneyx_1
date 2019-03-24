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

/**
 * Entrypoint to S3 multipart upload
 */
const startMultipartUpload = (taskId, fileKey) => {

  /** Setup */
  AWS.config.loadFromPath('./aws-config.json')
  const bucket = process.env.S3_BUCKET
  const s3 = new AWS.S3()
  const buffer = fs.readFileSync('./' + filePath)
  const multiPartParams = {
    Bucket: bucket,
    Key: filePath,
    ContentType: 'text/plain'
  }
  const multipartMap = {
    Parts: []
  }
  const startTime = new Date()
  let   concurrentlyUploading = 0
  let partNum = 0
  let numPartsLeft = Math.ceil(buffer.length / partSize)

  /** Done with setup, start actual upload */
  return new Promise(taskId, (resolve, reject) => {

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
                Bucket: bucket,
                Key: fileKey,
                PartNumber: String(partNum),
                UploadId: multipart.UploadId
              }

        // Send a single part
        console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart)

        await models.Task.update({ 
          taskState: {
            partNum: partNum,
            uploadId: multipart.UploadId,
          },
          status: 'running'
        }, {
          where: {id: taskId}
        })

        uploadPart(s3, taskId, multipart, partParams, resolve, reject)
        concurrentlyUploading++
      }
      resolve()
    })
  })
}

const uploadPart = (s3, multipart, partParams, tryNum, resolve, reject) => {
  var tryNum = tryNum || 1
  s3.uploadPart(partParams, (multiErr, mData) => {
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
    multipartMap.Parts[this.request.params.PartNumber - 1] = {
      ETag: mData.ETag,
      PartNumber: Number(this.request.params.PartNumber)
    }
    console.log("Completed part", this.request.params.PartNumber)
    console.log('mData', mData)

    concurrentlyUploading--

    if (--numPartsLeft > 0) return // complete only when all parts uploaded
    
    const doneParams = {
      Bucket: bucket,
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
  s3.completeMultipartUpload(doneParams, function(err, data) {
    if (err) {
      const msg = `Error while completing multipart upload. S3 error msg: ${err}`
      console.warn(msg)
      reject(msg)
    } else {
      const delta = (new Date() - startTime) / 1000
      const msg = `Completed upload in ${delta} seconds. Final upload data: ${data}`
      console.log(msg)
      resolve(doneParams)
    }
  })
}

module.exports = {
  startMultipartUpload: startMultipartUpload
}