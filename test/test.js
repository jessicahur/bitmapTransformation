var assert = require('chai').assert;
var transform = require('../transform');
var streamTransform = require('../stream-transform');
var fs = require('fs');

var fileName = './palette-bitmap.bmp';
var fileName2 = './non-palette-bitmap.bmp';

streamTransform(fileName2, '../5.bmp');

describe('transform bitmap offstream', function() {

  it('should subtract the buffer content from 255', function() {
    var buf1 = new Buffer(3);
    var buf1compare = new Buffer([0,0,0]);
    buf1.fill(255);
    for (var ii = 0; ii < buf1.length; ii ++){
      buf1[ii] = transform.options['invert'](buf1[ii], 0);
    }

    assert.equal(buf1.compare(buf1compare), 0, 'it fails the test');
  });

  it('should multiply the buffer content by the constant', function() {
    var buf2 = new Buffer([255, 0, 1]);
    var buf2compare = new Buffer([255,0,5]);
    for (var kk = 0; kk < buf2.length; kk ++){
      buf2[kk] = transform.options['grayscale'](buf2[kk], 5);
    }
    assert.equal(buf2.compare(buf2compare), 0, 'it fails the test');
  });

  //end-to-end test
  it('should produce the matching image as the non palette standard via invert', function() {
    var buf3 = fs.readFileSync('./test/non-pal-I.bmp');
    transform.doIt(fileName2, '../1.bmp', 'invert', 0);
    var buf3compare = fs.readFileSync('../1.bmp');
    assert.equal(buf3.compare(buf3compare), 0, 'it fails the test');
  });

  it('should produce the matching image as the non palette standard via grayscale', function() {
    var buf4 = fs.readFileSync('./test/non-pal-gray.bmp');
    transform.doIt(fileName2, '../2.bmp', 'grayscale', 5);
    var buf4compare = fs.readFileSync('../2.bmp');
    assert.equal(buf4.compare(buf4compare), 0, 'it fails the test');
  });

  it('should produce the matching image as the palette standard via invert', function() {
    var buf5 = fs.readFileSync('./test/pal-invert.bmp');
    transform.doIt(fileName, '../3.bmp', 'invert', 0);
    var buf5compare = fs.readFileSync('../3.bmp');
    assert.equal(buf5.compare(buf5compare), 0, 'it fails the test');
  });

  it('should produce the matching image as the palette standard via grayscale', function() {
    var buf6 = fs.readFileSync('./test/pal-gray.bmp');
    transform.doIt(fileName, '../4.bmp', 'grayscale', 5);
    var buf6compare = fs.readFileSync('../4.bmp');
    assert.equal(buf6.compare(buf6compare), 0, 'it fails the test');
  });

  //end to end test for streaming
  it('should produce the matching image as the palette standard via invert stream', function() {
    var buf7 = fs.readFileSync('./test/stream-pal.bmp');
    streamTransform(fileName, '../5.bmp');
    var buf7compare = fs.readFileSync('../5.bmp');
    assert.equal(buf7.compare(buf7compare), 0, 'it fails the test');
  });
  it('should produce the matching image as the non-palette standard via invert stream', function() {
    var buf8 = fs.readFileSync('./test/non-pal-I.bmp');
    streamTransform(fileName2, '../6.bmp');
    var buf8compare = fs.readFileSync('../6.bmp');
    assert.equal(buf8.compare(buf8compare), 0, 'it fails the test');
  });
});

