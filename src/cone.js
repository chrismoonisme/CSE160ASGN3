class Cone{

    constructor(sides = 30){

        this.type = 'cone';

        this.color = [1, 1, 1, 1];

        this.matrix = new Matrix4();
        
        this.sides = sides; 

    }

    render(){
        
        var rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let centerX = 0.5
        let centerY = 0;
        let centerZ = 0.5; 
        let radius = 0.5;
        let apex = [0.5, 1, 0.5]; 

        let angleStep = (2 * Math.PI) / this.sides;

        for(let i = 0; i < this.sides; i++){

            let theta1 = i * angleStep;

            let theta2 = (i + 1) * angleStep;

            let x1 = centerX + radius * Math.cos(theta1);

            let z1 = centerZ + radius * Math.sin(theta1);

            let x2 = centerX + radius * Math.cos(theta2);

            let z2 = centerZ + radius * Math.sin(theta2);

            drawTriangle3D([centerX, centerY, centerZ, x1, centerY, z1, x2, centerY, z2]);

        }

        gl.uniform4f(u_FragColor, rgba[0] - 0.2, rgba[1] - 0.2, rgba[2] - 0.2, rgba[3]);

        for(let i = 0; i < this.sides; i++){

            let theta1 = i * angleStep;

            let theta2 = (i + 1) * angleStep;

            let x1 = centerX + radius * Math.cos(theta1);

            let z1 = centerZ + radius * Math.sin(theta1);

            let x2 = centerX + radius * Math.cos(theta2);

            let z2 = centerZ + radius * Math.sin(theta2);

            drawTriangle3D([x1, centerY, z1, x2, centerY, z2, apex[0], apex[1], apex[2]]);
            
        }

    }

}
