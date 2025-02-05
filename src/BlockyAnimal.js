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

    // Get the storage location of u_Size
    //u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    //if (!u_Size) {
        //console.log('Failed to get the storage location of u_Size');
        //return;
    //}

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

// Pumpkin-drawing function
function drawPumpkin() {
    // Clear existing shapes
    g_shapesList = [];

    // Define pumpkin triangles (positions normalized to [-1, 1] range)
    const triangles = [

        [[-0.4, 0.3], [0, 0.3], [-0.2, 0.4]],

        [[0.4, 0.3], [0, 0.3], [0.2, 0.4]],

        [[-0.2, -0.3], [0.2, -0.3], [0, 0]],
        
    ];

    // Create and add triangles to g_shapesList
    for (const triangle of triangles) {
        const t = new Triangle();
        t.position = triangle[0];
        t.vertex2 = triangle[1]; // Assume Triangle class has support for 3 vertices
        t.vertex3 = triangle[2];
        t.color = [1.0, 0.5, 0.0, 1.0]; // Pumpkin color
        t.size = 20;
        g_shapesList.push(t);
    }

    // Render all shapes
    renderAllShapes();
}

//UI globals
let g_selectedColor = [1,1,1,1];
let g_selectedSize = 5;
let g_selectedType = 0;
let g_selectedSegments = 12;
let g_globalAngle = 0;
let g_neckAngle = 0;

let g_purpleAngle = 0;


//html ui
function addActionsforHtmlUI(){



    document.getElementById('square').onclick = function(){

        g_selectedType = 0;

    };

    document.getElementById('triangle').onclick = function(){

        g_selectedType = 1;

    };

    document.getElementById('circle').onclick = function(){

        g_selectedType = 2;

    };


    document.getElementById('angleSlide').addEventListener('mousemove', function(){

        g_globalAngle = this.value;

        renderAllShapes();

    });

    document.getElementById('neck').addEventListener('mousemove', function(){

        g_neckAngle = this.value;

        renderAllShapes();

    });

    document.getElementById('purpleSlide').addEventListener('mousemove', function(){

        g_purpleAngle = this.value;

        renderAllShapes();

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

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;

    canvas.onmousemove = function(ev){

        if(ev.buttons == 1){

            click(ev);

        }

    };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 1, 1.0);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);

    renderAllShapes();

}

//shape list
var g_shapesList = [];

var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];

//click
function click(ev) {

    let [x,y] = convertCoordinatesEventToGL(ev);

    //point object
    let point;

    if(g_selectedType == 0){

        point = new Point();

    }else if(g_selectedType == 1){

        point = new Triangle();

    }else if(g_selectedType == 2){

        point = new Circle();

    }

    point.position = [x, y];

    point.color = g_selectedColor.slice();

    point.size = g_selectedSize;

    g_shapesList.push(point);

    //draw all shapes in canvas
    renderAllShapes();

}

//conversion 
function convertCoordinatesEventToGL(ev){

    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    //convert
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);

}

//render 
function renderAllShapes(){


    var startTime = performance.now();

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //rendering
    //var len = g_shapesList.length;

    //for(var i = 0; i < len; i++) {

        //g_shapesList[i].render();

    //}

    //body
    var body = new Cube();
    body.color = [1, 1, 1, 1];
    body.matrix.translate(-.25, -.2, 0);
    body.matrix.scale(0.45,.5,.5);
    body.render();

    //tail
    var tail = new Cube();
    tail.color = [1, 1, 1, 1];
    tail.matrix.translate(-.37, 0, 0);
    tail.matrix.scale(0.45,.27,.5);
    tail.render();

    var neck = new Cube();
    neck.color = [1, 1, 1, 1];

    // Apply transformations to the neck
    neck.matrix.rotate(g_neckAngle, 0, 0, 1);
    neck.matrix.translate(.2, -.1, .125);
    neck.matrix.scale(.2, .7 , .25);
    neck.render();

    // Copy the transformed neck matrix for children (head & beak)
    var neckCoordsMat = new Matrix4(neck.matrix);

    //head
    var head = new Cube();
    head.color = [.9, .9, 1, 1];
    head.matrix = new Matrix4(neckCoordsMat);
    head.matrix.translate(0, 1, 0);
    head.matrix.scale(1.2, .35 , 1);
    head.render();

    //beak1
    var beak1 = new Cube();
    beak1.color = [1, 0.3, 0, 1];
    beak1.matrix = new Matrix4(neckCoordsMat);
    beak1.matrix.translate(.7, 1, .25);
    beak1.matrix.scale(1, .15 , .5);
    beak1.render();

    //beak2
    var beak2 = new Cube();
    beak2.color = [1, 0.3, 0, 1];
    beak2.matrix = new Matrix4(neckCoordsMat);
    beak2.matrix.translate(1.2, 1.05, .25);
    beak2.matrix.scale(.2, .2 , .5);
    beak2.render();

    //eye1
    var eye1 = new Cube();
    eye1.color = [0, 0, 0, 1];
    eye1.matrix = new Matrix4(neckCoordsMat);
    eye1.matrix.translate(.5, 1.1, -.1);
    eye1.matrix.scale(.2, .1 , .2);
    eye1.render();

    //eye2
    var eye2 = new Cube();
    eye2.color = [0, 0, 0, 1];
    eye2.matrix = new Matrix4(neckCoordsMat);
    eye2.matrix.translate(.5, 1.1, .9);
    eye2.matrix.scale(.2, .1 , .2);
    eye2.render();

    //leg1
    var leg1 = new Cube();
    leg1.color = [1, 0.3, 0, 1];
    leg1.matrix.translate(-.1, -.5, .1);
    leg1.matrix.scale(.1, .3 , .1);
    leg1.render();

    //foot1
    var foot1 = new Cube();
    foot1.color = [1, 0.3, 0, 1];
    foot1.matrix.translate(-.1, -.5, .1);
    foot1.matrix.scale(.3, .05 , .1);
    foot1.render();

    //leg
    var leg2 = new Cube();
    leg2.color = [1, 0.3, 0, 1];
    leg2.matrix.translate(-.1, -.5, .3);
    leg2.matrix.scale(.1, .3 , .1);
    leg2.render();

    //foot2
    var foot2 = new Cube();
    foot2.color = [1, 0.3, 0, 1];
    foot2.matrix.translate(-.1, -.5, .3);
    foot2.matrix.scale(.3, .05 , .1);
    foot2.render();


    var duration = performance.now() - startTime;

    sendTextToHtml( " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "fpsDisplay");


}

function sendTextToHtml(text, htmlID){

    var htmlElm = document.getElementById(htmlID);

    htmlElm.innerHTML = text;


}
