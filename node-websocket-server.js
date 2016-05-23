var uuid = require('node-uuid');
var fs = require('fs');

var ProtoBuf = require('protobufjs');
var builder = ProtoBuf.loadProtoFile("./image.proto");

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: '192.168.0.16', port: 9080 });

var imagesServed = 0;

wss.on('connection', function connection(ws) {
  console.log('connected');
  console.log('responding...');
  
  var buffer = getFlorianopolisPicture();
  ws.send(buffer.toArrayBuffer(), { binary: true, mask: true });

  imagesServed++;
  console.log(imagesServed + ' images served');

  // ws.on('message', function incoming(message) {
  //   console.log('received: %s', message);
  //   imagesServed++;
  //   console.log('responding...');
  //   var buffer = buildRandomMessage();
  //   ws.send(buffer.toArrayBuffer(), { binary: true, mask: true });
  //   console.log(imagesServed + ' images served');
  // });
});

function getFlorianopolisPicture() {
  var Image = builder.build('com.josenaves.android.pb.restful.Image');

  var id = uuid.v1();
  var name = 'florianopolis.jpg';
  var data = fs.readFileSync(name);
  var datetime = new Date().toISOString()
    .replace(/T/, ' ')      // replace T with a space
    .replace(/\..+/, '');
  
  var imagePB = new Image(id, name, datetime, data);
  
  return imagePB.encode();
}

console.log('Listening on port 9080...');