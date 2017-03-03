////////////////////////////////////////
//  Functions for reading local files //
////////////////////////////////////////

function loadSTL(file){
  var reader = new FileReader()

  reader.onload = function(evt){
    var buffer = reader.result
    var stl;
    if (isBinarySTL(buffer)){
      stl = readBinarySTL(buffer);
    } else{
      stl = readAsciiSTL(buffer);
    }
    drawObject(stl.vertices, stl.indices);
  }

  reader.onprogress = function(evt){
    if (evt.lengthComputable){
      console.log('progress: ' + evt.loaded + ' of ' + evt.total)
    }
  }

  console.log('loading the file')
  reader.readAsArrayBuffer(file)
}

/////////////////////////////////
//  Functions for parsing STLs //
/////////////////////////////////

function readBinarySTL(buffer){
  // the first 80 bytes are for the header and are ignored
  var data = buffer.slice(0,80);
  var numTriangles = (new Uint32Array(buffer,80,1))[0];
  var triangleView = new DataView(buffer,84);

  var vertices = new Float32Array(9*numTriangles);
  var indices = new Uint32Array(3*numTriangles);
  // four three dimensional vectors with 4 bytes per coordinate and one 2 byte attribute field
  //    float32 normal[3] (ignored)
  //    float32 point1[3]
  //    float32 point2[3]
  //    float32 point3[3]
  //    uint16  attribute_byte_count (ignored) (usually unused except for VisCam and SolidView for color info)
  // * note floating point values are little-endian
  bytesPerTriangle = 50;
  for (var i=0; i<numTriangles; i++){
    var tri = []
    for (var j=1; j<4; j++){
      vertices[i*9 + (j-1)*3] = triangleView.getFloat32(i*bytesPerTriangle + 12*j, true);
      vertices[i*9 + (j-1)*3 + 1] = triangleView.getFloat32(i*bytesPerTriangle + 12*j + 4, true);
      vertices[i*9 + (j-1)*3 + 2] = triangleView.getFloat32(i*bytesPerTriangle + 12*j + 8, true);
      indices[3*i + j - 1] = 3*i + j - 1;
    }
  }

  return {
    'vertices': vertices,
    'indices': indices
  };
}

function readAsciiSTL(buffer){
  // TODO: implement this
}

function isBinarySTL(buffer){  
  var tag = "solid";
  var start = new Uint8Array(buffer.slice(0, tag.length));
  
  for (var i=0; i<tag.length; i++){
    if (tag.charCodeAt(i) != start[i]){
      return true;
    }
  }
  return false;
}