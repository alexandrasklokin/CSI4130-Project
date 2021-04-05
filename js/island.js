/*
Alexandra Sklokin 
300010511
Sneha George
300006801

NOTE: Needs to be run on a server using the command:
    http-server . -p 8080

*/

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let container;
let scene, renderer; 
let tpMesh, tp1Mesh, tp2Mesh, tp3Mesh, lineMesh; //horseMesh
let radius, R, spirographArray;
let cameraRig, camera, camera1, camera2, axes;
let controls, parameters;
let terrain, perlin, smoothing, peak;
let sound, listener;
let mirrorSphere, mirrorSphereCamera; // for mirror material
const frustumSize = 200;


init();
animate();

function init() {

// _____________________________________________________________________ SCENE _________________________________________________________________________
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  axes = new THREE.AxesHelper(40);
  scene.add(axes);

// _____________________________________________________________________ CAMERAS _________________________________________________________________________

  camera = new THREE.OrthographicCamera(
    frustumSize / -2,
    frustumSize / 2,
    frustumSize / 2,
    frustumSize / -2,
    1,
    10000
  ); //new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 10000 );
  camera.position.z = 200;

  camera1 = new THREE.PerspectiveCamera(50, 0.5 * aspect, 1, 100000);

  //
  camera2 = new THREE.PerspectiveCamera(130, 0.5 * aspect, 1, 100000);

  cameraRig = new THREE.Group();

  camera1.position.y = 300;
  // camera2.position.z = 75;

  cameraRig.add(camera1);
  cameraRig.add(camera2);

  scene.add(cameraRig);

// _____________________________________________________________________ SPRIROGRAPH LINE _________________________________________________________________________

  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let i = 0; i < 20000; i++) {
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  // const particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
  // scene.add( particles );

// _____________________________________________________________________ SCENE BACKGROUND _________________________________________________________________________

  scene.background = new THREE.CubeTextureLoader()
    .setPath("skyboxes/NissiBeach/")
    .load([
      "posx.jpg",
      "negx.jpg",
      "posy.jpg",
      "negy.jpg",
      "posz.jpg",
      "negz.jpg",
    ]);

// _____________________________________________________________________ REFRACTION CUPS, MIRROR TEAPOT, AND LIGHT _________________________________________________________________________

  const refractionCube = scene.background;
  refractionCube.mapping = THREE.CubeRefractionMapping;

  //LIGHTING

  //lights
  const ambient = new THREE.AmbientLight(0xffffff);
  scene.add(ambient);

  let pointLight;
  pointLight = new THREE.PointLight(0xffffff, 2);
  scene.add(pointLight);

  // TEAPOT
  var tpGeometry = new THREE.TeapotGeometry(
    15,
    3,
    true,
    true,
    true,
    false,
    false
  );

  // Create cube render target
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });
  mirrorSphereCamera = new THREE.CubeCamera(1, 100000, cubeRenderTarget);
  var mirrorSphereMaterial = new THREE.MeshBasicMaterial({
    envMap: cubeRenderTarget.texture,
  });
  mirrorSphere = new THREE.Mesh(tpGeometry, mirrorSphereMaterial);
  mirrorSphere.position.y = 5;
  mirrorSphere.position.z = 0;

  scene.add(mirrorSphereCamera);
  scene.add(mirrorSphere);
  // LINE 307 RESPONSIBLE FOR CREATING INITIAL MIRROR, USING refreshMirror()

  //var basicColor = new THREE.MeshBasicMaterial({ color: 0xa8329c, });
  /* var tpMaterial = new THREE.MeshLambertMaterial({
        color: 0xff6600,
        envMap: scene.background,
        combine: THREE.MixOperation,
        reflectivity: 0.3,
    }); */
  /*tp1Mesh = new THREE.Mesh(tpGeometry, basicColor);
    tp1Mesh.position.y = 5;
    tp1Mesh.position.z = 35;
    scene.add(tp1Mesh);*/

      // Reflection Refractive Materials
  var refractionMaterial = new THREE.MeshLambertMaterial({
    color: 0x4f6482, // ffee00,
    envMap: refractionCube,
    refractionRatio: 0.8,
  });
  var refraction2Material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    envMap: scene.background,
    refractionRatio: 0.9,
  });

  // GLASS
  var glassGeometry = new THREE.CylinderGeometry(8, 5, 30, 40, 40); // true);
  glassMesh = new THREE.Mesh(glassGeometry, refraction2Material);
  glassMesh.position.set(-40, -2, 0);
  scene.add(glassMesh);

  // METAL CAN
  // var canGeometry = new THREE.CylinderGeometry(8, 8, 30, 40, 40); //true);
  canMesh = new THREE.Mesh(glassGeometry, refractionMaterial);
  // canMesh.rotation.z = -Math.pi/4;
  canMesh.position.set(40, -1, 0);
  scene.add(canMesh);

    /*loader.load("Horse.glb", function(gltf) {
        console.log(gltf);
        gltf.scenes[0].children[0].scale.x = 0.15;
        gltf.scenes[0].children[0].scale.y = 0.15;
        gltf.scenes[0].children[0].scale.z = 0.15;
        gltf.scenes[0].children[0].material = new THREE.MeshBasicMaterial({ color: 0x4f230d, });*/
  /* gltf.scenes[0].children[0].material = new THREE.MeshLambertMaterial({
            color: 0xff6600,
            envMap: scene.background,
            combine: THREE.MixOperation,
            reflectivity: 0.3,
        }); */
  /*horseMesh = Object.create(gltf.scenes[0].children[0]);
        console.log(horseMesh);
    }); 
    */

// _____________________________________________________________________ ISLAND TERRAIN _________________________________________________________________________
  var islandGeometry = new THREE.SphereBufferGeometry(
    150,
    40,
    40,
    0,
    2 * Math.PI,
    0,
    0.15 * Math.PI
  );
  var sandMaterial = new THREE.MeshBasicMaterial({ color: 0xcfcea3 });
  islandMesh = new THREE.Mesh(islandGeometry, sandMaterial);
  islandMesh.position.y = -150;
  // scene.add(islandMesh);

  islandGeometry = new THREE.PlaneBufferGeometry(150, 150, 256, 256);
  islandMaterial = new THREE.MeshLambertMaterial({ color: 0xcfcea3 });
  terrain = new THREE.Mesh(islandGeometry, islandMaterial);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y += -10;
  scene.add(terrain);

  peak = 10;
  smoothing = 40;
  refreshVertices();

// _____________________________________________________________________ BIRDS _________________________________________________________________________

  const loader = new THREE.GLTFLoader();


  loader.load("meshes/Stork.glb", function (gltf) {
    //console.log(gltf);
    gltf.scenes[0].children[0].scale.x = 0.15;
    gltf.scenes[0].children[0].scale.y = 0.15;
    gltf.scenes[0].children[0].scale.z = 0.15;
    gltf.scenes[0].children[0].material = new THREE.MeshBasicMaterial({
      color: 0x32a852,
    });
    tpMesh = Object.create(gltf.scenes[0].children[0]);
    // console.log(tpMesh);
  });

  loader.load("meshes/Parrot.glb", function (gltf) {
    //console.log(gltf);
    gltf.scenes[0].children[0].scale.x = 0.15;
    gltf.scenes[0].children[0].scale.y = 0.15;
    gltf.scenes[0].children[0].scale.z = 0.15;
    gltf.scenes[0].children[0].material = new THREE.MeshBasicMaterial({
      color: 0xa86032,
    });
    tp2Mesh = Object.create(gltf.scenes[0].children[0]);
    // console.log(tp2Mesh);
  });

  loader.load("meshes/Flamingo.glb", function (gltf) {
    //console.log(gltf);
    gltf.scenes[0].children[0].scale.x = 0.15;
    gltf.scenes[0].children[0].scale.y = 0.15;
    gltf.scenes[0].children[0].scale.z = 0.15;
    gltf.scenes[0].children[0].material = new THREE.MeshBasicMaterial({
      color: 0xa8329c,
    });
    tp3Mesh = Object.create(gltf.scenes[0].children[0]);
    // console.log(tp3Mesh);
  });

// _____________________________________________________________________ SOUND _________________________________________________________________________

  listener = new THREE.AudioListener();
  camera.add( listener );
  sound = new THREE.Audio( listener );
  var audioLoader = new THREE.AudioLoader();
    audioLoader.load("music/theelevatorbossanova.mp3", function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop(true);
        sound.setVolume(0.5);
    });

// _____________________________________________________________________ DAT GUI _________________________________________________________________________

parameters = {
  a: true,
  b: false,
  c: false,
  d: false,
  e: false,
  f: false
}

  controls = new (function () {
    this.l = 0.9;
    this.k = 0.3;
    this.length = 180 * 6;
    this.R = 70;
    this.visibility = 1;
    this.latitude = 20;
    this.longitude = 45;
    this.zoom = 4.5;
    this.axis_visibility = 1;
    this.peak = 10;
    this.smoothing = 40;
    this.music = 0;
    this.redraw = function () {
      render();
    };
    this.reTerrain = function () {
      peak = controls.peak;
      smoothing = controls.smoothing;
      refreshMirror();
      refreshVertices();
      render();
    };
    this.playMusic = function() {
        play();
    }
  })();

  const datGui = new dat.GUI({ autoPlace: true });
  datGui.domElement.id = "gui";

  var sfolder = datGui.addFolder(`Spirograph`);
  sfolder.add(controls, "length", 180, 34900).onChange(controls.redraw);
  sfolder.add(controls, "R", 20, 150).onChange(controls.redraw);
  sfolder.add(controls, "l", 0, 1).onChange(controls.redraw);
  sfolder.add(controls, "k", 0, 0.99).onChange(controls.redraw);
  sfolder.add(controls, "visibility", 0, 1).onChange(controls.redraw);

  var cfolder = datGui.addFolder(`Camera`);
  cfolder.add(controls, "latitude", 0, 89.9).onChange(controls.redraw); // 180).onChange(controls.redraw);
  cfolder.add(controls, "longitude", -180, 180).onChange(controls.redraw);
  cfolder.add(controls, "zoom", 1.0, 7.0).onChange(controls.redraw);
  cfolder.add(controls, "axis_visibility", 0, 1).onChange(controls.redraw);

  var ptfolder = datGui.addFolder(`Perlin Terrain`);
  ptfolder.add(controls, "peak", 0, 60).onChange(controls.reTerrain);
  ptfolder.add(controls, "smoothing", 0.1, 100).onChange(controls.reTerrain);

  var mfolder = datGui.addFolder(`Audio`);
  mfolder.add(controls, "music", 0, 1).onChange(controls.playMusic);

  var bfolder = datGui.addFolder(`Skybox`);
  bfolder.add(parameters, 'a').name('Nissi Beach').listen().onChange(function(){setChecked('a'); newBackground('a')});
  bfolder.add(parameters, 'b').name('Nissi Beach 2').listen().onChange(function(){setChecked('b'); newBackground('b')});
  bfolder.add(parameters, 'c').name('Larnaca Beach').listen().onChange(function(){setChecked('c'); newBackground('c')});
   bfolder.add(parameters, 'd').name('Bridge').listen().onChange(function(){setChecked('d'); newBackground('d')});
    bfolder.add(parameters, 'e').name('San Francisco').listen().onChange(function(){setChecked('e'); newBackground('e')});

  // _____________________________________________________________________ RENDERER _________________________________________________________________________

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container.appendChild(renderer.domElement);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.autoClear = false;

  window.addEventListener("resize", onWindowResize);
}

function render() {
  
  refreshMirror(Date.now());

  // scene.rotation.z += 0.01;

// _____________________________________________________________________ SPIROGRAPH AND BIRDS _________________________________________________________________________

  var t = (Math.PI / 180) * Date.now() * 0.03;
  var t2 = (Math.PI / 180) * Date.now() * 0.05;
  var t3 = (Math.PI / 180) * Date.now() * 0.04;
  // console.log(Date.now());
  var k_temp = controls.k;
  var l_temp = controls.l;
  R = controls.R;
  var length_temp = controls.length;

  scene.remove(tpMesh);
  scene.remove(tp2Mesh);
  scene.remove(tp3Mesh);

  tpMesh.position.x =
    R *
    ((1 - k_temp) * Math.cos(t) +
      l_temp * k_temp * Math.cos((t * (1 - k_temp)) / k_temp));
  tpMesh.position.y = 70; // R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
  tpMesh.position.z =
    R *
    ((1 - k_temp) * Math.sin(t) -
      l_temp * k_temp * Math.sin((t * (1 - k_temp)) / k_temp)); // R*(l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );

  tp2Mesh.position.x =
    R *
    ((1 - k_temp) * Math.cos(t2) +
      l_temp * k_temp * Math.cos((t2 * (1 - k_temp)) / k_temp));
  tp2Mesh.position.y = 80; // R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
  tp2Mesh.position.z =
    R *
    ((1 - k_temp) * Math.sin(t2) -
      l_temp * k_temp * Math.sin((t2 * (1 - k_temp)) / k_temp)); // R*(l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );

  tp3Mesh.position.x =
    R *
    ((1 - k_temp) * Math.cos(t3) +
      l_temp * k_temp * Math.cos((t3 * (1 - k_temp)) / k_temp));
  tp3Mesh.position.y = 60; // R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
  tp3Mesh.position.z =
    R *
    ((1 - k_temp) * Math.sin(t3) -
      l_temp * k_temp * Math.sin((t3 * (1 - k_temp)) / k_temp)); // R*(l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );

  scene.add(tpMesh);
  scene.add(tp2Mesh);
  scene.add(tp3Mesh);
  //scene.add(horseMesh);

  if (controls.visibility <= 0.5) {
    scene.remove(lineMesh);
  } else {
    scene.remove(lineMesh);

    spirographArray = [];

    for (var theta = 0; theta <= length_temp; theta += 1) {
      t = (Math.PI / 180) * theta;

      var tx =
        R *
        ((1 - k_temp) * Math.cos(t) +
          l_temp * k_temp * Math.cos((t * (1 - k_temp)) / k_temp));
      var ty = 40; // R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
      var tz =
        R *
        ((1 - k_temp) * Math.sin(t) -
          l_temp * k_temp * Math.sin((t * (1 - k_temp)) / k_temp)); // R*(l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );

      spirographArray.push({ x: tx, y: ty, z: tz });
    }
    var lineMat = new THREE.LineBasicMaterial({ color: "white" });
    var lineGeo = new THREE.BufferGeometry().setFromPoints(spirographArray);
    lineMesh = new THREE.Line(lineGeo, lineMat);
    scene.add(lineMesh);
  }

// _____________________________________________________________________ AXIS AND CAMERA _________________________________________________________________________

  if (controls.axis_visibility >= 0.5) {
    scene.add(axes);
  } else {
    scene.remove(axes);
  }

  renderer.clear();

  //CAMERA ZOOM IN AND ZOOM OUT
  camera1.position.y = -40 + controls.zoom * 80;
  camera2 = new THREE.PerspectiveCamera(
    20 * controls.zoom,
    0.5 * aspect,
    1,
    100000
  );

  // CAMERA LATITUDE and LONGITUDE
  var result = camera2Pos(controls.latitude, -controls.longitude);
  var result2 = camera2Pos(0, -controls.longitude);
  camera2.position.set(result[0], result[1], result[2]);

  camera1.position.x = result2[0];
  camera1.position.z = result2[2];

  camera1.updateProjectionMatrix();
  camera2.updateProjectionMatrix();

  camera1.lookAt(0, 0, 0);
  renderer.setViewport(0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
  renderer.render(scene, camera1);

  camera2.lookAt(0, 0, 0);
  renderer.setViewport(SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT);
  renderer.render(scene, camera2);

  //renderer.render( scene, camera );
}

function onKeyDown(event) {}

//

function onWindowResize() {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  camera.aspect = 0.5 * aspect;
  camera.updateProjectionMatrix();

  camera1.left = (-0.5 * frustumSize * aspect) / 2;
  camera1.right = (0.5 * frustumSize * aspect) / 2;
  camera1.top = frustumSize / 2;
  camera1.bottom = -frustumSize / 2;
  camera1.updateProjectionMatrix();

  camera2.left = (-0.5 * frustumSize * aspect) / 2;
  camera2.right = (0.5 * frustumSize * aspect) / 2;
  camera2.top = frustumSize / 2;
  camera2.bottom = -frustumSize / 2;
  camera2.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

// _____________________________________________________________________ CAMERA POSITION _________________________________________________________________________
function camera2Pos(latitude, longtitude) {
  var radius = 75;

  var alpha = (90 - latitude) * (Math.PI / 180);
  var beta = (longtitude + 180) * (Math.PI / 180);

  x = -(radius * Math.sin(alpha) * Math.cos(beta));
  z = radius * Math.sin(alpha) * Math.sin(beta);
  y = radius * Math.cos(alpha);

  return [x, y, z];
}

// _____________________________________________________________________ TERRAIN PERLIN NOISE _________________________________________________________________________
function refreshVertices() {
  perlin = new Perlin();

  var myVertices = terrain.geometry.attributes.position.array;
  for (var i = 0; i <= myVertices.length; i += 3) {
    myVertices[i + 2] =
      peak *
      perlin.noise(
        (terrain.position.x + myVertices[i]) / smoothing,
        (terrain.position.z + myVertices[i + 1]) / smoothing
      );
  }
  terrain.geometry.attributes.position.needsUpdate = true;
  terrain.geometry.computeVertexNormals();
}

// _____________________________________________________________________ MIRROR RENDERING _________________________________________________________________________
function refreshMirror(time) {
  if (time % 100 == 0) {
    mirrorSphere.visible = false;
    mirrorSphereCamera.position = mirrorSphere.position;
    //mirrorSphereCamera.updateCubeMap(renderer, scene);
    mirrorSphereCamera.update(renderer, scene);
    mirrorSphere.visible = true;
  }
}

// _____________________________________________________________________ AUDIO SOUND _________________________________________________________________________
function play(){

    if (controls.music >=0.5) {
        sound.play();
    } else {
        sound.stop();
    }
}

// _____________________________________________________________________ SKYBOX _________________________________________________________________________

function newBackground(letter) {
    var path; 

    if (letter=='a'){
        path = "skyboxes/NissiBeach/"
    } else if (letter=='b'){
        path = "skyboxes/NissiBeach2/"
    } else if (letter=='c') {
        path = "skyboxes/LarnacaBeach/"
    } else if (letter=='d'){
        path = "skyboxes/Bridge/"
    } else if (letter=='e') {
        path = "skyboxes/SanFrancisco3/"
    }

    scene.background = new THREE.CubeTextureLoader()
        .setPath(path)
        .load([
        "posx.jpg",
        "negx.jpg",
        "posy.jpg",
        "negy.jpg",
        "posz.jpg",
        "negz.jpg",
    ]);

    refreshCups();
    refreshMirror(100);
    render();
}

function setChecked( prop ){
  for (let param in parameters){
    parameters[param] = false;
  }
  parameters[prop] = true;
}

function refreshCups(){

  const refractionCube = scene.background;
  refractionCube.mapping = THREE.CubeRefractionMapping;

      // Reflection Refractive Materials
  var refractionMaterial = new THREE.MeshLambertMaterial({
    color: 0x4f6482, // ffee00,
    envMap: refractionCube,
    refractionRatio: 0.8,
  });
  var refraction2Material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    envMap: scene.background,
    refractionRatio: 0.9,
  });

  // GLASS
  scene.remove(glassMesh);
  var glassGeometry = new THREE.CylinderGeometry(8, 5, 30, 40, 40); // true);
  glassMesh = new THREE.Mesh(glassGeometry, refraction2Material);
  glassMesh.position.set(-40, -2, 0);
  scene.add(glassMesh);

  // METAL CAN
  scene.remove(canMesh);
  // var canGeometry = new THREE.CylinderGeometry(8, 8, 30, 40, 40); //true);
  canMesh = new THREE.Mesh(glassGeometry, refractionMaterial);
  // canMesh.rotation.z = -Math.pi/4;
  canMesh.position.set(40, -1, 0);
  scene.add(canMesh);

}

