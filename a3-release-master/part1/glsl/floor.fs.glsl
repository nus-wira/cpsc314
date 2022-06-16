// Textures are passed in as uniforms
uniform sampler2D colorMap;

in vec2 texCoord;

void main() {

    gl_FragColor = texture2D(colorMap, texCoord);
}