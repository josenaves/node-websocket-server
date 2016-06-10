var uuid = require('node-uuid');
var fs = require('fs');

var ProtoBuf = require('protobufjs');
var builder = ProtoBuf.loadProtoFile("./image.proto");

var execSync = require('child_process').execSync;

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: '0.0.0.0', port: 9080 });

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
  var name = 'florianopolis.jpg';

  var imageMini = shrinkImage(name);
  if (!imageMini) {
    console.error('Error in JPEGmini integration!');
    return;
  }

  var id = uuid.v1();
  var data = fs.readFileSync(imageMini);
  var datetime = new Date().toISOString()
    .replace(/T/, ' ')      // replace T with a space
    .replace(/\..+/, '');
  
  var imagePB = new Image(id, imageMini, datetime, data);
  
  return imagePB.encode();
}

function getTreePicture() {

  var Image = builder.build('com.josenaves.android.pb.restful.Image');
  var name = 'tree.jpg';

  var imageMini = shrinkImage(name);
  if (!imageMini) {
    console.error('Error in JPEGmini integration!');
    return;
  }

  var id = uuid.v1();
  var data = fs.readFileSync(imageMini);
  var datetime = new Date().toISOString()
    .replace(/T/, ' ')      // replace T with a space
    .replace(/\..+/, '');
  
  var imagePB = new Image(id, imageMini, datetime, data);
  
  return imagePB.encode();
}

function shrinkImage(imageFileName) {
  console.log('imageFileName = ' + imageFileName);
  var imageFileNameMini = imageFileName.replace(/(\.[\w\d_-]+)$/i, '_mini$1');
  console.log('imageFileNameMini = ' + imageFileNameMini);

  // remove file_mini.jpg
  console.log('Removing previously shrinked image...');
  try {
    fs.unlinkSync(imageFileNameMini);  
  } catch (e) {
    console.error('no ' + imageFileNameMini + ' found...' );
  }
  
  console.log('Calling JPEGmini...');

  // integration with JPEGmini
  var ret = execSync('jpegmini -f=' + imageFileName, {stdio:[0,1,2]});
  if (ret) {
    console.error("child processes failed with error code: " + error.code);
    return undefined;
  }

  return imageFileNameMini;
}

console.log('Listening on port 9080...');