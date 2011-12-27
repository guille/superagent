
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer()
  , fs = require('fs');

app.post('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.listen(3005);

function boundary(ct) {
  return ct.match(/boundary="(.*)"/)[1];
}

// TODO: "response" event should be a Response

describe('Request', function(){
  describe('#part()', function(){
    it('should return a new Part', function(){
      var req = request.post('http://localhost:3005');
      req.part().constructor.name.should.equal('Part');
      req.part().constructor.name.should.equal('Part');
      req.part().should.not.equal(req.part());
    })
  })
})

describe('Part', function(){
  describe('#pipe()', function(){
    describe('with a single part', function(){
      it('should construct a multipart request', function(done){
        var req = request.post('http://localhost:3005/echo');

        req
          .part()
          .set('Content-Disposition', 'attachment; name="image"; filename="image.png"')
          .set('Content-Type', 'image/png')
          .write('some image data');

        req.end(function(res){
          var ct = res.header['content-type'];
          ct.should.include.string('multipart/mixed; boundary="');
          res.body.should.eql({});
          res.files.image.name.should.equal('image.png');
          res.files.image.type.should.equal('image/png');
          done();
        });
      })
    })

    describe('with several parts', function(){
      it('should construct a multipart request', function(done){

        var req = request.post('http://localhost:3005/echo');

        req.request().write = function(data){
          data = data.replace(/\r/g, '\\r').replace(/\n/g, '\\n\n');
          process.stdout.write(data);
        };

        req.part()
          .set('Content-Type', 'image/png')
          .set('Content-Disposition', 'attachment; filename="myimage.png"')
          .write('some image data');

        var part = req.part()
          .set('Content-Type', 'image/png')
          .set('Content-Disposition', 'attachment; filename="another.png"')

        part.write('random');
        part.write('thing');
        part.write('here');

        req.part()
          .set('Content-Disposition', 'form-data; name="name"')
          .set('Content-Type', 'text/plain')
          .write('tobi');

        req.end(function(res){
          console.log(res.body);
          console.log(Object.keys(res.files));
          res.files['myimage.png'].constructor.name.should.equal('File');
        });
      })
    })

    // describe('with a Content-Type specified', function(){
    //   it('should append the boundary', function(){
    //     var req = request.post('http://localhost:3005/echo');
    // 
    //     req
    //       .type('multipart/form-data')
    //       .part()
    //       .set('Content-Type', 'image/png')
    //       .write('some image data');
    // 
    //     req.end(function(res){
    //       var ct = res.header['content-type'];
    //       ct.should.include.string('multipart/form-data; boundary="');
    // 
    //       var body = '\r\n';
    //       body += '--' + boundary(ct) + '\r\n';
    //       body += 'Content-Type: image/png\r\n';
    //       body += '\r\n';
    //       body += 'some image data';
    //       body += '\r\n--' + boundary(ct) + '--';
    // 
    //       assert(body == res.text, 'invalid multipart response');
    //     });
    //   })
    // })
  })

  // describe('#pipe(stream)', function(){
  //   it('should write to the part', function(){
  //     var req = request
  //       .post('http://localhost:3005/echo')
  //       .type('multipart/form-data');
  // 
  //     var stream = fs.createReadStream(__dirname + '/fixtures/user.html');
  // 
  //     var part = req.part();
  //     part.set('Content-Type', 'text/html');
  //     stream.pipe(part);
  // 
  //     req.on('response', function(res){
  //       console.log(res.statusCode);
  //       console.log(res.text);
  //     });
  // 
  //     // req.end(function(res){
  //     //   console.log(res.text);
  //     //   return
  //     //   var ct = res.header['content-type'];
  //     //   ct.should.include.string('multipart/form-data; boundary="');
  //     // 
  //     //   var body = '\r\n';
  //     //   body += '--' + boundary(ct) + '\r\n';
  //     //   body += 'Content-Type: image/png\r\n';
  //     //   body += '\r\n';
  //     //   body += 'some image data';
  //     //   body += '\r\n--' + boundary(ct) + '--';
  //     // 
  //     //   // assert(body == res.text, 'invalid multipart response');
  //     // });
  //   })
  // })
})
