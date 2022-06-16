/*
* UBC CPSC 314, Vnov 2021
* Assignment 4 Template
*/

// Setup the renderer and create the scene
// You should look into js/setup.js to see what exactly is done here.
const { renderer, canvas } = setup();
// HINT: extra render targets provided for bonus features.
const { scene, renderTarget, camera, shadowCam, worldFrame, renderTarget2, renderTarget3 } = createScene(canvas);

// Set up the shadow scene.
const shadowScene = new THREE.Scene();

// Switch between seeing the default scene  (1), the depth map (2), the final shadowed scene (3)
var sceneHandler = 1;

// For ShadowMap visual
const postCam = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
const postScene = new THREE.Scene();


// Image Based Lighting Scene Setup
const IBLCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000.0);
const IBLScene = new THREE.Scene();
IBLCamera.position.set(0.0, 1.5, 4.0);
IBLCamera.lookAt(IBLScene.position);
IBLScene.background = new THREE.Color(0x000000);

const IBLParams = {
  exposure: 1.0,
  hdrToneMapping: 'ACESFilmic'
};

const hdrToneMappingOptions = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping
};

THREE.DefaultLoadingManager.onLoad = function(){
  pmremGenerator.dispose();
};

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

function loadTextureForGLTF(path, useForColorData = false)
{
  let texture = new THREE.TextureLoader().load(path);
  // required texture properties:
  if (useForColorData) { texture.encoding = THREE.sRGBEncoding; } // If texture is used for color information, set colorspace to sRGB.
  texture.flipY = false; // GLTF UVs use the convention that (0, 0) corresponds to the upper left corner of a texture.
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // optional texture properties:
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

// Q1 TODO
// Q1 HINT: Keep in mind that only the albedo and emissive maps are used for color data.
const helmetAlbedoMap = loadTextureForGLTF('./gltf/DamagedHelmet/Default_albedo.jpg', true);
const helmetNormalMap = loadTextureForGLTF('./gltf/DamagedHelmet/Default_normal.jpg', false);
const helmetEmissiveMap = loadTextureForGLTF('./gltf/DamagedHelmet/Default_emissive.jpg', true);
const helmetAmbientOcclusionMap = loadTextureForGLTF('./gltf/DamagedHelmet/Default_AO.jpg', false);
const helmetMetallicAndRoughnessMap = loadTextureForGLTF('./gltf/DamagedHelmet/Default_metalRoughness.jpg', false);

const helmetMaterial = new THREE.MeshStandardMaterial({
  emissive: new THREE.Color(1,1,1),
  metalness: 1.0,
  envMapIntensity: 1.0,

  map: helmetAlbedoMap,
  // Q1 TODO: You must set the map, normalMap, emissiveMap, roughnessMap, metalnessMap, and aoMap properties of helmetMaterial
  normalMap: helmetNormalMap,
  emissiveMap: helmetEmissiveMap,
  roughnessMap: helmetMetallicAndRoughnessMap,
  metalnessMap: helmetMetallicAndRoughnessMap,
  aoMap: helmetAmbientOcclusionMap
});

new THREE.EXRLoader()
  .load(
    './images/rathaus_2k.exr',
    function(texture){
      let hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

      IBLScene.background = hdrCubeRenderTarget.texture; // hdrCubeRenderTarget.texture is a cubemap texture.

      // Q1 TODO: You must set the envMap property of helmetMaterial. the envMap must be a cubemap texture
      helmetMaterial.envMap = hdrCubeRenderTarget.texture;

      helmetMaterial.needsUpdate = true;

      texture.dispose();
    });

const damagedHelmetFilePath = './gltf/DamagedHelmet/DamagedHelmet.gltf';
let damagedHelmetObject;
{
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(damagedHelmetFilePath, (gltf) => {
    damagedHelmetObject = gltf.scene;
    damagedHelmetObject.traverse( function (child) {
      if (child.isMesh) 
      {
        child.material = helmetMaterial;
      }
    });
    IBLScene.add( damagedHelmetObject );
  });
}

const IBLControls = new THREE.OrbitControls(IBLCamera, canvas);
IBLControls.minDistance = 1;
IBLControls.maxDistance = 300;

const IBLGUI = new dat.GUI();
IBLGUI.add( IBLParams, 'hdrToneMapping', Object.keys(hdrToneMappingOptions));
IBLGUI.add( IBLParams, 'exposure', 0, 2, 0.01 );
IBLGUI.open();
IBLGUI.hide();

/////////////////////////////////
//   YOUR WORK STARTS BELOW    //
/////////////////////////////////

shadowCam.position.set(200.0, 200.0, 200.0);
shadowCam.lookAt(scene.position);
shadowScene.add(shadowCam);

const lightDirection = new THREE.Vector3();
lightDirection.copy(shadowCam.position);
lightDirection.sub(scene.position);

// Load floor textures
const floorColorTexture = new THREE.TextureLoader().load('images/color.jpg');
floorColorTexture.minFilter = THREE.LinearFilter;
floorColorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

const floorNormalTexture = new THREE.TextureLoader().load('images/normal.png');
floorNormalTexture.minFilter = THREE.LinearFilter;
floorNormalTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

const defaultTexture = new THREE.MeshBasicMaterial({color: 0xffffff});

// Load pixel textures
const shayDColorTexture = new THREE.TextureLoader().load( 'images/Pixel_Model_BaseColor.jpg' );
shayDColorTexture.minFilter = THREE.LinearFilter;
shayDColorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

const shayDNormalTexture = new THREE.TextureLoader().load('images/Pixel_Model_Normal.jpg');
shayDNormalTexture.minFilter = THREE.LinearFilter;
shayDNormalTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Uniforms
const cameraPositionUniform = {type: "v3", value: camera.position}; 
const lightColorUniform = {type: "c", value: new THREE.Vector3(1.0, 1.0, 1.0)};
const ambientColorUniform = {type: "c", value: new THREE.Vector3(1.0, 1.0, 1.0)};
const lightDirectionUniform = {type: "v3", value: lightDirection};
const kAmbientUniform = {type: "f", value: 0.1};
const kDiffuseUniform = {type: "f", value: 0.8};
const kSpecularUniform = {type: "f", value: 0.4};
const shininessUniform = {type: "f", value: 50.0};
const lightPositionUniform = { type: "v3", value: shadowCam.position};
const shayDTextureUniform = {type: 't', value: shayDColorTexture}; //Qa HINT set texture uniform
const shayDNormalUniform = {type: 't', value: shayDNormalTexture}; //Qa HINT set texture uniform

// load the skybox textures
const skyboxCubemap = new THREE.CubeTextureLoader() //Q3 Answer, adding texture images to cubemap
.setPath( 'images/cubemap/' );
const skyboxTexture = skyboxCubemap.load( [
  // Qb) : Load the images for the sides of the cubemap here. Note that order is important
  'cube1.png', 'cube4.png', 'cube2.png', 'cube5.png', 'cube3.png', 'cube6.png'
] );
skyboxCubemap.format = THREE.RGBFormat;
const skyboxCubeMapUniform = {type: 't', value: skyboxTexture}; //Q3 Answer making uniform for skybox to pass into shaders

// HINT: update for Qb to the skyboxTexture
// scene.background = new THREE.Color( 0x89cff0 );
scene.background = skyboxTexture;


// Materials

// Q1d HINT: Setup the uniforms needed for shadowing
const postMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightProjMatrix: {type: "m4", value: shadowCam.projectionMatrix},
    lightViewMatrix: {type: "m4", value: shadowCam.matrixWorldInverse},
    tDiffuse: {type: "t", value: null},
    tDepth: { type: "t", value: null }
  }
});

// Q1d HINT: Setup the uniforms needed for shadowing
const floorMaterial = new THREE.ShaderMaterial({ 
  uniforms: {
    lightProjMatrix: {type: "m4", value: shadowCam.projectionMatrix},
    lightViewMatrix: {type: "m4", value: shadowCam.matrixWorldInverse},
    lightColor: lightColorUniform,
    ambientColor: ambientColorUniform,
    
    kAmbient: kAmbientUniform,
    kDiffuse: kDiffuseUniform,
    kSpecular: kSpecularUniform,
    shininess: shininessUniform,
    
    cameraPos: cameraPositionUniform,
    lightPosition: lightPositionUniform,
    lightDirection: lightDirectionUniform,
    
    colorMap: {type: "t", value: floorColorTexture},
    normalMap: { type: "t", value: floorNormalTexture },
    shadowMap: {type: "t", value: floorNormalTexture},
    textureSize: {type: "float", value: null},
  }
});

// Qa HINT : Pass the uniforms for blinn-phong shading,
// colorMap, normalMap  to the shaderMaterial
const shayDMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms: {
    lightColor: lightColorUniform,
    ambientColor: ambientColorUniform,
    
    kAmbient: kAmbientUniform,
    kDiffuse: kDiffuseUniform,
    kSpecular: kSpecularUniform,
    shininess: shininessUniform,
    
    cameraPos: cameraPositionUniform,
    lightPosition: lightPositionUniform,
    lightDirection: lightDirectionUniform,

    colorMap: shayDTextureUniform,
    normalMap: shayDNormalUniform
  }
});

// Needed for Shay depth info.
const shadowMaterial = new THREE.ShaderMaterial({});


const matWorldUniform = {type: 'm4', value: camera.matrixWorld};

// Qc HINT : Pass the necessary uniforms
const envmapMaterial = new THREE.ShaderMaterial({
  uniforms: {
    skybox: skyboxCubeMapUniform,
    lightDirection: lightDirectionUniform,
    matrixWorld: matWorldUniform
  }
});

// Load shaders
const shaderFiles = [
  'glsl/envmap.vs.glsl',
  'glsl/envmap.fs.glsl',
  'glsl/shay.vs.glsl',
  'glsl/shay.fs.glsl',
  'glsl/shadow.vs.glsl',
  'glsl/shadow.fs.glsl',
  'glsl/floor.vs.glsl',
  'glsl/floor.fs.glsl',
  'glsl/postrender.vs.glsl',
  'glsl/postrender.fs.glsl',
];

new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  shayDMaterial.vertexShader = shaders['glsl/shay.vs.glsl'];
  shayDMaterial.fragmentShader = shaders['glsl/shay.fs.glsl'];
  
  envmapMaterial.vertexShader = shaders['glsl/envmap.vs.glsl'];
  envmapMaterial.fragmentShader = shaders['glsl/envmap.fs.glsl'];

  shadowMaterial.vertexShader = shaders['glsl/shadow.vs.glsl'];
  shadowMaterial.fragmentShader = shaders['glsl/shadow.fs.glsl'];

  floorMaterial.vertexShader = shaders['glsl/floor.vs.glsl'];
  floorMaterial.fragmentShader = shaders['glsl/floor.fs.glsl'];

  postMaterial.vertexShader = shaders['glsl/postrender.vs.glsl'];
  postMaterial.fragmentShader = shaders['glsl/postrender.fs.glsl'];
});

// Loaders for object geometry
// Load the pixel gltf
const gltfFileName = 'gltf/pixel_v4.glb';
let object;
{
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(gltfFileName, (gltf) => {
    object = gltf.scene;
    object.traverse( function ( child ) {
      
      if (child instanceof THREE.Mesh) 
      {
        child.material = shayDMaterial;
      }
      
    } );
    object.scale.set(10.0, 10.0, 10.0);
    object.position.set(0.0, 0.0, -8.0);
    scene.add( object );
  });
}

let sobject;
{
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(gltfFileName, (gltf) => {
    sobject = gltf.scene;
    sobject.traverse( function ( child ) {
      
      if (child instanceof THREE.Mesh) 
      {
        child.material = shadowMaterial;
      }
      
    } );
    sobject.scale.set(10.0, 10.0, 10.0);
    sobject.position.set(0.0, 0.0, -8.0);
    shadowScene.add( sobject );
  });
}

// Q1d HINT add it shadow scene too, with the shadowMaterial

const terrainGeometry = new THREE.BoxGeometry(50, 50, 5);
const terrain = new THREE.Mesh(terrainGeometry, floorMaterial);
terrain.position.y = -2.4;
terrain.rotation.set(- Math.PI / 2, 0, 0);
scene.add(terrain);

// const sterrain = new THREE.Mesh(terrainGeometry, shadowMaterial);
// sterrain.position.y = -2.4;
// sterrain.rotation.set(- Math.PI / 2, 0, 0);
// shadowScene.add(sterrain);

// Look at the definition of loadOBJ to familiarize yourself with
// how each parameter affects the loaded object.
loadAndPlaceOBJ('gltf/armadillo.obj', envmapMaterial, function (armadillo) {
  armadillo.position.set(0.0, 4.0, 6.0);
  armadillo.scale.set(0.075, 0.075, 0.075);
  armadillo.parent = worldFrame;
  scene.add(armadillo);
});

loadAndPlaceOBJ('gltf/armadillo.obj', shadowMaterial, function (armadillo) {
  armadillo.position.set(0.0, 4.0, 6.0);
  armadillo.scale.set(0.075, 0.075, 0.075);
  armadillo.parent = worldFrame;
  shadowScene.add(armadillo);
});

// const sphereGeometry = new THREE.SphereGeometry(1.0, 512.0, 512.0);
// const sphere = new THREE.Mesh(sphereGeometry, envmapMaterial);
// sphere.position.set(0.0, 4.0, 6.0);
// scene.add(sphere);

// Q1d HINT add it shadow scene too, with the shadowMaterial

// Depth Test scene
const postPlane = new THREE.PlaneGeometry( 2, 2 );
const postQuad = new THREE.Mesh( postPlane, postMaterial );
postScene.add( postQuad );


// Listen to keyboard events.
const keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed("A"))
  shadowCam.position.x -= 0.5;
  if (keyboard.pressed("D"))
  shadowCam.position.x += 0.5;
  if (keyboard.pressed("W"))
  shadowCam.position.z -= 0.5;
  if (keyboard.pressed("S"))
  shadowCam.position.z += 0.5;
  if (keyboard.pressed("Q"))
  shadowCam.position.y += 0.5;
  if (keyboard.pressed("E"))
  shadowCam.position.y -= 0.5;

  if (keyboard.pressed("1"))
  {
    IBLGUI.hide();
    sceneHandler = 1;
  }
  if (keyboard.pressed("2"))
  {
    IBLGUI.hide();
    sceneHandler = 2;
  }
  if (keyboard.pressed("3"))
  {
    IBLGUI.hide();
    sceneHandler = 3;
  }
  if (keyboard.pressed("4"))
  {
    IBLGUI.show();
    sceneHandler = 4;
  }
  
  shadowCam.lookAt(scene.position);
  lightDirection.copy(shadowCam.position);
  lightDirection.sub(scene.position);
}



function updateMaterials() {
  envmapMaterial.needsUpdate = true;
  shayDMaterial.needsUpdate = true;
  shadowMaterial.needsUpdate = true;
  floorMaterial.needsUpdate = true;
  postMaterial.needsUpdate = true;
}

// Setup update callback
function update() {
  checkKeyboard();
  updateMaterials();

  cameraPositionUniform.value = camera.position;
  
  requestAnimationFrame(update);
  renderer.getSize(screenSize);
  renderer.setRenderTarget( null );
  renderer.clear();
  
  if (sceneHandler == 1) 
  {
    renderer.render(scene, camera);
  }
  else if (sceneHandler == 2) 
  {
    // Q1d use the postScene to visualise the shadow map
    // HINT: use the render target for the first pass, update the appropriate uniforms in the second pass
    renderer.setRenderTarget(renderTarget);
    renderer.render(shadowScene, shadowCam);
    postMaterial.uniforms.tDiffuse.value = renderTarget.texture;
    postMaterial.uniforms.tDepth.value = renderTarget.depthTexture;
    floorMaterial.uniforms.shadowMap.value = renderTarget.depthTexture;
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
  }
  else if (sceneHandler == 3) 
  {
    // Q1e Do the multipass shadowing here
    renderer.render(scene, camera);

    // HINT: for PCF pass in the sizeof texture you're sampling from to the floor fragment shader
    floorMaterial.uniforms.textureSize.value = screenSize.x;
  }
  else // if sceneHandler is 4
  {
    // https://threejs.org/docs/#api/en/renderers/WebGLRenderer.physicallyCorrectLights
    renderer.physicallyCorrectLights = true;
    // https://threejs.org/docs/#api/en/renderers/WebGLRenderer.toneMapping
    renderer.toneMapping = hdrToneMappingOptions[ IBLParams.hdrToneMapping ];
    https://threejs.org/docs/#api/en/textures/Texture.encoding
    renderer.outputEncoding = THREE.sRGBEncoding;
    var prevToneMappingExposure = renderer.toneMappingExposure;
    renderer.toneMappingExposure = IBLParams.exposure;

    renderer.setRenderTarget(null);
    renderer.render(IBLScene, IBLCamera);

    // restore non-IBL renderer properties
    renderer.physicallyCorrectLights = false;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputEncoding = THREE.LinearEncoding;
    renderer.toneMappingExposure = prevToneMappingExposure;
  }
   
}

// Q1e HINT: use for PCF sampling 
var screenSize = new THREE.Vector2();
renderer.getSize(screenSize);

// Start the animation loop.
update();
