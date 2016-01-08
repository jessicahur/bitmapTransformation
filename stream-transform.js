var fs = require('fs');
var Transform = require('stream').Transform;
var util = require('util');

var fileName = '../non-palette-bitmap.bmp';
var outputName = '../non-palette-invertStream.bmp';
var header = new Buffer(54); //assume dealing with window bitmapinfoheader
var offsetHeader = 0;
var offsetTransform = 0;
var imageInfo = {};

var originalImageStream = fs.createReadStream(fileName);
var outputImageStream = fs.createWriteStream(outputName);

function processHeaderStream(){
  Transform.call(this);
}
util.inherits(processHeaderStream, Transform);

function transformBitmapStream(){
  Transform.call(this);
}
util.inherits(transformBitmapStream, Transform);

//Define stream that processes header
var headerStream = new processHeaderStream();
processHeaderStream.prototype._transform = function (chunk, encoding, finish){
  if (offsetHeader < header.length){
    chunk.copy(header, offsetHeader);
    offsetHeader += chunk.length;
    if (offsetHeader > header.length){
      this.push(chunk);
    }
    finish();
  }
  else {
    if (Object.keys(imageInfo) === []){
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

//Define stream that processes color palette
var colorTransformStream = new transformBitmapStream();
transformBitmapStream.prototype._transform = function(chunk, encoding, finish){
  this.push(chunk);
  finish();
}

//watch stream
function watchStream( name, stream ){
    stream.on( 'data', data => {
        console.log( name, '==>', data );
    });
}
watchStream('originalImageStream', originalImageStream);
watchStream('colorTransformStream', colorTransformStream);

originalImageStream.pipe(headerStream).pipe(colorTransformStream).pipe(outputImageStream);
// .pipe(colorTransformStream).pipe(outputImageStream);
// first.pipe(colorTransformStream);
