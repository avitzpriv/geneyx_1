module.exports.debug = function(optionalValue) {
    console.log("Current Context");
    console.log("====================");
    console.log(this);
  
    if (optionalValue) {
      console.log("Value");
      console.log("====================");
      console.log(optionalValue);
    }
  };

  var labid='';
  module.exports.putlabid = function(optionalValue) {
    labid='/lab/'+optionalValue;
    console.log(`putval: ${labid} Optional Value ${''+optionalValue+"/"}`);
  };

  module.exports.putlabid2 = function(optionalValue) {
    labid='/admin/labs/'+optionalValue;
    console.log(`putval: ${labid} Optional Value ${''+optionalValue+"/"}`);
  };

  module.exports.getlabid = function() {
    return labid;
  }
