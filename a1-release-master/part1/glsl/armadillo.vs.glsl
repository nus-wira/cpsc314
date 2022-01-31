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
    // Model position in world frame
    vec3 wPosition = vec3(modelMatrix * vec4(position, 1.0));
    // Light direction vector
    vec3 dir = orbPosition - wPosition;

    // Normal way
    // Find light vector in model frame
    vec3 mDir = vec3(inverse(modelMatrix) * vec4(dir, 1.0));
    // Compute shading using normal and light vector
    vcolor = dot(normal, mDir) / (length(mDir) * length(normal));

    // Another way?
    // Find normal vector in world frame
    // vec3 wNormal = vec3(modelMatrix * vec4(normal, 0.0));
    // vcolor = dot(wNormal, dir) / (length(dir) * length(wNormal));

    // Q1D:
    // HINT: Compute distance in World coordinate to make the magnitude easier to interpret
    // HINT: GLSL has a build-in distance() function
    orbDistance = distance(wPosition, orbPosition);

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
