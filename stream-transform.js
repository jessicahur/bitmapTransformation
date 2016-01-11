var fs = require('fs');
var Transform = require('stream').Transform;
var Chunker = require('stream-chunker');
var util = require('util');

var fileName = '../bitmapI.bmp';
var outputName = '../bitmapIStream.bmp';
var fileName2 = '../non-palette-bitmap.bmp';
var outputName2 = '../non-palette-bitmapStream.bmp';

var header = new Buffer(54); //assume dealing with window bitmapinfoheader
var offsetHeader = 0;
var offsetTransform = 0;
var imageInfo = {};
var test = 0;

var originalImageStream = fs.createReadStream(fileName2);
var outputImageStream = fs.createWriteStream(outputName2);

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
      offsetTransform = offsetHeader - header.length;
      this.push(chunk);
      finish();
    }
    else {
      this.push(chunk);
      finish();
    }
  }
}

//Define stream that processes color transformation
var colorTransformStream = new transformBitmapStream();
transformBitmapStream.prototype._transform = function(chunk, encoding, finish){
  offsetTransform += chunk.length;
  if (imageInfo.sizePalette > 0 && (offsetTransform > imageInfo.sizeDIB + 14) && (offsetTransform < 54 + imageInfo.sizePalette)){
    for (var ii = 0; ii < chunk.length; ii ++){
      chunk[ii] = invert(chunk[ii], 0);
    }
  } else {
    if (offsetTransform > imageInfo.offsetPixelArray) {
      if (offsetTransform - imageInfo.offsetPixelArray < 54){
        for(var jj = offsetTransform - imageInfo.offsetPixelArray; jj < chunk.length; jj ++){
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
}

//watch stream
function watchStream( name, stream ){
  stream.on( 'data', data => {
    console.log( name, '==>', data );
    console.log(data.length);
  });
}
watchStream('originalImageStream', originalImageStream);
watchStream('chunker', chunker);
watchStream('colorTransformStream', colorTransformStream);

originalImageStream.pipe(chunker).pipe(headerStream).pipe(colorTransformStream).pipe(outputImageStream);
// .pipe(colorTransformStream).pipe(outputImageStream);
// first.pipe(colorTransformStream);
