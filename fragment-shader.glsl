// Bitgröße von float definieren
precision mediump float;

// Werte, die vom Vertex-Shader übergeben und in der 
// Rasterisierung für das aktuelle Fragment errechnet wurden
varying vec4 fColor;    // Farbwert für das Fragment
varying vec2 fTexCoord;
float luminosity;
float maxLum, minLum;

uniform sampler2D texHSRM;
uniform bool cartoonEnabled, textureEnabled;
uniform float cartoonThreshLow, cartoonThreshHigh;


void main()
{
    // wie jeder Fragment-Shader muss der Farbwert des
    // Fragments bestimmt und in die vordefinierte Variable
    // gl_FragColor geschrieben werden

    // wir übernehmen hier einfach den übergebenen Wert

    maxLum = (fColor.r > fColor.g) ? ((fColor.r > fColor.b) ? fColor.r : fColor.b) : fColor.g;
    minLum = (fColor.r < fColor.g) ? ((fColor.r < fColor.b) ? fColor.r : fColor.b) : fColor.g;
    luminosity = 0.5 * (maxLum + minLum);

    if(cartoonEnabled) {
        if(luminosity < cartoonThreshLow) {
            gl_FragColor = vec4(0.2, 0.2, 0.2, 1);
        } else if (luminosity > cartoonThreshHigh) {
            gl_FragColor = vec4(0.9, 0.7, 0, 1);
        } else {
            gl_FragColor = vec4(0.6, 0.4, 0.1, 1);
        }
    } else if(textureEnabled) {
        gl_FragColor = fColor * texture2D(texHSRM, fTexCoord);
    } else {
        gl_FragColor = fColor;
    }
}