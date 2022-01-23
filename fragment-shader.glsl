// Bitgröße von float definieren
precision mediump float;

// Werte, die vom Vertex-Shader übergeben und in der 
// Rasterisierung für das aktuelle Fragment errechnet wurden

// Farbwert für das Fragment
varying vec4 fColor;

void main()
{
    // wie jeder Fragment-Shader muss der Farbwert des
    // Fragments bestimmt und in die vordefinierte Variable
    // gl_FragColor geschrieben werden

    // wir übernehmen hier einfach den übergebenen Wert	  
    gl_FragColor = fColor;
}