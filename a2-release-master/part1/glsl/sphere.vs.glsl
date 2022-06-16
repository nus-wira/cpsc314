uniform float time;

out vec3 interpolatedNormal;

float max3(vec3 v) {
    return max(max(v.x, v.y), v.z);
}

vec3 maxBasis3(vec3 v) {
    float m = max3(abs(v));
    if (v.x == m)
        return vec3(1, 0, 0);
    if (v.x == -m)
        return vec3(-1, 0, 0);
    if (v.y == m)
        return vec3(0, 1, 0);
    if (v.y == -m)
        return vec3(0, -1, 0);
    if (v.z == m)
        return vec3(0, 0, 1);
    else
        return vec3(0, 0, -1);
}

void main() {

    interpolatedNormal = normal;    

    // TODO Q4 transform the vertex position to create deformations
    // Make sure to change the size of the orb sinusoidally with time.
    // The deformation must be a function on the vertice's position on the sphere.

    // since -1 <= sin <= 1
    // 0 <= (sin + 1)/2 <= 1
    float range = (sin(time) + 1.0) / 2.0;

    // dot product between position and direction vector of side of cube
    float maxNpos = max3(abs(position));
    // since cos(theta) = 1/(1+x) where x is the target length,
    // x = 1/cos(theta) - 1
    // cos(theta) = dot product / (length(position) * length(direction))
    // lengths are the radius of the unit sphere = 1
    float factor = (1.0 - maxNpos) / maxNpos;
    float scale = 1.0 + factor * range;
    vec3 modifiedPos = scale * position;

    vec3 basis = maxBasis3(position);

    interpolatedNormal = range * basis + (1.0-range) * normal;

    // Multiply each vertex by the model matrix to get the world position of each vertex, 
    // then the view matrix to get the position in the camera coordinate system, 
    // and finally the projection matrix to get final vertex position.
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(modifiedPos, 1.0);
}
