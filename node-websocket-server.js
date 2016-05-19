var uuid = require('node-uuid');
var fs = require('fs');

var ProtoBuf = require('protobufjs');
var builder = ProtoBuf.loadProtoFile("./image.proto");

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: '192.168.0.16', port: 9090 });

var imagesServed = 0;

wss.on('connection', function connection(ws) {
  
  console.log('connected');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    imagesServed++;
    console.log('responding...');
    var buffer = buildRandomMessage();
    ws.send(buffer.toArrayBuffer(), { binary: true, mask: true });
	console.log(imagesServed + ' images served');
  });

});

function buildRandomMessage() {	

  var Image = builder.build('com.josenaves.android.websocket.client.Image');
  var id = uuid.v1();
  var datetime = new Date().toISOString()
  	.replace(/T/, ' ')      // replace T with a space
  	.replace(/\..+/, '');

  var randomImg = randomImage();
  var name = randomImg.name;
  var image = new Image(id, name, datetime, randomImg.data);
  
  return image.encode();
}

function randomImage() {
  var images = ['florianopolis.jpg', 'io2016.jpg', 'google-io16.png'];
  var idx = Math.floor(Math.random() * images.length);
  console.log('Random image is ' + images[idx]);
  return { name: images[idx], data: fs.readFileSync(images[idx]) };
}

console.log('Server up. Listening on port 9090...');
//buildRandomMessage();