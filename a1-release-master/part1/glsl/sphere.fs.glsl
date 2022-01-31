in vec3 vNormal;

void main() {

 	// HINT: Q1b, Set final rendered color surface normals
  	gl_FragColor = vec4(vNormal, 1.0);

}
