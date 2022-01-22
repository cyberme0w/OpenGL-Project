/*****
/* Beispielprogramm für die Lehrveranstaltung Computergraphik
/* HS RheinMain
/* Prof. Dr. Ralf Dörner
/* basierend auf einem Programm von Edward Angel
/* http://www.cs.unm.edu/~angel/WebGL/
/****/

////////////////////////////////////
// Deklaration globaler Variablen //
////////////////////////////////////

var YELLOW = vec4(1.0, 0.8, 0.0, 1.0);
var GREEN = vec4(0.0, 1.0, 0.0, 1.0);
var RED = vec4(1.0, 0.0, 0.0, 1.0);
var BLUE = vec4(0.0, 0.0, 1.0, 1.0);

var canvas;                 // Referenz auf Bereich, in den gezeichnet wird
var gl;                     // Referenz auf WebGL-Kontext, über die OpenGL Befehle ausgeführt werden
var program;                // Referenz auf die Shaderprogramme
var modelWorldOrigin;       // Matrix für die Umrechnung Objektkoordinaten -> Weltkoordinaten
var modelZRotationCube;     // Matrix für die Umrechnung Objektkoordinaten -> Weltkoordinaten
var modelXRotationCube;     // Matrix für die Umrechnung Objektkoordinaten -> Weltkoordinaten
var modelLowerPyramide;     // Matrix für die Umrechnung Objektkoordinaten -> Weltkoordinaten
var modelUpperPyramide;     // Matrix für die Umrechnung Objektkoordinaten -> Weltkoordinaten
var view;                   // Matrix für die Umrechnung Weltkoordinaten -> Kamerakoordinaten
var projection;             // Matrix für die Umrechnung Kamerakoordinaten -> Clippingkoordinaten
var normalMat;              // Matrix für die Umrechnung von Normalen aus Objektkoordinaten -> Viewkoordinaten

var lighting;               // Do lighting calculation

var numVertices = 0;         // Anzahl der Eckpunkte der zu zeichenden Objekte 
var rotationEnabled = false; // Enables global x/y/z Rotation

var vertices = []; // Array, in dem die Farben der Eckpunkte der zu zeichnenden Objekte eingetragen werden

var pointsArray = []; // Eckpunkte
var normalsArray = []; // Normale je Eckpunkt
var colorsArray = []; // Farben je Eckpunkt

// Variablen für die Drehungen
var axis = 0;
var thetaWorld = [0, 0, 0];
var thetaAxis = [0, 0, 0];
var thetaZRotationCube = [0, 0, 0];
var thetaXRotationCube = [0, 0, 0];

// Variablen, um die Anzahl der Frames pro Sekunde zu ermitteln
var then = Date.now();
var interval;
var counter = 0;
var fpsCheckInterval = 20; // Anzahl der Frames zw. FPS Berechnungen

var nBuffer; // OpenGL-Speicherobjekt für Farben
var vBuffer; // OpenGL-Speicherobjekt für Vertices
var nBuffer; // OpenGL-Speicherobjekt für Normalen

// Variablen für die Kamera
var FOV = 60;
var NEAR = 0.01;
var FAR = 100;
var ASPECT = 0; // 0->1:1, 1->4:3, 2->16:9


//////////////////////
// Object Functions //
//////////////////////

// Draw a square
function quad(a, b, c, d) {
    // Funktion, die ein Quadrat in das pointsArray, colorsArray und normalsArray einträgt
    // Das Quadrat wird dabei in zwei Dreiecke trianguliert, da OpenGL keine Vierecke nativ zeichnen kann.
    // Übergeben werden für Indices auf die vier Eckpunkte des Vierecks

    // zunächst wird die Normale des Vierecks berechnet. t1 ist der Vektor von Eckpunkt a zu Eckpunkt b
    // t2 ist der Vektor von Eckpunkt von Eckpunkt a zu Eckpunkt c. Die Normale ist dann das 
    // Kreuzprodukt von t1 und t2
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[a]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    // und hier kommt die Eintragung der Infos für jeden Eckpunkt (Koordinaten, Normale, Farbe) in die globalen Arrays
    // allen Eckpunkten wird die gleiche Farbe zugeordnet, dabei 

    // erstes Dreieck
    pointsArray.push(vertices[a]); 
    normalsArray.push(normal);
    colorsArray.push(colors[a]);

    pointsArray.push(vertices[b]); 
    normalsArray.push(normal);
    colorsArray.push(colors[a]);

    pointsArray.push(vertices[c]); 
    normalsArray.push(normal);
    colorsArray.push(colors[a]);
    
    // zweites Dreieck
    pointsArray.push(vertices[a]);  
    normalsArray.push(normal); 
    colorsArray.push(colors[a]);
    
    pointsArray.push(vertices[c]); 
    normalsArray.push(normal); 
    colorsArray.push(colors[a]);
    
    pointsArray.push(vertices[d]); 
    normalsArray.push(normal);
    colorsArray.push(colors[a]);

    // durch die beiden Dreiecke wurden 6 Eckpunkte in die Array eingetragen
    numVertices += 6;    
}

// Draw a cube, given a position and side length
function drawCube(x, y, z, side_len) {
    // zunächst werden die Koordinaten der 8 Eckpunkte des Würfels definiert
    var half_len = side_len/2;
    vertices = [
        vec4( -half_len + x, -half_len + y,  half_len + z, 1.0 ), // 0
        vec4( -half_len + x,  half_len + y,  half_len + z, 1.0 ), // 1
        vec4(  half_len + x,  half_len + y,  half_len + z, 1.0 ), // 2 
        vec4(  half_len + x, -half_len + y,  half_len + z, 1.0 ), // 3
        vec4( -half_len + x, -half_len + y, -half_len + z, 1.0 ), // 4
        vec4( -half_len + x,  half_len + y, -half_len + z, 1.0 ), // 5
        vec4(  half_len + x,  half_len + y, -half_len + z, 1.0 ), // 6
        vec4(  half_len + x, -half_len + y, -half_len + z, 1.0 )  // 7
    ];

    // hier werden verschiedene Farben definiert (je eine pro Eckpunkt)
    colors = [
        vec4( 1.0, 0.0, 0.0, 1.0 ), // 0
        vec4( 1.0, 1.0, 0.0, 1.0 ), // 1
        vec4( 0.0, 1.0, 0.0, 1.0 ), // 2
        vec4( 0.0, 1.0, 1.0, 1.0 ), // 3
        vec4( 0.0, 0.0, 1.0, 1.0 ), // 4
        vec4( 1.0, 0.0, 1.0, 1.0 ), // 5
        vec4( 1.0, 0.0, 0.0, 1.0 ), // 6
        vec4( 1.0, 1.0, 0.0, 1.0 )  // 7
    ];

    // und hier werden die Daten der 6 Seiten des Würfels in die globalen Arrays eingetragen
    // jede Würfelseite erhält eine andere Farbe
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);


    // die eingetragenen Werte werden an den Shader übergeben
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var cPosition = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(cPosition);
}
// Draw a cube, given a position, with side length = 1 
function drawDefaultSizeCube(x, y, z) {
    drawCube(x,y,z,1);
}
// Draw a cube at origin w/ side_len = 1
function drawOriginReferenceCube() {
    drawDefaultSizeCube(0, 0, 0);
}

// Draw a pyramide
function drawPyramide(x,y,z, width, length, height) {
    var half_width = width/2;
    var half_length = length/2;

    vertices = [
        vec4( x + half_length, y, z + half_width), // 0
        vec4( x + half_length, y, z - half_width), // 1
        vec4( x - half_length, y, z - half_width), // 2
        vec4( x - half_length, y, z + half_width), // 3
        vec4( x, y + height, z) // 4
    ];

    colors = [
        vec4( 1.0, 1.0, 1.0, 1.0 ), // 0
        vec4( 1.0, 1.0, 0.0, 1.0 ), // 1
        vec4( 1.0, 1.0, 1.0, 1.0 ), // 2
        vec4( 1.0, 0.0, 1.0, 1.0 ), // 3
        vec4( 1.0, 0.0, 1.0, 1.0 ), // 4
    ];

    quad(3, 2, 1, 0);
    quad(0, 1, 4, 0);
    quad(1, 2, 4, 1);
    quad(2, 3, 4, 2);
    quad(3, 0, 4, 3);


    // Pass everything to shader
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var cPosition = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(cPosition);
}
// Draw an inverted pyramide
function drawInvertedPyramide(x,y,z, width, length, height) {
    var half_width = width/2;
    var half_length = length/2;

    vertices = [
        vec4( x + half_length, y, z + half_width), // 0
        vec4( x + half_length, y, z - half_width), // 1
        vec4( x - half_length, y, z - half_width), // 2
        vec4( x - half_length, y, z + half_width), // 3
        vec4( x, y - height, z) // 4
    ];

    colors = [
        vec4( 1.0, 1.0, 0.0, 1.0 ), // 0
        vec4( 0.0, 1.0, 0.0, 1.0 ), // 1
        vec4( 0.0, 1.0, 1.0, 1.0 ), // 2
        vec4( 0.0, 0.0, 1.0, 1.0 ), // 3
        vec4( 1.0, 0.0, 1.0, 1.0 ), // 4
    ];

    quad(0, 1, 2, 3);
    quad(4, 1, 0, 4);
    quad(4, 2, 1, 4);
    quad(4, 3, 2, 4);
    quad(4, 0, 3, 4);

    // Pass everything to shader
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var cPosition = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(cPosition);
}

/////////////////////////////////////
// Funktionen zum Aufbau der Szene //
/////////////////////////////////////

// Innere und äußere Parameter der Kamera setzen
function setCamera() {
    // Check which camera is selected
    var camIndex = document.getElementById("Cameralist").selectedIndex;

	var eye; // Camera floats here
    var vrp; // Camera looks here
    var upv; // "up" vector
	
    switch (camIndex) {
        case 0: // original
            eye = vec3(12, 12, 4);
            vrp = vec3( 0,  0, 0);
            upv = vec3( 0,  1, 0);    
            break;
        case 1: // x-axis
            eye = vec3(10, 0, 0);
            vrp = vec3( 0, 0, 0);
            upv = vec3( 0, 1, 0);
            break;
        case 2: // y-axis
            eye = vec3( 0, 12, 0);
            vrp = vec3( 0, 0, 0);
            upv = vec3(-1, 0, 0);
            break;
        case 3: // z-axis
            eye = vec3(0,0,10);
            vrp = vec3(0,0,0);
            upv = vec3(0,1,0);
            break;
        case 4: // pyramids touch tips <3
            eye = vec3(12, 12, 4);
            vrp = vec3( 0,  4, 0);
            upv = vec3( 0,  1, 0);
            break;
        default:
            break;
    }

    // set the view matrix with the vars defined above
    view = lookAt(eye, vrp, upv);
    
    // die errechnete Viewmatrix wird an die Shader übergeben 
    // die Funktion flatten löst dabei die eigentlichen Daten aus dem Javascript-Array-Objekt
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "viewMatrix"), false, flatten(view));

    // nachdem die inneren Parameter gesetzt wurden, werden nun die äußeren Parameter gesetzt
    // dazu wird die Projektionmatrix mit einer Hilfsfunktion aus einem externen Javascript (MV.js) definiert
    // der Field-of-View wird auf 60 Grad gesetzt, das Seitenverhältnis ist 1:1 (d.h. das Bild ist quadratisch),
    // die near-Plane hat den Abstand 0.01 von der Kamera und die far-Plane den Abstand 100
    projection = perspective(FOV, canvas.width/canvas.height, NEAR, FAR);
    
    // die errechnete Viewmatrix wird an die Shader übergeben
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projection));
}

// die Funktion spezifiziert die Lichtquellen, führt schon einen Teil der Beleuchtungsrechnung durch
// und übergibt die Werte an den Shader
// der Parameter materialDiffuse ist ein vec4 und gibt die Materialfarbe für die diffuse Reflektion an
function calculateLights(materialDiffuse) {
    // zunächst werden die Lichtquellen spezifiziert (bei uns gibt es eine Punktlichtquelle)
    var lightPosition = vec4(7.0, 7.0, 0.0, 1.0); // die Position der Lichtquelle (in Weltkoordinaten)
    var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0); // die Farbe der Lichtquelle im diffusen Licht

    // dann wird schon ein Teil der Beleuchtungsrechnung ausgeführt - das könnte man auch im Shader machen
    // aber dort würde diese Rechnung für jeden Eckpunkt (unnötigerweise) wiederholt werden. Hier rechnen wir
    // das Produkt aus lightDiffuse und materialDiffuse einmal aus und übergeben das Resultat. Zur Multiplikation
    // der beiden Vektoren nutzen wir die Funktion mult aus einem externen Javascript (MV.js)
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
        
    // die Werte für die Beleuchtungsrechnung werden an die Shader übergeben

    // Übergabe der Position der Lichtquelle
    // flatten ist eine Hilfsfunktion, welche die Daten aus dem Javascript - Objekt herauslöst
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );

    // Übergabe des diffuseProduct
     gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
}

// Die Funktion setzt die Szene zusammen, dort wird ein Objekt nach dem anderen gezeichnet
function displayScene() {
    // Die Kamera für das Bild wird gesetzt (View-Matrix und Projection-Matrix zur Kamera berechnen)
    setCamera(); 

    var drawWorldOriginCube = false; // TODO: Don't forget to turn this off at the end
    var drawZRotationCube = true;
    var drawXRotationCube = true;
    var drawLowerPyramide = true;
    var drawUpperPyramide = true;
    var drawCancerPyramide = true;
    var drawKettle = true;

    if(drawWorldOriginCube) {
        // Reset global vars
        numVertices = 0;
        pointsArray.length = 0;
        colorsArray.length = 0;
        normalsArray.length = 0;
        
        // Fill arrays with object data
        drawOriginReferenceCube();

        // Set lighting in shader or cpu
        lighting = false;
        gl.uniform1i(gl.getUniformLocation(program, "lighting"),lighting);

        if(lighting) {
            // Set diffuse reflection color and calculate
            var materialDiffuse = YELLOW;
            calculateLights(materialDiffuse);
        } else {
            // pre-defined colors were already given in the draw-function
        };

        // Define where the object is in the world (Steps are executed bottom-up)
        // Initialize identity matrix
        modelWorldOrigin = mat4();
        // 3: Rotate x-axis
        modelWorldOrigin = mult(modelWorldOrigin, rotate(thetaWorld[0], [1, 0, 0]));
        // 2: Rotate y-axis
        modelWorldOrigin = mult(modelWorldOrigin, rotate(thetaWorld[1], [0, 1, 0]));
        // 1: Rotate z-axis
        modelWorldOrigin = mult(modelWorldOrigin, rotate(thetaWorld[2], [0, 0, 1]));
            
        // Pass model matrix to shader
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelWorldOrigin));
            
        // Calculate the normal matrix
        normalMat = mat4();
        normalMat = mult(view, modelWorldOrigin);
        normalMat = inverse(normalMat);
        normalMat = transpose(normalMat);
            
        // Pass normal matrix to shader
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "normalMatrix"), false, flatten(normalMat));

        // Draw everything. The vertex shader gets called numVertices times. 
        // Variables for each object get set and we tell OpenGL it should group every
        // 3 vertices to a triangle.
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    if(drawZRotationCube) {
        numVertices = 0;
        pointsArray.length = 0;
        colorsArray.length = 0;
        normalsArray.length = 0;
        
        drawDefaultSizeCube(5, 0, 1);

        var lighting = true;
        gl.uniform1i(gl.getUniformLocation(program, "lighting"),lighting);

        if (lighting) {
            var materialDiffuse = YELLOW;
            calculateLights(materialDiffuse);
        }

        // Model Matrix
        modelZRotationCube = mat4();

        // 4: Rotate cube around the world origin (world rotation)
        modelZRotationCube = mult(modelZRotationCube, rotate(thetaWorld[0], [1, 0, 0] ));
        modelZRotationCube = mult(modelZRotationCube, rotate(thetaWorld[1], [0, 1, 0] ));
        modelZRotationCube = mult(modelZRotationCube, rotate(thetaWorld[2], [0, 0, 1] ));

        // 3: Translate cube back to its position
        modelZRotationCube = mult(modelZRotationCube, translate(5, 0, 1));

        // 2: Rotate cube over its own center
        modelZRotationCube = mult(modelZRotationCube, rotate(thetaZRotationCube[0], [1, 0, 0] ));
        modelZRotationCube = mult(modelZRotationCube, rotate(thetaZRotationCube[1], [0, 1, 0] ));
        modelZRotationCube = mult(modelZRotationCube, rotate(thetaZRotationCube[2], [0, 0, 1] ));

        // 1: Translate from position to center
        modelZRotationCube = mult(modelZRotationCube, translate(-5, 0, -1));
        
        // Pass to shader
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelZRotationCube));

        // Normal Matrix
        normalMatZRotationCube = mat4();
        normalMatZRotationCube = mult(view, modelZRotationCube);
        normalMatZRotationCube = inverse(normalMatZRotationCube);
        normalMatZRotationCube = transpose(normalMatZRotationCube);
            
        // Pass to shader
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "normalMatrix"), false, flatten(normalMatZRotationCube));

        // Draw everything.
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    if(drawXRotationCube) {
        numVertices = 0;
        pointsArray.length = 0;
        colorsArray.length = 0;
        normalsArray.length = 0;

        drawCube(5, 0, -3, 2);

        var lighting = true;
        gl.uniform1i(gl.getUniformLocation(program, "lighting"),lighting);

        if (lighting) {
            var materialDiffuse = GREEN;
            calculateLights( materialDiffuse );
        }

        // Model Matrix (Keep in mind, transformations are calculated "bottom up")
        modelXRotationCube = mat4();

        // 4: Rotate cube around the world origin (global rotation)
        modelXRotationCube = mult(modelXRotationCube, rotate(thetaWorld[0], [1, 0, 0] ));
        modelXRotationCube = mult(modelXRotationCube, rotate(thetaWorld[1], [0, 1, 0] ));
        modelXRotationCube = mult(modelXRotationCube, rotate(thetaWorld[2], [0, 0, 1] ));

        // 3: Translate cube back to its position
        modelXRotationCube = mult(modelXRotationCube, translate(5,0,-3));

        // 2: Rotate cube on its own center
        modelXRotationCube = mult(modelXRotationCube, rotate(thetaXRotationCube[0], [1, 0, 0] ));
        modelXRotationCube = mult(modelXRotationCube, rotate(thetaXRotationCube[1], [0, 1, 0] ));
        modelXRotationCube = mult(modelXRotationCube, rotate(thetaXRotationCube[2], [0, 0, 1] ));

        // 1: Translate cube to origin
        modelXRotationCube = mult(modelXRotationCube, translate(-5, 0, 3));

        // Pass Model-Matrix to the shader
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelXRotationCube));
        
        // Calculate Normal-Matrix
        normalMat = mat4();
        normalMat = mult(view, modelXRotationCube);
        normalMat = inverse(normalMat);
        normalMat = transpose(normalMat);
            
        // Pass Normal-Matrix to the shader
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "normalMatrix"), false, flatten(normalMat));

        // Draw everything
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    if(drawLowerPyramide) {
        numVertices = 0;
        pointsArray.length = 0;
        colorsArray.length = 0;
        normalsArray.length = 0;

        drawPyramide(0, 0, 0, 2, 4, 4);

        // Calculate lighting
        var lighting = true;
        gl.uniform1i(gl.getUniformLocation(program, "lighting"),lighting);

        if (lighting) {
            var materialDiffuse = YELLOW;
            calculateLights(materialDiffuse);
        }


        // Define position and rotation of object within world coordinates w/ functions from MV.js
        // Keep in mind, transformations are calculated "in reverse"
        modelLowerPyramide = mat4();

        // Rotate pyramide around the world origin (global rotation)
        modelLowerPyramide = mult(modelLowerPyramide, rotate(thetaWorld[0], [1, 0, 0] ));
        modelLowerPyramide = mult(modelLowerPyramide, rotate(thetaWorld[1], [0, 1, 0] ));
        modelLowerPyramide = mult(modelLowerPyramide, rotate(thetaWorld[2], [0, 0, 1] ));

        // Pass Model-Matrix to the shader
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelLowerPyramide));
           
        
        // Calculate Normal-Matrix
        normalMat = mat4();
        normalMat = mult(view, modelLowerPyramide);
        normalMat = inverse(normalMat);
        normalMat = transpose(normalMat);
            
        // Pass Normal-Matrix to the shader
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "normalMatrix"), false, flatten(normalMat));

        // Draw it
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    if(drawUpperPyramide) {
        numVertices = 0;
        pointsArray.length = 0;
        colorsArray.length = 0;
        normalsArray.length = 0;

        drawInvertedPyramide(0, 8, 0, 2, 4, 4);

        // Uncomment to turn off lighting
        // lighting = false;
        gl.uniform1i(gl.getUniformLocation(program, "lighting"),lighting);

        if(lighting) {
            var materialDiffuse = RED;
            calculateLights(materialDiffuse);
        } else {
            // pre-defined colors were already given in the draw-function
        };


        // Define position and rotation of object within world coordinates w/ functions from MV.js
        // Keep in mind, transformations are calculated "in reverse"
        modelUpperPyramide = mat4();

        // Rotate pyramide around the world origin (global rotation)
        modelUpperPyramide = mult(modelUpperPyramide, rotate(thetaWorld[0], [1, 0, 0]));
        modelUpperPyramide = mult(modelUpperPyramide, rotate(thetaWorld[1], [0, 1, 0]));
        modelUpperPyramide = mult(modelUpperPyramide, rotate(thetaWorld[2], [0, 0, 1]));

        // Pass Model-Matrix to the shader
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelLowerPyramide));
        

        // Calculate Normal-Matrix
        normalMat = mat4();
        normalMat = mult(view, modelLowerPyramide);
        normalMat = inverse(normalMat);
        normalMat = transpose(normalMat);
            
        // Pass Normal-Matrix to the shader
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "normalMatrix"), false, flatten(normalMat));

        // Draw it
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    // TODO
    if(drawCancerPyramide) {
        // Reset global vars
        numVertices = 0;
        pointsArray.length = 0;
        colorsArray.length = 0;
        normalsArray.length = 0;
        
        // Fill arrays with object data
        drawPyramide(0,0,0,2,4,4);

        // Uncomment lighting = false to turn off lighting.
        // Pass lighting information to shader
        gl.uniform1i(gl.getUniformLocation(program, "lighting"),lighting);

        if(lighting) {
            var materialDiffuse = BLUE;
            calculateLights(materialDiffuse);
        } else {
            // pre-defined colors were already given in the draw-function
        };

        // es muss noch festgelegt werden, wo das Objekt sich in Weltkoordinaten befindet,
        // d.h. die Model-Matrix muss errechnet werden. Dazu werden wieder Hilfsfunktionen
        // für die Matrizenrechnung aus dem externen Javascript MV.js verwendet
    
        // Initialisierung mit der Einheitsmatrix 
        modelBluePyramide = mat4();
        
        modelBluePyramide = mult(modelBluePyramide, rotate(thetaWorld[0], [1, 0, 0] ));
        modelBluePyramide = mult(modelBluePyramide, rotate(thetaWorld[1], [0, 1, 0] ));
        modelBluePyramide = mult(modelBluePyramide, rotate(thetaWorld[2], [0, 0, 1] ));

        modelBluePyramide = mult(modelBluePyramide, translate(0, 6.67, 0.67));
        modelBluePyramide = mult(modelBluePyramide, rotate(104, [1, 0, 0]));
        modelBluePyramide = mult(modelBluePyramide, scalem(0.4, 0.4, 0.4));
        
        // die Model-Matrix ist fertig berechnet und wird an die Shader übergeben 
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelBluePyramide));
            
        // jetzt wird noch die Matrix errechnet, welche die Normalen transformiert
        normalMat = mat4();
        normalMat = mult(view, modelBluePyramide);
        normalMat = inverse(normalMat);
        normalMat = transpose(normalMat);

        // die Normal-Matrix ist fertig berechnet und wird an die Shader übergeben 
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "normalMatrix"), false, flatten(normalMat));

        // schließlich wird alles gezeichnet. Dabei wird der Vertex-Shader numVertices mal aufgerufen
        // und dabei die jeweiligen attribute - Variablen für jeden einzelnen Vertex gesetzt
        // außerdem wird OpenGL mitgeteilt, dass immer drei Vertices zu einem Dreieck im Rasterisierungsschritt
        // zusammengesetzt werden sollen
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    }

    // TODO
    if(drawKettle) {

    }
}

// Define nameless function to var "render" which will get called every frame
var render = function() {
    // init Framebuffer (where the Frame gets written) and init z-Buffer (for depth)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Animation
    if(rotationEnabled) {
        thetaWorld[axis] += 2.0; // Rotate thetaWorld by 2 degrees on current axis
    }
    thetaZRotationCube[2] += 0.6; // GL.2a - Rotate ZCube: ~10 seconds per rotation w/ ~60fps -> 360/(10*60)
    thetaXRotationCube[0] += 1.2; // GL.2b - Rotate XCube: ~5 seconds per rotation w/ ~60fps -> 360/(5*60)


    displayScene();
        
    requestAnimFrame(render); // GL.1a

    // Berechne und zeige FPS
    if(counter < fpsCheckInterval) counter++;
    else {
        fps = fpsCheckInterval / ((Date.now() - then) / 1000); // Interval ist die Zeit in Sekunden zw. FPS checks

        // Edit text in fps element
        document.getElementById("fps").textContent = "FPS: " + String(fps).match("..") + " (alle " + fpsCheckInterval + " Frames berechnet)";

        // Reset for next check
        counter = 0;
        then = Date.now();
    }
}


/////////////////////////////////////////
// Funktionen zur Ausführung von WebGL //
/////////////////////////////////////////

// Diese Funktion wird beim Laden der HTML-Seite ausgeführt. Sie ist so etwas wie die "main"-Funktion
// Ziel ist es, WebGL zu initialisieren
window.onload = function init() {

    // Reference to OpenGL canvas
    canvas = document.getElementById("gl-canvas");
    
    // Reference to OpenGL (interface to functions)
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {alert("WebGL isn't available");}

    // Viewport settings (picture position/size in canvas)
    gl.viewport(0, 0, canvas.width, canvas.height);
  
    // die Hintergrundfarbe wird festgelegt
    // gl.clearColor(0.9, 0.9, 1.0, 1.0);
    gl.clearColor(0.3, 0.3, 0.4, 0.4);
    
    // die Verdeckungsrechnung wird eingeschaltet: Objekte, die näher an der Kamera sind verdecken
    // Objekte, die weiter von der Kamera entfernt sind
    gl.enable(gl.DEPTH_TEST);

    // der Vertex-Shader und der Fragment-Shader werden initialisiert
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    
    // die über die Refenz "program" zugänglichen Shader werden aktiviert
    gl.useProgram(program);

	// OpenGL Speicherobjekte anlegen
    vBuffer = gl.createBuffer();
    nBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();
    
    // Define button behaviour (change axis and surprise button)
    document.getElementById("ButtonX").onclick = function() {axis = 0;};
    document.getElementById("ButtonY").onclick = function() {axis = 1;};
    document.getElementById("ButtonZ").onclick = function() {axis = 2;};
    document.getElementById("ButtonT").onclick = function() {rotationEnabled = !rotationEnabled;};
    document.getElementById("ButtonFOV").onclick = function() {
        var b = document.getElementById("ButtonFOV");
        FOV = (FOV == 60) ? 30 : 60;
        b.textContent = "Change FOV (current = " + FOV + ")";
    }
    document.getElementById("ButtonNear").onclick = function() {
        var b = document.getElementById("ButtonNear");
        NEAR = (NEAR == 0.01) ? 15 : 0.01;
        b.textContent = "Change Near Clipping Plane (current = " + NEAR + ")";

    }
    document.getElementById("ButtonAspect").onclick = function() {
        var b = document.getElementById("ButtonAspect");
        switch (ASPECT) {
            case 0:
                canvas.width = 800;
                b.textContent = "Change Aspect Ratio (current: 4:3)";
                ASPECT = 1;
                break;
            case 1:
                canvas.width = 1067;
                b.textContent = "Change Aspect Ratio (current: 16:9)";
                ASPECT = 2;
                break;
            case 2:
                canvas.width = 600;
                b.textContent = "Change Aspect Ratio (current: 1:1)";
                ASPECT = 0;
            default:
                break;
        }
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    document.getElementById("hehe").onclick = function() {
        var c = document.getElementById("gl-canvas");
        c.style.display = (c.style.display == "block") ? "none" : "block";
        var rr = document.getElementById("rr");
        rr.style.display = (rr.style.display == "block") ? "none" : "block";
        var h = document.getElementById("hehe");
        h.textContent = (h.textContent == "Click me if you dare") ? 
            h.textContent = "you just got rick rolled!!1!" : h.textContent = "Click me if you dare";
    }
    
    

	// jetzt kann mit dem Rendern der Szene begonnen werden  
    render();
}
