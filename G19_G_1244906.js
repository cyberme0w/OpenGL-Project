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

var canvas;                 // Referenz auf Bereich, in den gezeichnet wird
var gl;                     // Referenz auf WebGL-Kontext, über die OpenGL Befehle ausgeführt werden
var program;                // Referenz auf die Shaderprogramme
var modelWorldOrigin;       // Matrix für die Umrechnung Objektkoordinaten -> Weltkoordinaten
var modelZRotationCube;     // Matrix für die Umrechnung Objektkoordinaten -> Weltkoordinaten
var modelXRotationCube;     // Matrix für die Umrechnung Objektkoordinaten -> Weltkoordinaten
var view;                   // Matrix für die Umrechnung Weltkoordinaten -> Kamerakoordinaten
var projection;             // Matrix für die Umrechnung Kamerakoordinaten -> Clippingkoordinaten
var normalMat;              // Matrix für die Umrechnung von Normalen aus Objektkoordinaten -> Viewkoordinaten

var lighting = true;        // Do lighting calculation

var numVertices = 0;         // Anzahl der Eckpunkte der zu zeichenden Objekte 
var rotationEnabled = false; // Enables global x/y/z Rotation

var vertices = []; // Array, in dem die Farben der Eckpunkte der zu zeichnenden Objekte eingetragen werden

var pointsArray = []; // Eckpunkte
var normalsArray = []; // Normale je Eckpunkt
var colorsArray = []; // Farben je Eckpunkt

// Variablen für die Drehung des Würfels
var axis = 0;
var thetaWorld = [0, 0, 0];
var thetaZRotationCube = [0, 0, 0];
var thetaXRotationCube = [0, 0, 0];

// Variablen, um die Anzahl der Frames pro Sekunde zu ermitteln
var then = Date.now();
var interval;
var counter = 0;
var fpsCheckInterval = 60; // Anzahl der Frames zw. FPS Berechnungen

var nBuffer; // OpenGL-Speicherobjekt für Farben
var vBuffer; // OpenGL-Speicherobjekt für Vertices
var nBuffer; // OpenGL-Speicherobjekt für Normalen


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
    vertices = [
        vec4( -side_len/2 + x, -side_len/2 + y,  side_len/2 + z, 1.0 ), // 0
        vec4( -side_len/2 + x,  side_len/2 + y,  side_len/2 + z, 1.0 ), // 1
        vec4(  side_len/2 + x,  side_len/2 + y,  side_len/2 + z, 1.0 ), // 2 
        vec4(  side_len/2 + x, -side_len/2 + y,  side_len/2 + z, 1.0 ), // 3
        vec4( -side_len/2 + x, -side_len/2 + y, -side_len/2 + z, 1.0 ), // 4
        vec4( -side_len/2 + x,  side_len/2 + y, -side_len/2 + z, 1.0 ), // 5
        vec4(  side_len/2 + x,  side_len/2 + y, -side_len/2 + z, 1.0 ), // 6
        vec4(  side_len/2 + x, -side_len/2 + y, -side_len/2 + z, 1.0 )  // 7
    ];

    // hier werden verschiedene Farben definiert (je eine pro Eckpunkt)
    colors = [
        vec4( 1.0, 0.0, 0.0, 1.0 ),
        vec4( 1.0, 1.0, 0.0, 1.0 ),
        vec4( 0.0, 1.0, 0.0, 1.0 ),
        vec4( 0.0, 1.0, 1.0, 1.0 ),
        vec4( 0.0, 0.0, 1.0, 1.0 ),
        vec4( 1.0, 0.0, 1.0, 1.0 ),
        vec4( 1.0, 0.0, 0.0, 1.0 ),
        vec4( 1.0, 1.0, 0.0, 1.0 )
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

// Draw a square based pyramide, given coordinates for the base center, width, length and height.


/////////////////////////////////////
// Funktionen zum Aufbau der Szene //
/////////////////////////////////////

// Innere und äußere Parameter der Kamera setzen
function setCamera() {
    // es wird ermittelt, welches Element aus der Kameraauswahlliste aktiv ist
    var camIndex = document.getElementById("Cameralist").selectedIndex;

	var eye; // Punkt, an dem die Kamera steht
    var vrp; // Punkt, auf den die Kamera schaut
    var upv; // Vektor, der nach oben zeigt
	
    // hier wird die erste Kameraposition definiert
    switch (camIndex) {
        case 0: // Originalkamera
            eye = vec3(12, 12, 4);
            vrp = vec3( 0,  0, 0);
            upv = vec3( 0,  1, 0);    
            break;
        case 1: // X-Achse
            eye = vec3(10, 0, 0);
            vrp = vec3( 0, 0, 0);
            upv = vec3( 0, 1, 0);
            break;
        case 2: // Y-Achse
            eye = vec3( 0, 10, 0);
            vrp = vec3( 0, 0, 0);
            upv = vec3(-1, 0, 0);
            break;
        case 3: // Z-Achse
            eye = vec3(0,0,-10);
            vrp = vec3(0,0,0);
            upv = vec3(0,1,0);
            break;
        case 4: // Pyramidenspitze
            break;
        default:
            break;
    }

    // hier wird die Viewmatrix unter Verwendung einer Hilfsfunktion berechnet,
    // die in einem externen Javascript (MV.js) definiert wird
    view = lookAt(eye, vrp, upv);
    
    // die errechnete Viewmatrix wird an die Shader übergeben 
    // die Funktion flatten löst dabei die eigentlichen Daten aus dem Javascript-Array-Objekt
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "viewMatrix"), false, flatten(view));

    // nachdem die inneren Parameter gesetzt wurden, werden nun die äußeren Parameter gesetzt
    // dazu wird die Projektionmatrix mit einer Hilfsfunktion aus einem externen Javascript (MV.js) definiert
    // der Field-of-View wird auf 60 Grad gesetzt, das Seitenverhältnis ist 1:1 (d.h. das Bild ist quadratisch),
    // die near-Plane hat den Abstand 0.01 von der Kamera und die far-Plane den Abstand 100
    projection = perspective(60.0, 1.0, 0.01, 100.0);
    
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

    var drawWorldOriginCube = true; // TODO: Don't forget to turn this off at the end
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

        // Calculate lighting?
        var lighting = true;
        // die Information über die Beleuchtungsrechnung wird an die Shader weitergegeben
        gl.uniform1i(gl.getUniformLocation(program, "lighting"),lighting);

        if (lighting) {
            // Set diffuse reflection color and calculate
            var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0); // Yellow-ish
            calculateLights( materialDiffuse );
        } else {
            // pre-defined colors were already given in the draw-function
        };

        // es muss noch festgelegt werden, wo das Objekt sich in Weltkoordinaten befindet,
        // d.h. die Model-Matrix muss errechnet werden. Dazu werden wieder Hilfsfunktionen
        // für die Matrizenrechnung aus dem externen Javascript MV.js verwendet
    
        // Initialisierung mit der Einheitsmatrix 
        modelWorldOrigin = mat4();
        
        // Das Objekt wird am Ende noch um die x-Achse rotiert
        modelWorldOrigin = mult(modelWorldOrigin, rotate(thetaWorld[0], [1, 0, 0] ));
            
        // Zuvor wird das Objekt um die y-Achse rotiert
        modelWorldOrigin = mult(modelWorldOrigin, rotate(thetaWorld[1], [0, 1, 0] ));
            
        // Als erstes wird das Objekt um die z-Achse rotiert 
        modelWorldOrigin = mult(modelWorldOrigin, rotate(thetaWorld[2], [0, 0, 1] ));
            
        // die Model-Matrix ist fertig berechnet und wird an die Shader übergeben 
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelWorldOrigin));
            
        // jetzt wird noch die Matrix errechnet, welche die Normalen transformiert
        normalMat = mat4();
        normalMat = mult(view, modelWorldOrigin);
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

    if(drawZRotationCube) {
        numVertices = 0;
        pointsArray.length = 0;
        colorsArray.length = 0;
        normalsArray.length = 0;
        
        drawDefaultSizeCube(5, 0, 1);

        // Calculate lighting?
        var lighting = true;
        // die Information über die Beleuchtungsrechnung wird an die Shader weitergegeben
        gl.uniform1i(gl.getUniformLocation(program, "lighting"),lighting);

        if (lighting) {
            // Set diffuse reflection color to green and calculate lights
            var materialDiffuse = vec4(0.0, 1.0, 0.0, 1.0);
            calculateLights(materialDiffuse);
        } else {
            // pre-defined colors were already given in the draw-function
        };

        // Define position and rotation of object within world coordinates w/ functions from MV.js
        // Keep in mind, transformations are calculated "in reverse"
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
        
        // die Model-Matrix ist fertig berechnet und wird an die Shader übergeben 
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelZRotationCube));

        
        // jetzt wird noch die Matrix errechnet, welche die Normalen transformiert
        normalMatZRotationCube = mat4();
        normalMatZRotationCube = mult(view, modelZRotationCube);
        normalMatZRotationCube = inverse(normalMatZRotationCube);
        normalMatZRotationCube = transpose(normalMatZRotationCube);
            
        // die Normal-Matrix ist fertig berechnet und wird an die Shader übergeben 
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "normalMatrix"), false, flatten(normalMatZRotationCube));

        // schließlich wird alles gezeichnet. Dabei wird der Vertex-Shader numVertices mal aufgerufen
        // und dabei die jeweiligen attribute - Variablen für jeden einzelnen Vertex gesetzt
        // außerdem wird OpenGL mitgeteilt, dass immer drei Vertices zu einem Dreieck im Rasterisierungsschritt
        // zusammengesetzt werden sollen
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    if(drawXRotationCube) {
        numVertices = 0;
        pointsArray.length = 0;
        colorsArray.length = 0;
        normalsArray.length = 0;

        drawCube(5, 0, -3, 2);

        // Calculate lighting?
        var lighting = true;
        // die Information über die Beleuchtungsrechnung wird an die Shader weitergegeben
        gl.uniform1i(gl.getUniformLocation(program, "lighting"),lighting);

        if (lighting) {
            // Set diffuse reflection color and calculate
            var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0); // Yellow-ish
            calculateLights( materialDiffuse );
        } else {
            // pre-defined colors were already given in the draw-function
        };


        // Define position and rotation of object within world coordinates w/ functions from MV.js
        // Keep in mind, transformations are calculated "in reverse"
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

        // Draw it
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    if(drawLowerPyramide) {
        numVertices = 0;
        pointsArray.length = 0;
        colorsArray.length = 0;
        normalsArray.length = 0;

        
        drawCube(5, 0, -3, 2);

        // Calculate lighting?
        var lighting = true;
        // die Information über die Beleuchtungsrechnung wird an die Shader weitergegeben
        gl.uniform1i(gl.getUniformLocation(program, "lighting"),lighting);

        if (lighting) {
            // Set diffuse reflection color and calculate
            var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0); // Yellow-ish
            calculateLights( materialDiffuse );
        } else {
            // pre-defined colors were already given in the draw-function
        };


        // Define position and rotation of object within world coordinates w/ functions from MV.js
        // Keep in mind, transformations are calculated "in reverse"
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

        // Draw it
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

}

// Define nameless function to var "render" which will get called every frame
var render = function() {
    // init Framebuffer (where the Frame gets written) and init z-Buffer (for depth)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Animation
    if(rotationEnabled) {
        thetaWorld[axis] += 2.0; // Rotate thetaWorld by 2 degrees on current axis
        //thetaZRotationCube[axis] += 2.0; // Rotate thetaWorld by 2 degrees on current axis
        //thetaXRotationCube[axis] += 2.0; // Rotate thetaWorld by 2 degrees on current axis
    }

    thetaZRotationCube[2] += 0.6; // GL.2a - Rotate ZCube: ~10 seconds per rotation w/ ~60fps -> 360/(10*60)
    thetaXRotationCube[0] += 1.2; // GL.2b - Rotate XCube: ~5 seconds per rotation w/ ~60fps -> 360/(5*60)


    // jetzt kann die Szene gezeichnet werden
    displayScene();
        
    // der Frame fertig gezeichnet ist, wird veranlasst, dass der nächste Frame gezeichnet wird. Dazu wird wieder
    // die die Funktion aufgerufen, welche durch die Variable render spezifiziert wird
    requestAnimFrame(render);

    // Berechne und zeige FPS
    if(counter < fpsCheckInterval) counter++;
    else {
        fps = fpsCheckInterval / ((Date.now() - then) / 1000); // Interval ist die Zeit in Sekunden zw. FPS checks

        // Edit text in fps element
        document.getElementById("fps").textContent = "FPS: " + String(fps).match(".....") + " (alle " + fpsCheckInterval + " Frames berechnet)";

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
    // die Referenz auf die Canvas, d.h. den Teil des Browserfensters, in den WebGL zeichnet, 
    // wird ermittelt (über den Bezeichner in der HTML-Seite)
    canvas = document.getElementById("gl-canvas");
    
    // über die Canvas kann man sich den WebGL-Kontext ermitteln, über den dann die OpenGL-Befehle
    // ausgeführt werden
    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) { alert("WebGL isn't available"); }

    // allgemeine Einstellungen für den Viewport (wo genau das Bild in der Canvas zu sehen ist und
    // wie groß das Bild ist)
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
    
    // die Callbacks für das Anklicken der Buttons wird festgelegt
    // je nachdem, ob man den x-Achsen, y-Achsen oder z-Achsen-Button klickt, hat
    // axis einen anderen Wert
    document.getElementById("ButtonX").onclick = function(){axis = 0;};
    document.getElementById("ButtonY").onclick = function(){axis = 1;};
    document.getElementById("ButtonZ").onclick = function(){axis = 2;};
    document.getElementById("ButtonT").onclick = function(){rotationEnabled = !rotationEnabled;};
   	
	// jetzt kann mit dem Rendern der Szene begonnen werden  
    render();
}
