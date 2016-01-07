var assert = require('chai').assert;
var Bmp = require('../getImage');
var fileName = '../heart.bmp';

describe('open file and read info', function(){
  it('should open and read the file, then emit event which trigger the callback trasform function', function(){
    var getBmp = new Bmp();
    getBmp.on('image loaded', function(data){
      console.log(data);
    });

    getBmp.loadImage(fileName);
  });
}); //end of describe


