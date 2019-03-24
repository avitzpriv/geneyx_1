// Based on an example here: https://gist.github.com/sevastos/5804803

require('dotenv').config()

const fs = require('fs')
const AWS = require('aws-sdk')

// S3 Upload options
AWS.config.loadFromPath('./aws-config.json')
const bucket = process.env.S3_BUCKET
const s3 = new AWS.S3()

// File
// const fileName = 'big-example.fastq'
// const filePath = './' + fileName
// const fileKey = fileName
const buffer = fs.readFileSync('./' + filePath)


// Upload
const startTime = new Date()
const partSize = 1024 * 1024 * 5
const maxUploadTries = 3
const maxConcurrentUpload = 1
let   concurrentlyUploading = 0

const multiPartParams = {
    Bucket: bucket,
    Key: fileKey,
    ContentType: 'text/plain'
}
const multipartMap = {
    Parts: []
}

let partNum = 0
let numPartsLeft = Math.ceil(buffer.length / partSize)

function completeMultipartUpload(s3, doneParams) {
  s3.completeMultipartUpload(doneParams, function(err, data) {
    if (err) {
      console.log("An error occurred while completing the multipart upload")
      console.log(err)
    } else {
      const delta = (new Date() - startTime) / 1000
      console.log('Completed upload in', delta, 'seconds')
      console.log('Final upload data:', data)
    }
  })
}

function uploadPart(s3, multipart, partParams, tryNum) {
  var tryNum = tryNum || 1
  s3.uploadPart(partParams, function(multiErr, mData) {
    if (multiErr){
      console.log('multiErr, upload part error:', multiErr)
      if (tryNum < maxUploadTries) {
        console.log('Retrying upload of part: #', partParams.PartNumber)
        uploadPart(s3, multipart, partParams, tryNum + 1)
      } else {
        console.log('Failed uploading part: #', partParams.PartNumber)
      }
      return
    }
    multipartMap.Parts[this.request.params.PartNumber - 1] = {
      ETag: mData.ETag,
      PartNumber: Number(this.request.params.PartNumber)
    }
    console.log("Completed part", this.request.params.PartNumber)
    console.log('mData', mData)

    console.log(`before concurrentlyUploading: ${concurrentlyUploading}`)
    concurrentlyUploading--
    console.log(`after concurrentlyUploading: ${concurrentlyUploading}`)

    if (--numPartsLeft > 0) return // complete only when all parts uploaded
    
    const doneParams = {
      Bucket: bucket,
      Key: fileKey,
      MultipartUpload: multipartMap,
      UploadId: multipart.UploadId
    }

    console.log("Completing upload...")
    completeMultipartUpload(s3, doneParams)
  })
}

// Multipart
const startMultipartUpload = () => {
  s3.createMultipartUpload(multiPartParams, async (mpErr, multipart) => {
    if (mpErr) { console.log('Error!', mpErr); return }
    console.log("Got upload ID", multipart.UploadId)

    // Grab each partSize chunk and upload it as a part
    for (var rangeStart = 0 ;rangeStart < buffer.length; rangeStart += partSize) {
      while (concurrentlyUploading >= maxConcurrentUpload) {
        console.log(`LOOP concurrentlyUploading: ${concurrentlyUploading}`)
        console.log('Reached maxConcurrentUpload, will wait')
        await sleep(5000)
      }

      partNum++
      
      const end = Math.min(rangeStart + partSize, buffer.length),
          partParams = {
            Body: buffer.slice(rangeStart, end),
            Bucket: bucket,
            Key: fileKey,
            PartNumber: String(partNum),
            UploadId: multipart.UploadId
          }

      // Send a single part
      console.log('Uploading part: #', partParams.PartNumber, ', Range start:', rangeStart)
      uploadPart(s3, multipart, partParams)
      concurrentlyUploading++
    }
  })
}

const sleep = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

console.log("Creating multipart upload for:", fileKey)
startMultipartUpload()