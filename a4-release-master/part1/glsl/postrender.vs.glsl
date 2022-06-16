uniform mat4 lightProjMatrix;
uniform mat4 lightViewMatrix;

out vec2 v_UV;
out vec4 lightSpaceCoords;

void main() {
    v_UV = uv;    
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );

}