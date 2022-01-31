// The value of the "varying" variable is interpolated between values computed in the vertex shader
// The varying variable we passed from the vertex shader is identified by the 'in' classifier
in float vcolor;
in float orbDistance;

// This is defined as a constant radius
float minDistance = 2.0;

void main() {
 	// HINT: For part C, set the color of the armadillo based on the vcolor
	// HINT: For part D, only color it green within the proximity
	// Set the colour from vertex shader
	vec3 col = vec3(vcolor);
	// Set RB values to 0 if within minDistance
	if (orbDistance < minDistance)
		col.xz = vec2(0.0);
	gl_FragColor = vec4(col, 1.0); 
}