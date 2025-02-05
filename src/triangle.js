//triangle class
class Triangle{

    //class constructor
    constructor(){
        
        this.type = 'triangle';

        this.position = [0.0, 0.0, 0.0];

        this.color = [1,1,1,1];

        this.size = 5;

    }

    render() {

        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the color of a point to u_FragColor variable
        gl.uniform1f(u_Size, size);

        // Draw
        var d = this.size/200;

        drawTriangle([xy[0]-d/2, xy[1]-d/2, xy[0]+d/2, xy[1]-d/2, xy[0], xy[1]+d/2]);

    }

}

function drawTriangle(vertices){

    var n = 3;

    var vertexBuffer = gl.createBuffer();

    if(!vertexBuffer){

        console.log("crash out");

        return;

    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function drawTriangle3D(vertices){

    var n = 3;

    var vertexBuffer = gl.createBuffer();

    if(!vertexBuffer){

        console.log("crash out");

        return;

    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}