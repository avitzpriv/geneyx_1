require('dotenv').config()
const models = require('../models/index')
const { Writable } = require('stream')

/*************************** Multipart upload **********************/

const PART_SIZE = 1024 * 1024 * 5
const maxUploadTries = 3

/**
 * Entrypoint to S3 multipart upload
 */
const startMultipartUpload = (_task, _filePath) => {

  /************************ Setup ***********************************/
  const fs = require('fs')
  const AWS = require('aws-sdk')
  AWS.config.loadFromPath('./aws-config.json')
  
  const taskStateStr = _task.task_state
  let {partNum, uploadId, multipartMap} = taskStateStr === null ?
                                          {partNum: 0, uploadId: null} :
                                          JSON.parse(taskStateStr)
  
  const fileSize = fs.statSync(_filePath).size
  const numOfParts = Math.ceil(fileSize / PART_SIZE)

  // If failed in a part before then reload it
  if (partNum > 0 && partNum !== numOfParts ) {
    console.log('partNum is bigger than zero')
    partNum -= 1
  }
  const inStream = fs.createReadStream(_filePath, { highWaterMark: PART_SIZE, start: partNum * PART_SIZE})

  const fileKey = _filePath.split('/').pop()

  // The datastructure expected by s3 to start multipart
  const multiPartParams = {
    Bucket: process.env.S3_BUCKET,
    Key: fileKey,
    ContentType: 'binary/octet-stream'
  }

  multipartMap = multipartMap === undefined ? { Parts: [] } : multipartMap

  const env = {
    s3: new AWS.S3(),
    multipartMap: multipartMap,
    multipart: null,
    buffer: null,
    fileSize: fileSize,
    taskId: _task.id,
    partNum: partNum,
    filePath: _filePath,           // How to find the file
    fileKey: fileKey,              // What to call it in S3
    startTime: new Date(),         // Upload start time
  }
  
  /************************* Done with setup, start actual upload *******************/
  return new Promise((resolve, reject) => {
    env.resolve = resolve
    env.reject = reject

    const finishUpload = (e) => {
      console.log('IN FINISH of outstream, Completing upload')
      const doneParams = {
        Bucket: process.env.S3_BUCKET,
        Key: env.fileKey,
        MultipartUpload: env.multipartMap,
        UploadId: env.multipart.UploadId
      }
      completeMultipartUpload(doneParams, env)
    }

    // Create a writable stream
    const outStream = new Writable({

      write(chunk, encoding, callback) {

        console.log('In write() of outStream, chunk size is: ', chunk.length)

        if (chunk.length === 0) {
          console.log('In chunk size is 0, calling finishUpload()')
          finishUpload()
        }

        env.buffer = chunk
        env.donePartCallback = callback

        /**
         *  uploadId can be initiated in two ways: 
         *  1 - It's the sencond chunk we upload and it was saved in createMultipartUpload 
         *      in env (under multipart)
         *  2 - The job was stopped for some reason, and now it was resumed and uploadId
         *      can be read from field: task.task_state
         */ 
        if (uploadId === null && env.multipart !== null) {
          uploadId = env.multipart.UploadId
        }
        
        if (uploadId !== null && uploadId !== undefined) {
          if (env.multipart === null) {
            env.multipart = {UploadId: uploadId}  
          }
          uploadPartsRunner({UploadId: uploadId}, env)

        } else {
          env.s3.createMultipartUpload(multiPartParams, createMultipartCallback(env))
        }
      }
    })

    // Handle the "finish" event.
    // It signals to outStream that inStream has nothing more to read
    outStream.on('finish', finishUpload )

    /** The main action is here. inStream reads from disk and outStream uploads to S3 */
    inStream.pipe(outStream)
  })

  
}

 

/**
 * a closure for the callback for the s3 api. Needed for env
 */
const createMultipartCallback = (env) => {
  return (mpErr, multipart) => {
    env.multipart = multipart
    if (env.uploadId === null || env.uploadId === undefined) {
      env.uploadId = multipart.UploadId 
    }
    if (mpErr) { console.log('Error!', mpErr); reject(`Multipart create error: ${mpErr}`) }
    console.log("Got upload ID", multipart.UploadId)

    uploadPartsRunner(multipart, env)
  }
}

/**
 * This is just a convinient wrapper for uploadPart()
 */
const uploadPartsRunner = async (multipart, env) => {
  env.partNum++

  console.log('Uploading file to bucket: ', process.env.S3_BUCKET)
  // This is the object required by s3.uploadPart
  const partParams = {
          Body: env.buffer,
          Bucket: process.env.S3_BUCKET,
          Key: env.fileKey,
          PartNumber: String(env.partNum),
          UploadId: multipart.UploadId
        }

  // Send a single part
  const numOfParts = Math.ceil(env.fileSize / PART_SIZE)
  console.log(`Uploading part: ${partParams.PartNumber} of ${numOfParts}  in task:  ${env.taskId}`)

  await models.task.update({ 
    task_state: JSON.stringify({
      partNum: env.partNum,
      uploadId: multipart.UploadId,
      multipartMap: env.multipartMap
    }),
    status: 'running'
  }, {
    where: {id: env.taskId}
  })

  uploadPart(multipart, partParams, 1, env.multipartMap, env)
}

/**
 * Upload a chunk to S3
 */
const uploadPart = (multipart, partParams, tryNum, multipartMap, env) => {
  var tryNum = tryNum || 1
  const s3      = env.s3
  const reject  = env.reject

  console.log('Calling s3.uploadPart')
  try {
    s3.uploadPart(partParams, async (multiErr, mData) => {
      if (multiErr) {
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

      res = await models.task.update({ 
        task_state: JSON.stringify({
          partNum: env.partNum,
          uploadId: multipart.UploadId,
          multipartMap: multipartMap
        })
      }, {
        where: {id: env.taskId}
      })

      env.donePartCallback()
    })
  } catch (err) {
    console.error(`Error while calling s3.upload(): ${err.message}, will try to rerun`)
    setTaskToRerun(env.taskId)
    exit(1)
  }
}

const setTaskToRerun = async (tid) => {
  await models.task.update({ 
    status: 'rerun'
  }, {
    where: {id: tid}
  })
}

/**
 * The multipart upload was finished. Call S3 API and resolve the promise.
 */
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
      console.log('data: ', data)
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
const getSignedUrl = (fileName) => {
  AWS.config.loadFromPath('./aws-config.json')
  const s3 = new AWS.S3()

  const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET,
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