// The value of the "varying" variable is interpolated between values computed in the vertex shader
// The varying variable we passed from the vertex shader is identified by the 'in' classifier
in float vcolor;
in float orbDistance;

// This is defined as a constant radius
float minDistance = 2.0;

void main() {
 	// HINT: For part C, set the color of the armadillo based on the vcolor
	// HINT: For part D, only color it green within the proximity
	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); 
}