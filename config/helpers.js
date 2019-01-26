module.exports.debug = function (optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);

  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  }
};

var labid = '';
var gender = 'Male';
var genderIcon = 'fas fa-male';
var deleted ='fa fa-trash';
var aDate = "mm/dd/yyyy";
var bDate = null;
var blood='X';
module.exports.putlabid = function (optionalValue) {
  labid = '/lab/' + optionalValue;
  //console.log(`putval: ${labid} Optional Value ${''+optionalValue+"/"}`);
};

module.exports.putlabid2 = function (optionalValue) {
  labid = '/admin/labs/' + optionalValue;
  //console.log(`putval: ${labid} Optional Value ${''+optionalValue+"/"}`);
};

module.exports.getlabid = function () {
  return labid;
}

module.exports.setFemale = function () {
  gender = 'Female';
  genderIcon='fas fa-female';
}

module.exports.getGender = function () {
  return gender;
}

module.exports.getGenderIcon = function () {
  return genderIcon;
}

module.exports.setDel = function () {
  deleted = 'fa fa-undo';
}

module.exports.clearDel = function () {
  deleted = 'fa fa-trash';
}

module.exports.getDel = function () {
  console.log(deleted)
  return deleted;
}

module.exports.getADate = function() {
  return aDate;
}

module.exports.setADate = function(someDate) {
  aDate = someDate.toDateString();
}

module.exports.getBDate = function() {
  return bDate;
}

module.exports.setBDate = function(someDate) {
  if(someDate) bDate = someDate.toDateString(); else bDate='';
}

module.exports.setBlood = function(someBlood) {
  console.log(`Blood:${someBlood}`)
  if(someBlood===1) blood='A';
  if(someBlood===2) blood='B';
  if(someBlood===3) blood='AB';
  if(someBlood===4) blood='O';
}

module.exports.getBlood = function() {
  return blood;
}
