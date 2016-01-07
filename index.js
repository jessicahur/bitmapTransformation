var fs           = require('fs');
var fileName = '../bitmapI.bmp';


function transform(){
  fs.readFile(fileName, function(err, data){
    if (err){
      throw err;
    }
    else{
      var buf = data;
      if (buf.toString('utf-8',0,2) !== 'BM'){
        throw new Error('Type of file loaded is not a Bitmap file. Header type read does not match \'BM\''); //https://github.com/imccunn/bmp-transform/blob/master/lib/Bitmap.js
      }
      var offset = buf.readUIntLE(10);
    }
  });
}
