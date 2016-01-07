var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var fs           = require('fs');
var fileName = '../heart.bmp';
function Bmp(){
  EventEmitter.call(this);
}

util.inherits(Bmp, EventEmitter);

Bmp.prototype.loadImage = function(fileName){
  fs.readFile(fileName, function(err, data){
    if (err) {
      console.log(err.message);
    } else{

    }
  });//end of readFileSync
}//end of loadImage
var getBmp = new Bmp();
getBmp.on('image loaded', function(data){
  console.log(data);
});

getBmp.loadImage(fileName);


module.exports = Bmp;
