// The uniform variable is set up in the javascript code and the same for all vertices
uniform vec3 orbPosition;

// This is a "varying" variable and interpolated between vertices and across fragments.
// The shared variable is initialized in the vertex shader and passed to the fragment shader.
out float vcolor;
out float orbDistance;

void main() {

    // Q1C:
    // HINT: GLSL PROVIDES THE DOT() FUNCTION 
  	// HINT: SHADING IS CALCULATED BY TAKING THE DOT PRODUCT OF THE NORMAL AND LIGHT DIRECTION VECTORS
    // vcolor = 0.5; // REPLACE ME
    vec3 wPosition = vec3(modelMatrix * vec4(position, 1.0));
    vec3 wNormal = vec3(modelMatrix * vec4(normal, 0.0));
    vec3 dir = orbPosition - wPosition;
    vcolor = dot(wNormal, dir) / (length(dir) * length(wNormal));

    // Q1D:
    // HINT: Compute distance in World coordinate to make the magnitude easier to interpret
    // HINT: GLSL has a build-in distance() function
    // orbDistance = 1.0;// REPLACE ME
    orbDistance = distance(wPosition, orbPosition);

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
