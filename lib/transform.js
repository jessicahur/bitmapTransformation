/*
1. 10 bytes offset to reach the 4bytes info of where the array starts
2. In this case, buf.readUIntLE(10) -> 1078 : array starts at 1078 index
3. Read from where array starts to array ends (buf.length)
4. Depends on the option of transform, perform the transformation accodrdingly
5. If the transform option is not supported, throw error
*/
'use strict';
var fs = require('fs');
var transform = {
  options: {
    'invert': invert,
    'grayscale': scale,
    'red': scale,
    'green': scale,
    'blue': scale
  }
};
function invert(integer, constant){
  return 255 - integer;
}
function scale(integer, constant){
  var output = integer*constant;
  if(output>255){
    return 255;
  } else{
    return output;
  }
}

transform.doIt = function(file, option, constant){
  fs.readFile(file, function(err, data){
    if (err){
      throw err;
    }
    var buf = data;
    //check if file is BMP
    if (buf.toString('utf-8',0,2)!=='BM'){
      throw 'Type of file loaded is not a Bitmap file. Header type read does not match \'BM\''; //https://github.com/imccunn/bmp-transform/blob/master/lib/Bitmap.js
    }
    //check if the option of transformation is supported
    var inputOption = option;
    var options = Object.keys(transform.options);
    if (options.indexOf[inputOption]===-1){
      throw 'This transformation is not supported';
    }
    //run transformation here
    var offset = buf.readUInt32LE(10);
    var constantInput = constant;
    for (var ii = offset; ii<buf.length; ii++){
      var integer = buf[ii];
      // console.log(integer);
      buf[ii] = transform.options[inputOption](integer, constantInput);
    }
    fs.writeFileSync('../../bitmap2.bmp',buf);
  });//end of readFile
};//end of doIt
var fileName = '../../bitmapI.bmp';
transform.doIt(fileName, 'invert',2);
module.exports = transform;
