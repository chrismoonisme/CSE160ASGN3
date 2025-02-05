// ColoredPoint.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE = ` 
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() { 
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
  }`

// Fragment shader program
var FSHADER_SOURCE = ` 
  precision mediump float; 
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//GLSL global vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

//setup webgl
function setupWebGL(){
    //get canvas elem
    canvas = document.getElementById('webgl', {preserveDrawingBuffer: true});
    //get rendering context for webgl
    gl = getWebGLContext(canvas);
    //on error
    if(!gl){
        console.log("failed to get rendering context for WebGL");
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

//connect GLSL vars
function connectVariablesToGLSL(){

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    u_ModelMatrix =gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_modelmatrix');
        return;
    }
    u_GlobalRotateMatrix =gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_globalrotatematrix');
        return;
    }
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}
  
//UI globals
let g_selectedColor = [1,1,1,1];
let g_globalAngle = 0;
let g_neckAngle = 0;
let g_hatAngle = 0;
let g_headAngle = 0;
let g_legAngle = 0;
let g_animation = false;


//html ui
function addActionsforHtmlUI(){

    document.getElementById('on').onclick = function(){
        g_animation = true;
    };
    document.getElementById('off').onclick = function(){
        g_animation = false;
        g_hatAngle = 0;
        g_headAngle = 0;
        g_neckAngle = 0;
        g_legAngle = 0;
    };
    document.getElementById('angleSlide').addEventListener('mousemove', function(){

        g_globalAngle = this.value;
        renderScene();

    });

    document.getElementById('neck').addEventListener('mousemove', function(){

        g_neckAngle = this.value;
        renderScene();

    });

    document.getElementById('head').addEventListener('mousemove', function(){

        g_headAngle = this.value;
        renderScene();

    });

    document.getElementById('hat').addEventListener('mousemove', function(){

        g_hatAngle = this.value;
        renderScene();

    });

}


//main
function main() {

    //set up webgl
    setupWebGL();
    //connect GLSL vars
    connectVariablesToGLSL();
    //HTML ui elements
    addActionsforHtmlUI();
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 1, 1.0);
    //renderAllShapes();
    
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000
var g_seconds = performance.now()/1000-g_startTime;

function tick(){

    g_seconds = performance.now()/1000-g_startTime;

    updateAnimationAngles();

    renderScene();

    requestAnimationFrame(tick);

}

function updateAnimationAngles(){

    if(g_animation){

        g_neckAngle = 10*Math.sin(g_seconds);

        g_headAngle = 5*Math.sin(g_seconds);

        g_legAngle = 20*Math.sin(g_seconds);
    }
}

//shape list
var g_shapesList = [];
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];



//renderScene function
function renderScene(){

    var startTime = performance.now();
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //body
    var body = new Cube();
    body.color = [.9, .9, 1, 1];
    body.matrix.translate(-.25, -.3, 0);
    body.matrix.scale(0.45,.5,.5);
    body.render();
    //tail
    var tail = new Cube();
    tail.color = [1, 1, 1, 1];
    tail.matrix.translate(-.37, -.1, -.05);
    tail.matrix.scale(0.45,.27,.6);
    tail.render();
    //neck
    var neck = new Cube();
    neck.color = [1, 1, 1, 1];
    neck.matrix.rotate(g_neckAngle,0,0,1)

    //if(g_animation){
        //neck.matrix.rotate(10*Math.sin(g_seconds),0,0,1)
    //}else{
        //neck.matrix.rotate(g_neckAngle, 0, 0, 1);
    //}
    
    neck.matrix.translate(.1, -.2, .125);
    neck.matrix.scale(.2, .7 , .25);
    neck.render();

    var neckCoordsMat = new Matrix4(neck.matrix);
    //head
    var head = new Cube();
    head.color = [.9, .9, 1, 1];
    head.matrix = new Matrix4(neckCoordsMat);
    head.matrix.translate(0, 1, 0);
    head.matrix.scale(1.2, .35 , 1);
    head.matrix.rotate(g_headAngle, 0, 0, 1);
    head.render();

    var headCoordsMat = new Matrix4(head.matrix);
    
    //beak1
    var beak1 = new Cube();
    beak1.color = [1, 0.3, 0, 1];
    beak1.matrix = new Matrix4(headCoordsMat);
    beak1.matrix.translate(1, .1, .25);
    beak1.matrix.scale(.2, .7 , .5);
    beak1.render();
    //beak2
    var beak2 = new Cube();
    beak2.color = [1, 0.3, 0, 1];
    beak2.matrix = new Matrix4(headCoordsMat);
    beak2.matrix.translate(1.2, .1, .25);
    beak2.matrix.scale(.2, .4 , .5);
    beak2.render();
    //eye1
    var eye1 = new Cube();
    eye1.color = [0, 0, 0, 1];
    eye1.matrix = new Matrix4(headCoordsMat);
    eye1.matrix.translate(.5, .3, -.1);
    eye1.matrix.scale(.3, .3 , .2);
    eye1.render();
    //eye2
    var eye2 = new Cube();
    eye2.color = [0, 0, 0, 1];
    eye2.matrix = new Matrix4(headCoordsMat);
    eye2.matrix.translate(.5, .3, .9);
    eye2.matrix.scale(.3, .3 , .2);
    eye2.render();
    //hat
    var hat = new Cone();
    hat.color = [1, 0, 0, 1];
    hat.matrix = new Matrix4(headCoordsMat);
    hat.matrix.translate(0,1,0);
    hat.matrix.rotate(g_hatAngle, 0, 0, 1);
    hat.render();

    //leg1
    var leg1 = new Cube();
    leg1.color = [1, 0.3, 0, 1];
    leg1.matrix.rotate(g_legAngle, 0, 0, 1);
    leg1.matrix.translate(-.1, -.5, .1);
    leg1.matrix.scale(.1, .3 , .1);
    leg1.render();

    var leg1CoordsMat = new Matrix4(leg1.matrix);

    //foot1
    var foot1 = new Cube();
    foot1.color = [1, 0.3, 0, 1];
    foot1.matrix = new Matrix4(leg1CoordsMat);
    foot1.matrix.translate(0, 0, 0);
    foot1.matrix.scale(2, .2 , 1);
    foot1.render();

    //leg
    var leg2 = new Cube();
    leg2.color = [1, 0.3, 0, 1];
    leg2.matrix.rotate(-g_legAngle, 0, 0, 1);
    leg2.matrix.translate(-.1, -.5, .3);
    leg2.matrix.scale(.1, .3 , .1);
    leg2.render();

    var leg2CoordsMat = new Matrix4(leg2.matrix);
    
    //foot2
    var foot2 = new Cube();
    foot2.color = [1, 0.3, 0, 1];
    foot2.matrix = new Matrix4(leg2CoordsMat);
    foot2.matrix.translate(0, 0, 0);
    foot2.matrix.scale(2, .2 , 1);
    foot2.render();

    var duration = performance.now() - startTime;
    sendTextToHtml( " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "fpsDisplay");

}

function sendTextToHtml(text, htmlID){

    var htmlElm = document.getElementById(htmlID);

    htmlElm.innerHTML = text;

}
