// Based on an example here: https://gist.github.com/sevastos/5804803

require('dotenv').config()
const models = require('../models/index')

const fs = require('fs')
const AWS = require('aws-sdk')

/*************************** Multipart upload **********************/

const PART_SIZE = 1024 * 1024 * 5
const maxUploadTries = 3
const maxConcurrentUpload = 1
const TIME_BETWEEN_CHECKS = 5000 // millisecs

/**
 * Entrypoint to S3 multipart upload
 */
const startMultipartUpload = (_task, _filePath) => {

  /** Setup */
  AWS.config.loadFromPath('./aws-config.json')

  const buffer = fs.readFileSync(_filePath)

  const taskStateStr = _task.task_state
  let {partNum, uploadId} = taskStateStr === null ?
                            {partNum: 0, uploadId: null} :
                            JSON.parse(taskStateStr)
  // If failed in a part before then reload it
  if (partNum > 0) {
    partNum -= 1
  }
  console.log(`partNum: ${partNum}, uploadId: ${uploadId}`)
  
  const fileKey = _filePath.split('/').pop()

  // The datastructure expected by s3 to start multipart
  const multiPartParams = {
    Bucket: process.env.S3_BUCKET,
    Key: fileKey,
    ContentType: 'binary/octet-stream'
  }
  const multipartMap = {
    Parts: []
  }

  const env = {
    concurrentlyUploading: 0,                      // Track number of concurrent upload processes
    s3: new AWS.S3(),
    multipartMap: multipartMap,
    buffer: buffer,
    taskId: _task.id,
    partNum: partNum,
    uploadId: uploadId,
    filePath: _filePath,                            // How to find the file
    fileKey: fileKey,                               // What to call it in S3
    startTime: new Date(),                          // Upload start time
    numPartsLeft: Math.ceil(buffer.length / PART_SIZE),  // How many parts are left
    uploadId: uploadId
  }
  
  /** Done with setup, start actual upload */
  return new Promise((resolve, reject) => {
    env.resolve = resolve
    env.reject = reject
    if (uploadId !== null && uploadId !== undefined) {
      uploadPartsRunner({UploadId: uploadId}, env)
    } else {
      env.s3.createMultipartUpload(multiPartParams, createMultipartCallback(env))
    }
  })
}

/** a closure for the callback for the s3 api. Needed for env */
const createMultipartCallback = (env) => {
  return (mpErr, multipart) => {
    if (mpErr) { console.log('Error!', mpErr); reject(`Multipart create error: ${mpErr}`) }
    console.log("Got upload ID", multipart.UploadId)

    uploadPartsRunner(multipart, env)
  }
}

const uploadPartsRunner = async (multipart, env) => {
  // Grab each partSize chunk and upload it as a part
  for (var rangeStart = env.partNum ;rangeStart < env.buffer.length; rangeStart += PART_SIZE) {
    console.log('In FOR loop, rangeStart = ', rangeStart, ', buff len: ', env.buffer.length)
    while (env.concurrentlyUploading >= maxConcurrentUpload) {
      console.log(`LOOP concurrentlyUploading: ${env.concurrentlyUploading}`)
      console.log('Reached maxConcurrentUpload, will wait')
      await sleep(TIME_BETWEEN_CHECKS)
    }

    env.partNum++
    
    // This is the object required by s3.uploadPart
    const end = Math.min(rangeStart + PART_SIZE, env.buffer.length)
    const partParams = {
            Body: env.buffer.slice(rangeStart, end),
            Bucket: process.env.S3_BUCKET,
            Key: env.fileKey,
            PartNumber: String(env.partNum),
            UploadId: multipart.UploadId
          }

    // Send a single part
    console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart, ', in task: ', env.taskId)

    await models.Task.update({ 
      task_state: JSON.stringify({partNum: env.partNum, uploadId: multipart.UploadId}),
      status: 'running'
    }, {
      where: {id: env.taskId}
    })

    console.log('after await')


    uploadPart(multipart, partParams, 1, env.multipartMap, env)
    env.concurrentlyUploading++
  }
}

const uploadPart = (multipart, partParams, tryNum, multipartMap, env) => {
  var tryNum = tryNum || 1
  
  const s3      = env.s3
  const taskId  = env.taskId
  const resolve = env.resolve
  const reject  = env.reject

  console.log('before s3.uploadPart')
  s3.uploadPart(partParams, (multiErr, mData) => {

    if (multiErr){
      let msg = `multiErr, upload part error: ${multiErr}`
      if (tryNum < maxUploadTries) {
        console.warn(`${msg}. Retrying upload of part: #${partParams.PartNumber}`)
        uploadPart(multipart, partParams, tryNum + 1, env)
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

    env.concurrentlyUploading--

    if (--env.numPartsLeft > 0) return // complete only when all parts uploaded
    
    const doneParams = {
      Bucket: process.env.S3_BUCKET,
      Key: env.fileKey,
      MultipartUpload: env.multipartMap,
      UploadId: multipart.UploadId
    }

    console.log("Completing upload...")
    completeMultipartUpload(doneParams, env)
  })
  console.log('after s3.uploadPart')
}

const sleep = async (ms) => {
  return new Promise(rslv => setTimeout(rslv, ms))
}

const completeMultipartUpload = (doneParams, env) => {
  console.log('In completeMultipartUpload()')

  const s3      = env.s3
  const startTime  = env.startTime
  const resolve = env.resolve
  const reject  = env.reject

  console.log('doneParams: ', doneParams)
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

/***************************** Singed URLs *************************/

/**
 * Used for receiving a private url for downloading a file from S3
 */
const getSignedUrl = (bucketName, fileName) => {
  AWS.config.loadFromPath('./aws-config.json')
  const s3 = new AWS.S3()

  const url = s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: fileName,
      Expires: 60 * 60   // In seconds
  })
  return url
}

/*******************************************************************/
module.exports = {
  startMultipartUpload: startMultipartUpload,
  getSignedUrl: getSignedUrl
}