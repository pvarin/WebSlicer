//////////////////////////////////
//  WebGL Functions for Drawing //
//////////////////////////////////

var glObject; // global WebGL context for the object
var glSlice; // global WebGL context for the slice
var mvMatrix;
var vertexBuffer;
var indexBuffer;
var vertexPositionAttribute;

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

function initBuffers(){
  vertexBuffer = glObject.createBuffer();
  indexBuffer = glObject.createBuffer();
}

function initShaders() {
  var fragmentShader = getShader(glObject, "shader-fs");
  var vertexShader = getShader(glObject, "shader-vs");

  // Create the shader program
  shaderProgram = glObject.createProgram();
  glObject.attachShader(shaderProgram, vertexShader);
  glObject.attachShader(shaderProgram, fragmentShader);
  glObject.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!glObject.getProgramParameter(shaderProgram, glObject.LINK_STATUS)) {
    alert("Unable to initialize the shader program: " + glObject.getProgramInfoLog(shader));
  }

  glObject.useProgram(shaderProgram);

  vertexPositionAttribute = glObject.getAttribLocation(shaderProgram, "aVertexPosition");
  glObject.enableVertexAttribArray(vertexPositionAttribute);
}

function getShader(gl, id) {
  var shaderScript = document.getElementById(id);

  // Didn't find an element with the specified ID; abort.
  if (!shaderScript) {
    return null;
  }

  // Walk through the source element's children, building the
  // shader source string.
  var theSource = "";
  var currentChild = shaderScript.firstChild;

  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }

    currentChild = currentChild.nextSibling;
  }

  // Now figure out what type of shader script we have,
  // based on its MIME type.

  var shader;

  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }

  // Send the source to the shader object
  gl.shaderSource(shader, theSource);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function drawObject(vertices, indices){
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);
  loadIdentity();
  mvTranslate([0.0, 0.0, -30.0]);
  
  glObject.bindBuffer(glObject.ARRAY_BUFFER, vertexBuffer);
  glObject.bufferData(glObject.ARRAY_BUFFER, vertices, glObject.STATIC_DRAW);
  glObject.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  glObject.bindBuffer(glObject.ELEMENT_ARRAY_BUFFER, indexBuffer);
  glObject.bufferData(glObject.ELEMENT_ARRAY_BUFFER, indices, glObject.STATIC_DRAW);
  
  setMatrixUniforms(glObject);

  glObject.drawElements(glObject.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
}

//////////////////////////////////////
/// WebGL Matrix Utility Functions ///
//////////////////////////////////////

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms(gl) {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}