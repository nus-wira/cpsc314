out vec3 vcsNormal;
out vec3 vcsPosition;


void main() {
	// Qe pass varying variables to fs in view coordinate system
	vcsNormal = normalize(normalMatrix * normal);
	vcsPosition = vec3(modelViewMatrix * vec4(position, 1.0));

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}