// TODO: setup a real build system to compile everything

window.onload = function() {
  var fileInput = document.getElementById('file_input');
  var objectCanvas = document.getElementById('object_view');
  var sliceCanvas = document.getElementById('slice_view');

  // initialize the WebGL contexts
  glObject = initWebGL(objectCanvas);
  glSlice = initWebGL(sliceCanvas);
  initShaders(glObject);
  initBuffers(glObject);

  // setup the object canvas
  glObject.getExtension("OES_element_index_uint");
  glObject.clearColor(1.0,1.0,1.0,1.0);
  glObject.enable(glObject.DEPTH_TEST);
  glObject.depthFunc(glObject.LEQUAL);
  glObject.clear(glObject.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // setup the slice canvas
  glSlice.clearColor(1.0,1.0,1.0,1.0);
  glSlice.clear(glObject.COLOR_BUFFER_BIT);

  fileInput.addEventListener('change', function(evt){
    var file = fileInput.files[0];// Note: MIME type not available for STL
    loadSTL(file);
  });
};