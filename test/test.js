var assert = require('chai').assert;
var transform = require('../transform');
var streamTransform = require('../stream-transform');
var fs = require('fs');

var fileName = '../bitmapI.bmp';
var fileName2 = '../non-palette-bitmap.bmp';

describe('transforming bitmap offstream', function(){
  it('should process and output bitmap image with color palette', function() {

    var outputFileName = '../bitmapI_invert.bmp';

    transform.doIt(fileName, outputFileName, 'invert', 0);

    try {
      fs.statSync(outputFileName);
    }
    catch (err){
      var error = err;
    };
    assert.equal(error, null, 'it fails the first test');
  });

  it('should process and output bitmap image without color palette', function() {
    var outputFileName = '../non-palette-bitmap_grayscale.bmp';

    transform.doIt(fileName2, outputFileName, 'grayscale', 5);

    try {
      fs.statSync(outputFileName);
    }
    catch(err){
      var error = err;
    }
    assert.equal(error, null, 'it fails the second test');
  });
}); //end of describe transform bitmap offstream

describe('transform bitmap stream', function() {
  it('should invert and output bitmap image with color palette', function() {
    var outputFileName = '../bitmapI_stream_invert.bmp';

    streamTransform(fileName, outputFileName);

    try {
      var stat = fs.statSync(outputFileName);
    }
    catch (err){
      var error = err;
    }

    assert.equal(error, null, 'it fails to output the correct image');
  });

  it('should invert and output bitmap image without color palette', function() {
    var outputFileName = '../2.bmp';

    streamTransform(fileName2, outputFileName);

    try {
      var stat = fs.statSync(outputFileName);
    }
    catch (err){
      var error = err;
    }

    assert.equal(typeof stat, 'object', 'it fails to output the correct image');
  });

});//end of describe transform stream


