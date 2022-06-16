in vec3 vcsNormal;
in vec3 vcsPosition;
in vec2 texCoord;
in vec4 lightSpaceCoords;

uniform vec3 lightColor;
uniform vec3 ambientColor;

uniform float kAmbient;
uniform float kDiffuse;
uniform float kSpecular;
uniform float shininess;

uniform vec3 cameraPos;
uniform vec3 lightPosition;
uniform vec3 lightDirection;

// Textures are passed in as uniforms
uniform sampler2D colorMap;
uniform sampler2D normalMap;

// Added ShadowMap
uniform sampler2D shadowMap;
uniform float textureSize;

// FOR PCF: Returns a value in [0, 1] range, 1 indicating all sample points are occluded
float calculateShadow() {

	// HINT: define a "stepAmount", so texels you sample from the texture are some "stepAmount" number of texels apart 
	float stepAmount = 1.0 / textureSize;

	// HINT: the number of texels you sample from the texture
	float sampleSize = 7.0;
	float halfSample = (sampleSize - 1.0) / 2.0;

	// HINT: the number of samples determind to be in shadow
	float count = 0.0;

	// Convert to uv, [0,1]
	vec3 lightSpaceUv = 0.5 * lightSpaceCoords.xyz + vec3(0.5);

	for (float i = -halfSample; i <= halfSample; i += 1.0) {
		for (float j = -halfSample; j <= halfSample; j += 1.0) {
			count += float(texture2D(shadowMap, lightSpaceUv.xy + vec2(i,j) * stepAmount).x < lightSpaceUv.z);
		}
	}
	 
	return count / (sampleSize * sampleSize);
}

void main() {
	//Q1a compleme the implementation of the Blinn-Phong reflection model
	//PRE-CALCS
	vec3 N = normalize(vcsNormal);
	vec3 Nt = normalize(texture(normalMap, texCoord).xyz * 2.0 - 1.0);
	vec3 L = normalize(vec3(viewMatrix * vec4(lightDirection, 0.0)));

	//AMBIENT
	vec3 light_AMB = ambientColor * kAmbient;

	//DIFFUSE
	vec3 diffuse = kDiffuse * lightColor;
	vec3 light_DFF = diffuse * max(0.0, dot(N, L));

	//SPECULAR
	
	//SHADOW
	//Q1e do the shadow mapping
	//Q1f PCF HINTS: see calculate shadow helper function
	// Convert to uv, [0,1]
	vec3 lightSpaceUv = 0.5 * lightSpaceCoords.xyz + vec3(0.5);
	float shadow = calculateShadow();

	//Qa add diffuse and specular components
	//Q1e incorporate shadow value into the calculation
	light_DFF *= texture(colorMap, texCoord).xyz * (1.0 - shadow);
	
	vec3 TOTAL = light_AMB + light_DFF;

	gl_FragColor = vec4(TOTAL, 1.0);
}