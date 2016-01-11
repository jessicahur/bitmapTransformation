var fs = require('fs');
var Transform = require('stream').Transform;
var Chunker = require('stream-chunker');
var util = require('util');

// var header = new Buffer(54); //assume dealing with window bitmapinfoheader
// var offsetHeader = 0;
// var totalData = 0;
// var paletteProcessed = 0;
// var imageInfo = {};

function streamTransform(inputFilePath, outputFilePath, callback) {
  var originalImageStream = fs.createReadStream(inputFilePath);
  var outputImageStream = fs.createWriteStream(outputFilePath);
  var header = new Buffer(54); //assume dealing with window bitmapinfoheader
  var offsetHeader = 0;
  var totalData = 0;
  var paletteProcessed = 0;
  var imageInfo = {};

  outputImageStream.on('finish', callback);

  function invert(integer, constant){
    return 255 - integer;
  }

  function processHeaderStream(){
    Transform.call(this);
  }
  util.inherits(processHeaderStream, Transform);

  function transformBitmapStream(){
    Transform.call(this);
  }
  util.inherits(transformBitmapStream, Transform);

  //Initiate stream chunker
  var opts = {
    flush: true
  };
  var chunker = Chunker(54,opts); //each emitted chunk is 54 bytes length buffer

  //Define stream that processes header
  var headerStream = new processHeaderStream();
  processHeaderStream.prototype._transform = function (chunk, encoding, finish){
    if (offsetHeader < header.length){
      chunk.copy(header, offsetHeader);
      offsetHeader += chunk.length;
    }
    if (offsetHeader >= header.length) {
      if (Object.keys(imageInfo).length === 0){
        imageInfo.sizeDIB = header.readUInt32LE(14);
        imageInfo.sizePalette = header.readUInt32LE(46);
        imageInfo.numBitsPerPixel = header.readUInt16LE(28);
        imageInfo.offsetPixelArray = header.readUInt32LE(10);
        this.push(chunk);
        finish();
      }
      else {
        this.push(chunk);
        finish();
      }
    }
  };

  //Define stream that processes color invert
  var colorTransformStream = new transformBitmapStream();
  transformBitmapStream.prototype._transform = function(chunk, encoding, finish){
    totalData += chunk.length;

    //If there is color palette:
    if (imageInfo.sizePalette > 0){
      var paletteOffset = 14 + imageInfo.sizeDIB;
      if (totalData > paletteOffset && paletteProcessed < imageInfo.sizePalette) {
        if (chunk.length < imageInfo.sizePalette - paletteProcessed){
          for (var ii = 0; ii < chunk.length; ii++){
            chunk[ii] = invert(chunk[ii],0);
          }
          paletteProcessed += chunk.length;
        }
        else {
          for (var ii = 0; ii < imageInfo.sizePalette - paletteProcessed; ii++){
            chunk[ii] = invert(chunk[ii],0);
          }
          paletteProcessed += chunk.length;
        }
      }
    }

    //If there is no color palette:
    else {
      if (totalData > imageInfo.offsetPixelArray) {
        if (totalData - imageInfo.offsetPixelArray < 54){
          for(var jj = totalData - imageInfo.offsetPixelArray; jj < chunk.length; jj ++){
            chunk[jj] = invert(chunk[jj], 0);
          }
        } else {
          for (var kk = 0; kk < chunk.length; kk ++) {
            chunk[kk] = invert(chunk[kk], 0);
          }
        }
      }
    }
    this.push(chunk);
    finish();
  };
  originalImageStream.pipe(chunker).pipe(headerStream).pipe(colorTransformStream).pipe(outputImageStream);
}

// var fileName2 = '../non-palette-bitmap.bmp';
// streamTransform(fileName2,'../6.bmp');

// var fileName = '../bitmapI.bmp';
// streamTransform(fileName, '../5.bmp');

module.exports = streamTransform;
