uniform float time;

out vec3 interpolatedNormal;

float max3(vec3 v) {
    return max(max(v.x, v.y), v.z);
}

vec3 maxBasis3(vec3 v) {
    float m = max3(v);
    if (v.x == m)
        return vec3(1, 0, 0);
    if (v.y == m)
        return vec3(0, 1, 0);
    else
        return vec3(0, 0, 1);
}

void main() {

    interpolatedNormal = normal;    

    // TODO Q4 transform the vertex position to create deformations
    // Make sure to change the size of the orb sinusoidally with time.
    // The deformation must be a function on the vertice's position on the sphere.
    float maxNpos = max3(abs(position));
    float factor = (1.0 - maxNpos) / maxNpos;
    vec3 modifiedPos = position + factor * position * (sin(time) + 1.0) / 2.0;


    // Multiply each vertex by the model matrix to get the world position of each vertex, 
    // then the view matrix to get the position in the camera coordinate system, 
    // and finally the projection matrix to get final vertex position.
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(modifiedPos, 1.0);
}
