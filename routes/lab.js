const _ = require('lodash')
const express = require('express')
const router = express.Router()
const Sequelize = require('sequelize')
const multer  = require('multer')
const readXlsxFile = require('read-excel-file/node')
const fs = require('fs');

const models = require('../models/index')
const ownCtl = require('../controllers/Owner')
const s3Helper = require('../helpers/s3sdkHelper')

const upload = multer({ dest: 'Temp/' })

router.get('/', (req, res) => {
    res.render('mylab')
})

/**
 * Return a safe URL to file
 */
router.get('/download/:filePath', (req, res) => {
  const filePath = req.params.filePath
  const url = s3Helper.getSignedUrl('geneyx-test-bucket', filePath)
  res.json({url: url})
})

router.get('/search/:lab_id', async (req, res) => {
  let gender = req.query.gender
  const hpo = req.query.hpo_term
  const ethnicity = req.query.ethnicity
  const labId = req.query.lab_id
  const labName = req.query.lab_name

  const wherePart = {}
  if (!_.isEmpty(gender)) {
    wherePart.gender = genderStrToInt(gender.toLowerCase())
  }
  if (!_.isEmpty(ethnicity)) {
    wherePart.ethnicity = {[Sequelize.Op.like]: `%${ethnicity}%`}
  }
  if (!_.isEmpty(hpo)) {
    wherePart.hpo_terms = {[Sequelize.Op.like]: `%${hpo}%`}
  }

  // const sequelize = require('sequelize')

  const files = await models.sequelize.query(
    `select o.identity, o."createdAt", o.hpo_terms, o.ethnicity, o.gender, f.url
     from "Files" as f
     join "Owners" as o on o.id = f."OwnerId"
     join "LabOwners" as lo on lo."OwnerId" = o.id
     where lo."LabId" = ${labId}
     order by o."createdAt" desc`
  )
  
  const ownersList = []
  _.each(files[0], file => {
    ownersList.push({
      ownerId: file.identity,
      createdAt: file.createdAt,
      gender: genderIntToStr(file.gender),
      ethnicity: file.ethnicity,
      hpo: file.hpo_terms,
      filePath: file.url
    })
  })

  res.render('mylab', 
              { name: labName,
                id: labId,
                ownersList: ownersList,
                gender: gender,
                hpo: hpo,
                ethnicity: ethnicity
              })
  return
})

router.post('/bulkupload/:lab_id',upload.single('bulkuploadexcel'), (req, res) => {
  console.log('In bulk upload')

  const lab_id = req.params.lab_id
  if (lab_id === undefined) {
    console.error('bulkupload: lab_id can not be empty')
    res.send(500)
  }

  readXlsxFile( fs.createReadStream(req.file.path) )
    .then( async (rows) => {
      const job = await createJob()

      _.each(rows, (row) => {
        if( row[0] === 'fastq_file_id') { return }
        const ownerId   = row[0]
        const hpoTerms  = row[1]
        const relation  = row[2]
        const ethnicity = row[3]
        const gender    = row[4]
        const filePath  = row[5]
        const task = createTask(job.dataValues.id, ownerId, hpoTerms,
                                relation, ethnicity, gender, filePath,
                                lab_id)
        console.log('Created task: ', task.name)

      })
    }).catch((err) => {
      console.log('Failed to read excel file with error: ', err)
      res.send(500)
      return
    })
  // res.send(200)
  res.redirect(`/lab/${req.params.lab_id}`)
})

const createJob = async () => {
  const job = await models.Job.create({
                      name: 'upload-files',
                      userId: 4,
                      status: 'open'
                    })
  console.log('Job created: ', job)
  return job
}

const genderIntToStr = (gender) => {
  if (gender === 1) {
    return 'Male'
  } else if (gender === 2) {
    return 'Female'
  } else if (gender === 3) {
    return 'Fetus'
  } else {
    return 'na'
  }
}

const genderStrToInt = (gender) => {
  if (gender.toLowerCase() === 'male') {
    return 1
  } else if (gender.toLowerCase() === 'female') {
    return 2
  } else if (gender.toLowerCase() === 'fetus') {
    return 3
  } else {
    return 0
  }
}

const createTask = async (jobId, ownerId, hpoTerms, relation, ethnicity, _gender, filePath, lab_id) => {
  let gender = genderStrToInt( _gender )
  
  const taskData = {
    owner_id: ownerId,
    hpo_terms: hpoTerms,
    relation: relation,
    ethnicity: ethnicity,
    gender: gender,
    file_path: filePath,
    lab_id: lab_id
  }

  const task = await models.Task.create({
                      name: `upload-job-${ownerId}`,
                      job_id: jobId,
                      status: 'ready',
                      task_data: JSON.stringify(taskData)
                    })
  console.log('Task created: ', task)
  return task
}

router.get('/:lab_id', (req, res) => {
    var statistics = {}
    models.Lab.findOne({ where: { id: req.params.lab_id } })
        .then((lab) => {
            models.LabOwner.count({ where: { LabId: lab.id } }).then((cnt) => {
                statistics.numOwners = cnt;
                lab.getOwners().then((ownerList) => {
                    if (ownerList) {
                        if (ownerList.length) {
                            statistics.minBirth = new Date(ownerList.reduce((min, p) => p.birth_date < min ? p.birth_date : min, ownerList[0].birth_date)).toDateString();
                            statistics.maxBirth = new Date(ownerList.reduce((max, p) => p.birth_date > max ? p.birth_date : max, 0)).toDateString();
                            statistics.numFemale = ownerList.reduce((ftot, p) => p.gender ? (ftot + 1) : ftot, 0);
                            statistics.numMale = cnt - statistics.numFemale;
                        }
                    }
                    res.render('mylab', { name: lab.name, id: lab.id, ownersList: null })
                    // res.render('mylab', { name: lab.name, id: lab.id, Test: true })
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
});

router.get('/:lab_id/owners', (req, res) => {
    models.Lab.findOne({ where: { id: req.params.lab_id } }, { order: Sequelize.literal('id', 'ASC') })
        .then((lab) => {
            lab.getOwners({ order: Sequelize.literal('id', 'ASC') }).then((ownerList) => {
                res.render('mylab', { name: lab.name, id: lab.id, ownersList: ownerList });
            }).catch((err) => console.log(err))
        })
        .catch(err => console.log(err));
});

router.get('/:lab_id/owners/:owner_id/reverse', (req, res) => {

    ownCtl.deleteOwner(req.params.owner_id, req.params.lab_id).then((result) => {
        res.redirect(`/lab/${req.params.lab_id}/owners/`);
    }).catch((err) => {
        res.redirect(`/lab/${req.params.lab_id}/owners/`);
    })
});

router.get('/:lab_id/test', (req, res) => {
    models.Lab.findOne({ where: { id: req.params.lab_id } })
        .then((lab) => {
            lab.getOwners().then((ownerList) => {
                res.render('mylab', { name: lab.name, id: lab.id, Test: true });
            }).catch((err) => console.log(`lab.getOwners (/:lab_id/test). Exception:  ${err}`))
        })
        .catch(err => console.log(`lab.findOne (/:lab_id/test). Exception: ${err}`))
});

router.post('/:lab_id/test2', (req, res) => {
    delete req.body.file;

    console.log(`Adding ${JSON.stringify(req.body)}`)
    userObj = { userName: req.body.name, email: req.body.email, password: '12345' }
    // delete req.body.name;
    // delete req.body.email;
    // delete req.body.password;

    ownCtl.createOwner(req.body, userObj, req.params.lab_id).then((result) => {
        res.redirect(`/lab/${req.params.lab_id}/`);
    }).catch((err) => console.log(err));

});

router.get('/:lab_id/owners/:owner_id/', (req, res) => {
    console.log(`Looking for lab ${req.params.lab_id}`)
    models.Lab.findOne({ where: { id: req.params.lab_id } })
        .then((lab) => {
            console.log(`Found lab ${lab.name}`)
            models.Owner.findOne({ where: { id: req.params.owner_id } })
                .then((ownerRec) => {
                    console.log(`Found owner ${ownerRec.identity}`)
                    models.User.findOne({ where: {OwnerId: req.params.owner_id }})
                        .then((userRec) => {
                            console.log(`Found user ${userRec.id}`)
                            //ownerRec.getFiles()
                             models.File.findAll({where: {ownerId:ownerRec.id}})
                            .then((fileRec)=>{
                                console.log(`Found file ${fileRec[0].url}`)
                                res.render('mylab',{ name: lab.name, id: lab.id, owner:ownerRec, user:userRec, files:fileRec })
                                console.log(`render`)
                            }).catch((err) =>{
                                console.log(`Could not find file, error:${err}`)
                            })
                        }).catch((err) => {
                            console.log(`Could not find user, error:${err}`)
                        })
                }).catch((err) => {
                    console.log(`Could not find owner, error:${err}`)
                })
        }).catch((err) => {
            console.log(`Could not find lab, error:${err}`)
        })
});

module.exports = router;
