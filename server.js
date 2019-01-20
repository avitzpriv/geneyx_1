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
    initdb()
}).catch((err) => console.log('err sync:', err));

function initdb() {
    // models.Lab.create({
    //     name: 'Pronto',
    // }).then((res) => { 
    //     console.log(`################## Created lab ${res.id}`);
    //     models.User.create({
    //         userName: 'Shira',
    //         email: 'shira@pronto.com',
    //         type: 3, //lab
    //         labId: res.id,
    //         password: '11111'            
    //     }) .catch((err) => console.log('error creating user for lab'));
    // }).catch((err) => console.log('error creating lab:',err));

    // // // Owner.destroy({where:{id:7}}).then((res)=>console.log('delete user:success')).
    // // // catch((err)=>console.log('delete user: Failure'));
    // // // OwnerInfo.destroy({where:{id:7}}).then((res)=>console.log('delete user:success')).
    // // // catch((err)=>console.log('delete user: Failure'));
    // models.User.create({
    //     userName:'Avi', email:'avi@geneyx.com', password:'12345',type:1
    // })
    // ownerCtl.createOwner({},{userName:'Raviv', email:'raviv@geneyx.com', password:'12345'}, 1);
    // //ownerCtl.createOwner('Dudu2', 'dudu2@geneyx.com', '12345');
    // //console.log('---> Owner created');
    // console.log('Finished InitDB');
}


// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

// Handlebars
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: require('./config/helpers.js'),
    partialsDir: path.join(__dirname,'/views/partials')
}
));
app.set('view engine', 'handlebars');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle sessions
app.use(session({
    secret : 'secret',
    saveUninitialized : true,
    resave : true
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
    if(req.user) {
        if(req.user.constructor.name==='Lab') {
            console.log(`Lab ${req.user.name} id:${req.user.id}`);
            res.redirect(`/lab/${req.user.id}`);
        }
        if(req.user.constructor.name==='User') {
            console.log(`Admin ${req.user.userName}`);
            res.redirect('/admin');
        }
    } else res.render('index', { layout: 'landing', message: req.flash() })
});

app.use('/admin/', require('./routes/admin'));

app.use('/lab', require('./routes/lab'));

app.use('/login', require('./routes/login'));
///////////////////////////////////////////////////////////////////////////////////
//  For Socket.io
///////////////////////////////////////////////////////////////////////////////////
io.on('connection', (socket) => {
  console.log('socket.io connected, setting up uploads listeners')
  require('./config/server-upload-logic').socketIoSetup(socket)
})

//app.use('/login', require('./routes/login'));

//const PORT = 5000;

//var date = new Date();
//var hour = date.getHours();
//hour = (hour < 10 ? "0" : "") + hour;
//var min = date.getMinutes();
//min = (min < 10 ? "0" : "") + min;

//app.listen(PORT, console.log(`Server started on port ${PORT}, time:${hour}:${min}`));
