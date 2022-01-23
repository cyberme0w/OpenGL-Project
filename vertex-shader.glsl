// Vars get filled for each vertex
attribute vec4 vPosition;   // Objektkoordinate des Vertex
attribute vec3 vNormal;     // Normale des Vertex (in Objektkoordinaten)
attribute vec4 vColor;      // Farbe des Vertex (falls keine Beleuchtungsberechnung)
varying vec4 fColor;        // Vertex-Shader calculates color value and passes to fragment shader

// Uniform -> Value gets calculated by CPU and passed to shader
uniform bool lighting;

uniform vec4 lightPosition;

uniform vec4 diffuseProduct;
uniform vec4 ambientProduct;
uniform vec4 specularProduct;
uniform float materialShininess;


uniform mat4 modelMatrix;       // Objektkoord -> Weltkoord
uniform mat4 viewMatrix;        // Weltkoord -> Kamerakoord
uniform mat4 projectionMatrix;  // Kamerakoord -> Clippingkoord
uniform mat4 normalMatrix;      // Normale -> Kamerakoord


void main()
{
    if(lighting) {
        vec3 pos = (viewMatrix * modelMatrix * vPosition).xyz; // calc view-coord of point
        vec3 light = (viewMatrix * lightPosition).xyz; // calc view-coord of light
        vec3 L = normalize( light - pos ); // Normalized Vector from point to light

        // Normale am Eckpunkt in Weltkoordinaten berechnen
        vec3 N = normalize((normalMatrix * vec4(vNormal, 0.0)).xyz);
        
        // Berechnung der diffusen Beleuchtung nach den Formeln von Phong
        float Kd = max(dot(L, N), 0.0);
        vec4 diffuse = Kd * diffuseProduct;
        
        // Ambient Light (influenced by objects color)
        vec4 ambient = ambientProduct * (0.1 * diffuseProduct);

        // Specular Light
        vec3 E = normalize(-pos);
        vec3 H = normalize(L+E);

        float Ks = pow(max(dot(N, H), 0.0), materialShininess);
        vec4 specular = Ks * specularProduct;

        if(dot(L, N) < 0.0) {
            specular = vec4(0.0, 0.0, 0.0, 1.0);
        }

        // Combined color for shader
        fColor = diffuse + ambientProduct + specular;
    } else {
        // No lighting done in shader -> use value provided by cpu
        fColor = vColor;
    }

    // Translate coordinate into clipping coordinate and pass it to gl_position
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}