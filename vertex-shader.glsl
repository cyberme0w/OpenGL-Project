// Vars get filled for each vertex
attribute vec4 vPosition;   // Objektkoordinate des Vertex
attribute vec3 vNormal;     // Normale des Vertex (in Objektkoordinaten)
attribute vec4 vColor;      // Farbe des Vertex (falls keine Beleuchtungsberechnung)
attribute vec2 vTexCoord;

varying vec4 fColor;        // Vertex-Shader calculates color value and passes to fragment shader
varying vec2 fTexCoord;

// Uniform -> Value gets calculated by CPU and passed to shader
uniform bool lighting;

uniform vec4 lightPosition;

uniform vec4 diffuseProduct, ambientProduct, specularProduct;
uniform float materialShininess;

uniform mat4 modelMatrix;       // Objektkoord -> Weltkoord
uniform mat4 viewMatrix;        // Weltkoord -> Kamerakoord
uniform mat4 projectionMatrix;  // Kamerakoord -> Clippingkoord
uniform mat4 normalMatrix;      // Normale -> Kamerakoord

uniform bool cartoonEnabled, textureEnabled;
uniform float cartoonThreshLow, cartoonThreshHigh;

void main()
{
    if(lighting) {
        vec3 pos = (viewMatrix * modelMatrix * vPosition).xyz; // calc view-coord of point
        vec3 light = (viewMatrix * lightPosition).xyz; // calc view-coord of light
        vec3 L = normalize(light - pos); // Normalized Vector from point to light

        vec3 E = normalize(-pos);
        vec3 H = normalize(L+E);
        
        vec3 N = normalize((normalMatrix * vec4(vNormal, 0.0)).xyz); // Normale am Eckpunkt in Weltkoordinaten berechnen
        
        vec4 ambient = ambientProduct;

        float Kd = max(dot(L, N), 0.0);
        vec4 diffuse = Kd * diffuseProduct;
        
        float Ks = pow(max(dot(N, H), 0.0), materialShininess);
        vec4 specular = Ks * specularProduct;

        if(dot(L, N) < 0.0) {
            specular = vec4(0.0, 0.0, 0.0, 1.0);
        }

        // Combined color for shader
        fColor = diffuse + ambient + specular;

        fTexCoord = vTexCoord;
        gl_Position = projectionMatrix * modelMatrix * vPosition;

    } else {
        // No lighting done in shader -> use value provided by cpu
        fColor = vColor;
    }

    // Translate coordinate into clipping coordinate and pass it to gl_position
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}