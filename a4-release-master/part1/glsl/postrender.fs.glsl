in vec2 v_UV;
in vec4 lightSpaceCoords;

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;

void main() {
    gl_FragColor = texture2D(tDepth, v_UV);
}