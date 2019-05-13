require('dotenv').config()

const express = require('express');
const app = express()
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const path = require('path');
const sequelize = require('sequelize');
const ownerCtl = require('./controllers/Owner');
const models = require('./models/index');
const ownerHelper = require('./helpers/ownerHelper')
const cors = require('cors')
const jwtHelper = require('./helpers/jwtHelper')
const _   = require('lodash')
const bcrypt = require('bcryptjs')
const userHelper = require('./helpers/userHelper')
const runBatchJobs = require('./helpers/jobsHelper')

const Owner = models.Owner
const OwnerInfo = models.OwnerInfo

var server = require('http').Server(app)
var io = require('socket.io')(server)

const PORT = process.env.APP_PORT
var date = new Date()
var hour = date.getHours()
hour = (hour < 10 ? "0" : "") + hour
var min = date.getMinutes()
min = (min < 10 ? "0" : "") + min

server.listen(PORT, console.log(`Server started on port ${PORT}, time:${hour}:${min}`))

models.sequelize.sync({ force: false }).then((res) => {
    console.log('sync done!!')
    process.argv.forEach(function (val, index, array) {
        console.log(index + ': ' + val);
        // if (val === '-initdb') preinitdb();
    });
}).catch((err) => console.log('err sync:', err));

labRecords = [];
userRecords = [];
prms=[]
function preinitdb() {
  for(i=0;i<5;i++) {
      prms.push({labid:i})
  }
  for(i=0;i<5;i++) {
      for(j=0;j<5;j++) {
          prms.push({labid:i,userid:j})
      }

  }
  prms.push(null)
  initdb()

  // console.log('Createing lab user for Avi')
  // userHelper.createUser('avi', 'avi@geneyx.com', '1234', 3, 1)
  // console.log('Createing lab user for Danny')
  // userHelper.createUser('dannym', 'danny@geneyx.com', '1234', 3, 1)
  
}

function initdb(i=0) {

    // promises = [];
    // // for (i = 0; i < 2; i++) {
    //     var promise = Promise.resolve({ labid: i });
    //     promises.push(promise)
    //     for (j = 0; j < 2; j++) {
    //         var promise = Promise.resolve({ labid: i, userid: j })
    //         promises.push(promise)
    //     }
    // // }
    if(prms[i]!=null) {
           promise=Promise.resolve(prms[i])

    // console.log(`PROMISES`)
    // console.log(`--------`)
    // console.log(`>${JSON.stringify(promises)}`)
    // console.log(`========`)
    promise.then((obj) => {
        // console.log(`PROMISE OBJJ: ${JSON.stringify(objj)}`)
        // for (i = 0; i < objj.length; i++) {
            // obj = objj[i];
            console.log(`PROMISE: ${JSON.stringify(obj)}`)
            if (obj.userid>=0) {
                console.log(`This time creating owner`)
                if (labRecords[obj.labid]) {
                    bd = new Date();
                    bd.setFullYear(1960 + Math.round(Math.random() * 70), 1, 1)
                    const ownerObj = {
                        identity: `1000${obj.labid}00${obj.userid}`,
                        gender: (((Math.round(Math.random() * 10)) % 2) === 0) ? true : false,
                        blood_type: Math.round(Math.random() * 3) + 1,
                        birth_date: bd,
                    }
                    const userObj = {
                        userName: `user_${obj.labid}_${obj.userid}`,
                        email: `user_${obj.labid}_${obj.userid}@gmail.com`,
                        password: '12345'
                    }
                    fileUrl=`fastq_${obj.labid}_${obj.userid}.gz`
                    console.log(`CREATING OWNER: ${ownerObj}`)
                    ownerHelper.createOwner(ownerObj,userObj,labRecords[obj.labid].id,fileUrl).then((eee)=>{
                        initdb(i+1)
                    })
                }
            } else {
                issuedd = new Date();
                issuedd.setFullYear(1990, 1, 1)
                expiryy = new Date();
                expiryy.setFullYear(2019, 12, 31)

                lab = {
                    name: `lab${obj.labid}`,
                    address: `Hamaabadot ${i} street, Tel-Aviv`,
                    country: 'IL',
                    phone: `+972123456${obj.labid}`,
                    license: `Lic${obj.labid}${obj.labid + 1}${obj.labid + 8}`,
                    issued: issuedd,
                    expiry: expiryy,
                    updates: false
                }
                console.log(`Lab: ${JSON.stringify(lab)}`)

                models.Lab.create(lab)
                    .then((labRecord) => {
                        labRecords.push(labRecord)
                        console.log(`Lab ${obj.labid} created`);
                        userObj = {

                            email: `labuser@lab${labRecord.id - 1}.com`,
                            userName: `labuser${labRecord.id - 1}`,
                            type: 3,
                            LabId: labRecord.id,
                            password: '12345'
                        }
                        console.log(`User => ${JSON.stringify(userObj)}`)

                        models.User.create(userObj)
                            .then((userRecord) => {
                                console.log(`user: ${userObj.userName} has been created (id:${userRecord.id})`)
                                userRecords.push(userRecord)
                                console.log(`what is i:${labRecord.id}`)
                                initdb(i+1)

                            }).catch((err) => {
                                console.log(`Error creating user ${userObj.userName} : ${err}`)
                            })
                    }).catch((err) => {
                        console.log(`Error creating lab ${obj.labid} : ${err}`)
                    })

            }
//        }
    }).catch((err) => {
        console.log(`INITDB: ${err}`)
    })
    }
}

// Verify validity of call
app.use(jwtHelper.middleWareVerify)

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors())

// Handlebars
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: require('./config/helpers.js'),
    partialsDir: path.join(__dirname, '/views/partials')
}
));
app.set('view engine', 'handlebars');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle sessions
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.get('/', (req, res) => {
    if (req.user) {
        if (req.user.constructor.name === 'Lab') {
            console.log(`Lab ${req.user.name} id:${req.user.id}`);
            res.redirect(`/lab/${req.user.id}`);
        }
        if (req.user.constructor.name === 'User') {
            console.log(`Admin ${req.user.userName}`);
            res.redirect('/admin');
        }
    } else res.render('login', { layout: 'login', message: req.flash() })
})

app.use('/admin/', require('./routes/admin'))
app.use('/lab', require('./routes/lab'))
app.use('/signup', require('./routes/signup'))
app.use('/users/', require('./controllers/UserController'))
app.use('/jobs/', require('./controllers/JobsController'))


/**
 * Authenticate a user.
 */
const authenticate = (req, res, next) => {
  const { userName, password } = req.body

  if ( _.isNil(userName) || _.isNil(password) ) {
    res.render('login')
    return
  }

  models.User
    .findOne({where: {userName: userName}})
    .then((user) => {

      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (result === true) {
            const token = jwtHelper.sign({userType: 'user'}, {issuer: 'Geneyx'})
            res.writeHead(200, {
              'Set-Cookie': `ngxtoken=${token};httpOnly=true`,
              'Content-Type': 'text/plain'
            })

            res.end(`{"labid": "${user.LabId}"}`)
            return
          } else {
            res.status(403).json({message: '1 - Username or password is incorrect'})
          }
        })
      } else {
        const errorMsg = 'Username and password do not match !!'
        console.log(errorMsg)
        res.redirect(302, '/users/login?error=' + encodeURIComponent(errorMsg))
      }
    })
}

/**
 * Display a login screen
 */
const login = (req, res, next) => {
  if (req.query.error) {
    res.render('login', req.query)
  } else {
    res.render('login')
  }  
}

app.use('/authenticate', authenticate)
app.use('/login', login )

///////////////////////////////////////////////////////////////////////////////////
// Set and interval for running regular batch jobs.
// Run every 2 minutes
///////////////////////////////////////////////////////////////////////////////////
// setInterval(runBatchJobs, 1000 * 60 * 2)
// runBatchJobs()


///////////////////////////////////////////////////////////////////////////////////
//  For Socket.io
///////////////////////////////////////////////////////////////////////////////////
io.on('connection', (socket) => {
    console.log('socket.io connected, setting up uploads listeners')
    require('./helpers/server-upload-logic').socketIoSetup(socket)
})

//app.use('/login', require('./routes/login'));

//const PORT = 5000;

//var date = new Date();
//var hour = date.getHours();
//hour = (hour < 10 ? "0" : "") + hour;
//var min = date.getMinutes();
//min = (min < 10 ? "0" : "") + min;

//app.listen(PORT, console.log(`Server started on port ${PORT}, time:${hour}:${min}`));
