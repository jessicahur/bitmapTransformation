/*
1. 10 bytes offset to reach the 4bytes info of where the array starts
2. In this case, buf.readUIntLE(10) -> 1078 : array starts at 1078 index
3. Read from where array starts to array ends (buf.length)
4. Depends on the option of transform, perform the transformation accodrdingly
5. If the transform option is not supported, throw error
6. In bitmap pixel, color is stored in the order of alpha(optional) Green - Red - Blue

Size of DIB: buf.readUInt32(14)

For palette:
1. From DIB, read if there is color palette: buf.readUInt32LE(46)
  a. 0: there is no color palette
  b. some number: the size of the color palette
2. Change color palette based on the transform option

For non-palette:
1. Determine if there no color palette
2. Go to each pixel and change its color value
*/
'use strict';
var fs = require('fs');
var transform = {
  options: {
    'invert': invert,
    'grayscale': scale
  }
};

//helper functions
function invert(integer, constant){
  return 255 - integer;
}
function scale(integer, constant){
  var output = integer*constant;
  if (output>255){
    return 255;
  } else{
    return output;
  }
}
function UserException(message) {
   this.message = message;
   this.name = "UserException";
}

transform.doIt = function(file, outputFile, option, constant){
  fs.readFile(file, function(err, data){
    if (err){
      throw err;
    }
    var buf = data;

    //check if file is BMP
    if (buf.toString('utf-8',0,2)!=='BM'){
      throw new UserException('Type of file loaded is not a Bitmap file. Header type read does not match \'BM\''); //https://github.com/imccunn/bmp-transform/blob/master/lib/Bitmap.js
    }

    //check if the option of transformation is supported
    var inputOption = option;
    var constantInput = constant;
    var outputFilePath = outputFile;
    var options = Object.keys(transform.options);
    if (options.indexOf[inputOption]===-1){
      throw new UserException('This transformation is not supported');
    }

    //run transformation here
    var sizeHeader = 14;
    var sizeDIB = buf.readUInt32LE(14);
    var sizePalette = buf.readUInt32LE(46);
    var numBitsPerPixel = buf.readUInt16LE(28);
    var offsetPixelArray = buf.readUInt32LE(10);

    //for the case of non-palette:
    if (sizePalette === 0){
      for (var ii = offsetPixelArray; ii<buf.length; ii++){
        var integer = buf[ii];
        buf[ii] = transform.options[inputOption](integer, constantInput);
      }
      fs.writeFileSync(outputFilePath,buf);
    }

    //for the case of palette:
    else {
      var paletteOffset = sizeHeader + sizeDIB;
      for (var jj = paletteOffset; jj < sizePalette; jj++){
        var integer = buf[jj];
        buf[jj] = transform.options[inputOption](integer, constantInput);
      }
      fs.writeFileSync(outputFilePath,buf);
    }
    });//end of readFile
};//end of doIt

module.exports = transform;
