/*
Alexandra Sklokin 
300010511

NOTE: Needs to be run on a server using the command:
	http-server . -p 8080

*/

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

let container;
let scene, renderer, tpMesh, tp2Mesh, tp3Mesh, lineMesh, radius, R, spirographArray;
let cameraRig, camera, camera1, camera2;
let controls;
const frustumSize = 200;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	scene = new THREE.Scene();

	var axes = new THREE.AxesHelper(40);
    scene.add(axes);

	//

	camera = new THREE.OrthographicCamera( frustumSize  / - 2, frustumSize / 2, frustumSize / 2, frustumSize / - 2, 1, 10000 ); //new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 10000 );
	camera.position.z = 200;

	camera1 =  new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 100000 );

	//
	camera2 = new THREE.PerspectiveCamera( 500, 0.5 * aspect, 1, 100000 );

	//cameraOrtho.rotation.y = Math.PI;
	//camera2.rotation.y = Math.PI;

	// counteract different front orientation of cameras vs rig

	//camera1.rotation.y = Math.pi;
	//camera2.rotation.z = Math.pi;

	//camera1.position.y = 500;
	//camera2.position.z = 1000;

	cameraRig = new THREE.Group();

	camera1.position.y = 300;
	camera2.position.z = 75;

	cameraRig.add( camera1 );
	cameraRig.add( camera2 );

	scene.add( cameraRig );

	//

	const geometry = new THREE.BufferGeometry();
	const vertices = [];

	for ( let i = 0; i < 20000; i ++ ) {

		vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
		vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
		vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z

	}

	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

	// const particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
	// scene.add( particles );

	scene.background = new THREE.CubeTextureLoader()
	.setPath( '../beach-skyboxes/LarnacaBeach/' )
	.load( [
		'posx.jpg',
		'negx.jpg',
		'posy.jpg',
		'negy.jpg',
		'posz.jpg',
		'negz.jpg'
	] );

	// _____________________________________________________________________ MY CODE _________________________________________________________________________
	
	radius = 20;


	var tpGeometry = new THREE.TeapotGeometry(3, 3, true, true, true, false, false);
	var tpMaterial = new THREE.MeshBasicMaterial({color: 0x32a852 });
	// tpMesh = new THREE.Mesh(tpGeometry, tpMaterial);
	//scene.add(tpMesh);

	var sphereGeometry = new THREE.SphereBufferGeometry(150, 40, 40, 0, 2*Math.PI, 0, 0.15 * Math.PI);
	var sandMaterial = new THREE.MeshBasicMaterial({color: 0xcfcea3});
	sphereMesh = new THREE.Mesh(sphereGeometry, sandMaterial);
	sphereMesh.position.y = -140 ;
	scene.add(sphereMesh);

	const loader = new THREE.GLTFLoader();

  	loader.load( 
  	'Stork.glb', 
  	function ( gltf ) { 
  		console.log(gltf);		
		gltf.scenes[0].children[0].scale.x = .15;
		gltf.scenes[0].children[0].scale.y = .15;
		gltf.scenes[0].children[0].scale.z = .15;
		gltf.scenes[0].children[0].material = new THREE.MeshBasicMaterial({color: 0x32a852 });
		tpMesh = Object.create(gltf.scenes[0].children[0]);
		console.log(tpMesh);
	 } 
	);

	loader.load( 
  	'Parrot.glb', 
  	function ( gltf ) { 
  		console.log(gltf);		
		//gltf.scene.scale.x = .2;
		//gltf.scene.scale.y = .2;
		//gltf.scene.scale.z = .2;
		gltf.scenes[0].children[0].scale.x = .15;
		gltf.scenes[0].children[0].scale.y = .15;
		gltf.scenes[0].children[0].scale.z = .15;
		gltf.scenes[0].children[0].material = new THREE.MeshBasicMaterial({color: 0xa86032 });
		tp2Mesh = Object.create(gltf.scenes[0].children[0]);
		console.log(tpMesh);
	 } 
	);

    loader.load( 
  	'Flamingo.glb', 
  	function ( gltf ) { 
  		console.log(gltf);		
		//gltf.scene.scale.x = .2;
		//gltf.scene.scale.y = .2;
		//gltf.scene.scale.z = .2;
		gltf.scenes[0].children[0].scale.x = .15;
		gltf.scenes[0].children[0].scale.y = .15;
		gltf.scenes[0].children[0].scale.z = .15;
		gltf.scenes[0].children[0].material = new THREE.MeshBasicMaterial({color: 0xa8329c });
		tp3Mesh = Object.create(gltf.scenes[0].children[0]);
		console.log(tpMesh);
	 } 
	);

	controls = new function () {
    	this.l = 0.9;
    	this.k = 0.3;
   		this.length = 180*6;
   		this.R = 70;
    	this.redraw = function() { render(); }
    }

    var gui = new dat.GUI();
    gui.add(controls, 'length', 180, 34900).onChange(controls.redraw);
    gui.add(controls, 'R', 20, 150).onChange(controls.redraw);
    gui.add(controls, 'l', 0, 1).onChange(controls.redraw);
    gui.add(controls, 'k', 0, 0.99).onChange(controls.redraw);

	// _____________________________________________________________________ MY CODE _________________________________________________________________________

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	container.appendChild( renderer.domElement );
	renderer.outputEncoding = THREE.sRGBEncoding;

	renderer.autoClear = false;

	window.addEventListener( 'resize', onWindowResize );

}

function render() {

	var t = ((Math.PI / 180) * Date.now() * 0.03);
	var t2 = ((Math.PI / 180) * Date.now() * 0.05);
	var t3 = ((Math.PI / 180) * Date.now() * 0.04);
	// console.log(Date.now());
	var k_temp = controls.k;
	var l_temp = controls.l; 
	R = controls.R;
	var length_temp = controls.length;

	scene.remove(tpMesh);
	scene.remove(tp2Mesh);
	scene.remove(tp3Mesh);

	tpMesh.position.x = R*((1-k_temp)*Math.cos(t) + l_temp*k_temp*Math.cos((t*(1-k_temp))/(k_temp)) );
	tpMesh.position.y = 40; // R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
	tpMesh.position.z = R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) ); // R*(l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );

	tp2Mesh.position.x = R*((1-k_temp)*Math.cos(t2) + l_temp*k_temp*Math.cos((t2*(1-k_temp))/(k_temp)) );
	tp2Mesh.position.y = 60; // R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
	tp2Mesh.position.z = R*((1-k_temp)*Math.sin(t2) - l_temp*k_temp*Math.sin((t2*(1-k_temp))/(k_temp)) ); // R*(l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );

	tp3Mesh.position.x = R*((1-k_temp)*Math.cos(t3) + l_temp*k_temp*Math.cos((t3*(1-k_temp))/(k_temp)) );
	tp3Mesh.position.y = 50; // R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
	tp3Mesh.position.z = R*((1-k_temp)*Math.sin(t3) - l_temp*k_temp*Math.sin((t3*(1-k_temp))/(k_temp)) ); // R*(l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );

	scene.add(tpMesh);
	scene.add(tp2Mesh);
	scene.add(tp3Mesh);

	scene.remove(lineMesh);

	spirographArray = [];

    for(var theta=0; theta<=length_temp; theta += 1){
        
        t = ((Math.PI / 180) * theta);
     
       	var tx = R*((1-k_temp)*Math.cos(t) + l_temp*k_temp*Math.cos((t*(1-k_temp))/(k_temp)) );
		var ty = 40; // R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
		var tz = R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) ); // R*(l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
        
        spirographArray.push({x: tx , y: ty , z: tz});                               
    
    }
	var lineMat = new THREE.LineBasicMaterial( { color: 'white' } );
	var lineGeo = new THREE.BufferGeometry().setFromPoints( spirographArray );
	lineMesh = new THREE.Line( lineGeo, lineMat );
	scene.add(lineMesh);

	renderer.clear();

	camera1.updateProjectionMatrix();
	camera2.updateProjectionMatrix();

	camera1.lookAt( 0, 0, 0 );	
	renderer.setViewport( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
	renderer.render( scene, camera1 );

	camera2.lookAt(0,0,0);
	renderer.setViewport( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
	renderer.render( scene, camera2 );

	//renderer.render( scene, camera );


}

function onKeyDown( event ) {

}

//

function onWindowResize() {

	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;
	aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

	camera.aspect = 0.5 * aspect;
	camera.updateProjectionMatrix();
	
	camera1.left = - 0.5 * frustumSize * aspect / 2;
	camera1.right = 0.5 * frustumSize * aspect / 2;
	camera1.top = frustumSize / 2;
	camera1.bottom = - frustumSize / 2;
	camera1.updateProjectionMatrix();

	camera2.left = - 0.5 * frustumSize * aspect / 2;
	camera2.right = 0.5 * frustumSize * aspect / 2;
	camera2.top = frustumSize / 2;
	camera2.bottom = - frustumSize / 2;
	camera2.updateProjectionMatrix();

}


function animate() {
	requestAnimationFrame( animate );
	render();
}

/* Sources:

Spirograph 3D Shape: 
https://fractalformulas.wordpress.com/flame-variations/spirograph3d/

Stork Mesh:
https://github.com/mrdoob/three.js/blob/master/examples/models/gltf/Stork.glb

Two ViewPorts:
https://github.com/mrdoob/three.js/blob/master/examples/webgl_camera.html


*/
