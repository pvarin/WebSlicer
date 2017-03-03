// TODO: break these files apart and setup a real build system

var glObject; // global WebGL context for the object
var glSlice; // global WebGL context for the slice

////////////////////////////////////////
//  Functions for reading local files //
////////////////////////////////////////

function loadSTL(file){
  var reader = new FileReader()

  reader.onload = function(evt){
    var buffer = reader.result
    console.log(isBinarySTL(buffer))
    var stl;
    if (isBinarySTL(buffer)){
      stl = readBinarySTL(buffer);
    } else{
      stl = readAsciiSTL(buffer);
    }
    console.log(stl)// TODO draw the STL in the browser
    drawObject(stl.vertices, stl.indices);
  }

  reader.onprogress = function(evt){
    console.log('loading in progress')
    if (evt.lengthComputable){
      console.log('loaded ' + evt.loaded + ' of ' + evt.total)
    }
  }

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
  console.log('Read ' + numTriangles + ' triangles, so there should be ' + bytesPerTriangle*numTriangles + ' bytes of data');
  console.log('There are ' + triangleView.byteLength + ' bytes of data');
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

//////////////////////////////////
//  WebGL Functions for Drawing //
//////////////////////////////////

function initWebGL(canvas) {
  gl = null;
  
  // Try to grab the standard context. If it fails, fallback to experimental.
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
  }
  
  return gl;
}

function drawObject(vertices, indices){
  vertexBuffer = glObject.createBuffer();
  indexBuffer = glObject.createBuffer();
  glObject.bindBuffer(glObject.ARRAY_BUFFER, vertexBuffer);
  glObject.bindBuffer(glObject.ELEMENT_ARRAY_BUFFER, indexBuffer);
  glObject.bufferData(glObject.ARRAY_BUFFER, vertices, glObject.STATIC_DRAW);
  glObject.bufferData(glObject.ELEMENT_ARRAY_BUFFER, indices, glObject.STATIC_DRAW);
  
  // TODO: setup the shader

  console.log("drawing triangles");
  console.log("detected " + indices.length + " vertices");
  console.log("enum" + glObject.TRIANGLES);
  glObject.drawElements(glObject.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
}

//////////////
//  On Load //
//////////////

window.onload = function() {
  var fileInput = document.getElementById('file_input');
  var objectCanvas = document.getElementById('object_view');
  var sliceCanvas = document.getElementById('slice_view');

  // initialize the WebGL contexts
  glObject = initWebGL(objectCanvas);
  glSlice = initWebGL(sliceCanvas);

  // setup the object canvas
  glObject.getExtension("OES_element_index_uint");
  glObject.clearColor(.5,.5,.5,1);
  glObject.enable(glObject.DEPTH_TEST);
  glObject.depthFunc(glObject.LEQUAL);
  glObject.clear(glObject.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // setup the slice canvas
  glSlice.clearColor(.5,.5,.5,1);
  glSlice.clear(glObject.COLOR_BUFFER_BIT);

  fileInput.addEventListener('change', function(evt){
    var file = fileInput.files[0];// Note: MIME type not available for STL
    loadSTL(file);
  });
};