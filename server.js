const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('sequelize');
const ownerCtl = require('./controllers/Owner');
const models = require('./models/index');

const Owner =models.Owner;
const OwnerInfo = models.OwnerInfo;

models.sequelize.sync({force:false}).then((res) => {
    console.log('sync done!!')
    initdb()
}).catch((err) => console.log('err sync:',err));

function initdb() {
    // models.Lab.create({
    //     name: 'hadasah',
    //     user_name: 'moshe',
    //     user_email: 'moshe@hadasa.com',
    //     user_pass: '1111'
    // }).then((res) => { console.log('created lab') }).catch((err) => console.log('error creating lab:',err));
    // console.log('---> Start App, creating owner');
    // // Owner.destroy({where:{id:7}}).then((res)=>console.log('delete user:success')).
    // // catch((err)=>console.log('delete user: Failure'));
    // // OwnerInfo.destroy({where:{id:7}}).then((res)=>console.log('delete user:success')).
    // // catch((err)=>console.log('delete user: Failure'));
    // ownerCtl.createOwner('Avi', 'avi@geneyx.com', '12345', 1);
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
app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers: require('./config/helpers.js') }));
app.set('view engine', 'handlebars');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.render('index', { layout: 'landing' }));
app.use('/labs', require('./routes/labs'));

const PORT = 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
