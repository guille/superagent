
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer()
  , fs = require('fs');

app.get('/', function(req, res){
  res.header('Content-Type', 'multipart/form-data; boundary=awesome');
  // res.write('\r\n'); TODO: formidable bug
  res.write('--awesome\r\n');
  res.write('Content-Disposition: attachment; name="image"; filename="something.png"\r\n');
  res.write('Content-Type: image/png\r\n');
  res.write('\r\n');
  res.write('some data');
  res.write('\r\n--awesome\r\n');
  res.write('Content-Disposition: form-data; name="name"\r\n');
  res.write('Content-Type: text/plain\r\n');
  res.write('\r\n');
  res.write('tobi');
  res.write('\r\n--awesome--');
  res.end();
});

app.listen(3006);

describe('request multipart/form-data', function(){
  describe('req.body', function(){
    it('should be populated with fields', function(done){
      request.get('http://localhost:3006/', function(res){
        console.log(res.status);
        console.log(res.body);
        console.log(res.files);
        assert(null == res.text, 'res.text should be empty for multipart');
      });
    })
  })
})