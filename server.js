require('dotenv').config()

const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('sequelize');
const ownerCtl = require('./controllers/Owner');
const models = require('./models/index');

const Owner = models.Owner;
const OwnerInfo = models.OwnerInfo;

models.sequelize.sync({ force: false }).then((res) => {
    console.log('sync done!!')
    initdb()
}).catch((err) => console.log('err sync:', err));

function initdb() {
    // models.Lab.create({
    //     name: 'Pronto',
    //     user_name: 'Shira',
    //     user_email: 'Shira@pronto.com',
    //     user_pass: '11111'
    // }).then((res) => { console.log('created lab') }).catch((err) => console.log('error creating lab:',err));
    // // Owner.destroy({where:{id:7}}).then((res)=>console.log('delete user:success')).
    // // catch((err)=>console.log('delete user: Failure'));
    // // OwnerInfo.destroy({where:{id:7}}).then((res)=>console.log('delete user:success')).
    // // catch((err)=>console.log('delete user: Failure'));
    //ownerCtl.createOwner({name:'Avi', email:'avi@geneyx.com', password:'12345'}, 1);
    // ownerCtl.createOwner('Raviv', 'raviv@geneyx.com', '12345', 1);
    //ownerCtl.createOwner('Dudu2', 'dudu2@geneyx.com', '12345');
    //console.log('---> Owner created');
    console.log('Finished InitDB');
}

const app = express();

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

app.get('/', (req, res) => res.render('index', { layout: 'landing' }));

app.use('/admin/', require('./routes/admin'));

app.use('/lab', require('./routes/lab'));

const PORT = 5000;

var date = new Date();
var hour = date.getHours();
hour = (hour < 10 ? "0" : "") + hour;
var min = date.getMinutes();
min = (min < 10 ? "0" : "") + min;

app.listen(PORT, console.log(`Server started on port ${PORT}, time:${hour}:${min}`));
