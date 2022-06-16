in vec3 vcsNormal;
in vec3 vcsPosition;

uniform vec3 lightDirection;

uniform samplerCube skybox;

uniform mat4 matrixWorld;

// Section 15.3 of Textbook
// Reflected vector w about normal n
vec3 reflect(vec3 w, vec3 n) {
  return - w + n * (dot(w, n) * 2.0);
}

void main( void ) {
  // Qd : Calculate the vector that can be used to sample from the cubemap
  vec3 reflected = reflect(normalize(-vcsPosition), vcsNormal);
  vec3 wReflected = vec3(matrixWorld * vec4(reflected, 0.0));
  gl_FragColor = textureCube(skybox, wReflected);
}