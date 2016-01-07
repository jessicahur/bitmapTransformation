var fs           = require('fs');
var fileName = '../bitmapI.bmp';

/*
1. 10 bytes offset to reach the 4bytes info of where the array starts
2. In this case, buf.readUIntLE(10) -> 1078 : array starts at 1078 index
3.

*/
function transform(){
  fs.readFileSync(fileName, function(err, data){
    if (err){
      throw err;
    }
    else{
      var buf = data;
      if (buf.toString('utf-8',0,2) !== 'BM'){
        throw new Error('Type of file loaded is not a Bitmap file. Header type read does not match \'BM\''); //https://github.com/imccunn/bmp-transform/blob/master/lib/Bitmap.js
      }
      var START_PX = buf.readUIntLE(10);
    }
  });
}
