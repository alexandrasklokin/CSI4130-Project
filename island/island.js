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
let scene, renderer, tpMesh, tp2Mesh, tp3Mesh, horseMesh, lineMesh, radius, R, spirographArray;
let cameraRig, camera, camera1, camera2, axes;
let controls;
const frustumSize = 200;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	scene = new THREE.Scene();

	axes = new THREE.AxesHelper(40);
    scene.add(axes);

	//

	camera = new THREE.OrthographicCamera( frustumSize  / - 2, frustumSize / 2, frustumSize / 2, frustumSize / - 2, 1, 10000 ); //new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 10000 );
	camera.position.z = 200;

	camera1 =  new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 100000 );

	//
	camera2 = new THREE.PerspectiveCamera( 130, 0.5 * aspect, 1, 100000 );


	cameraRig = new THREE.Group();

	camera1.position.y = 300;
	// camera2.position.z = 75;

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

	// _____________________________________________________________________ MY CODE _________________________________________________________________________

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

	
	// TEAPOT
	var tpGeometry = new THREE.TeapotGeometry(3, 3, true, true, true, false, false);
	var tpMaterial = new THREE.MeshBasicMaterial({color: 0x32a852 });
	// tpMesh = new THREE.Mesh(tpGeometry, tpMaterial);
	//scene.add(tpMesh);

	// ISLAND
	var islandGeometry = new THREE.SphereBufferGeometry(150, 40, 40, 0, 2*Math.PI, 0, 0.15 * Math.PI);
	var sandMaterial = new THREE.MeshBasicMaterial({color: 0xcfcea3});
	islandMesh = new THREE.Mesh(islandGeometry, sandMaterial);
	islandMesh.position.y = -150 ;
	scene.add(islandMesh);

	// GLASS CUP
	var glassGeometry = new THREE.CylinderGeometry(4, 2.5, 10, 40, 40); //true);
	var whiteMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
	glassMesh = new THREE.Mesh(glassGeometry, whiteMaterial);
	glassMesh.position.x = -30 ;
	glassMesh.position.y = -2 ;
	glassMesh.position.z = 30 ;
	scene.add(glassMesh);

	// METAL CAN
	var canGeometry = new THREE.CylinderGeometry(6, 6, 10, 40, 40); //true);
	var greyMaterial = new THREE.MeshBasicMaterial({color: 0x878787});
	canMesh = new THREE.Mesh(canGeometry, greyMaterial);
	// canMesh.rotation.z = -Math.pi/4;
	canMesh.position.x = 30 ;
	canMesh.position.y = -1 ;
	canMesh.position.z = 30 ;
	scene.add(canMesh);

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
		console.log(tp2Mesh);
	 } 
	);

    loader.load( 
  	'Flamingo.glb', 
  	function ( gltf ) { 
  		console.log(gltf);		
		gltf.scenes[0].children[0].scale.x = .15;
		gltf.scenes[0].children[0].scale.y = .15;
		gltf.scenes[0].children[0].scale.z = .15;
		gltf.scenes[0].children[0].material = new THREE.MeshBasicMaterial({color: 0xa8329c });
		tp3Mesh = Object.create(gltf.scenes[0].children[0]);
		console.log(tp3Mesh);
	 } 
	);

	loader.load( 
  	'Horse.glb', 
  	function ( gltf ) { 
  		console.log(gltf);		
		gltf.scenes[0].children[0].scale.x = .15;
		gltf.scenes[0].children[0].scale.y = .15;
		gltf.scenes[0].children[0].scale.z = .15;
		gltf.scenes[0].children[0].material = new THREE.MeshBasicMaterial({color: 0x000000 });
	    horseMesh = Object.create(gltf.scenes[0].children[0]);
		console.log(horseMesh);
	 } 
	);

	controls = new function () {
    	this.l = 0.9;
    	this.k = 0.3;
   		this.length = 180*6;
   		this.R = 70;
   		this.visibility = 1;
   		this.latitude = 20;
    	this.longitude = 45;
    	this.zoom = 4.5;
    	this.axis_visibility = 1;
    	this.redraw = function() { render(); }
    }

    const datGui  = new dat.GUI({ autoPlace: true });
    datGui.domElement.id = 'gui';

    var sfolder = datGui.addFolder(`Spirograph`);
    sfolder.add(controls, 'length', 180, 34900).onChange(controls.redraw);
    sfolder.add(controls, 'R', 20, 150).onChange(controls.redraw);
    sfolder.add(controls, 'l', 0, 1).onChange(controls.redraw);
    sfolder.add(controls, 'k', 0, 0.99).onChange(controls.redraw);
    sfolder.add(controls, 'visibility', 0,1).onChange(controls.redraw);
    
    var cfolder = datGui.addFolder(`Camera`);
    cfolder.add(controls, 'latitude',  0, 89.9).onChange(controls.redraw); // 180).onChange(controls.redraw);
    cfolder.add(controls, 'longitude', -180, 180).onChange(controls.redraw);
    cfolder.add(controls, 'zoom', 1.0, 7.0).onChange(controls.redraw);
    cfolder.add(controls, 'axis_visibility', 0, 1).onChange(controls.redraw);

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
	tpMesh.position.y = 70; // R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
	tpMesh.position.z = R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) ); // R*(l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );

	tp2Mesh.position.x = R*((1-k_temp)*Math.cos(t2) + l_temp*k_temp*Math.cos((t2*(1-k_temp))/(k_temp)) );
	tp2Mesh.position.y = 80; // R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
	tp2Mesh.position.z = R*((1-k_temp)*Math.sin(t2) - l_temp*k_temp*Math.sin((t2*(1-k_temp))/(k_temp)) ); // R*(l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );

	tp3Mesh.position.x = R*((1-k_temp)*Math.cos(t3) + l_temp*k_temp*Math.cos((t3*(1-k_temp))/(k_temp)) );
	tp3Mesh.position.y = 60; // R*((1-k_temp)*Math.sin(t) - l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );
	tp3Mesh.position.z = R*((1-k_temp)*Math.sin(t3) - l_temp*k_temp*Math.sin((t3*(1-k_temp))/(k_temp)) ); // R*(l_temp*k_temp*Math.sin((t*(1-k_temp))/(k_temp)) );

	scene.add(tpMesh);
	scene.add(tp2Mesh);
	scene.add(tp3Mesh);
	scene.add(horseMesh);

	if (controls.visibility == 0) {
		scene.remove(lineMesh);
	} else {

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

	}

	if (controls.axis_visibility == 1){
		scene.add(axes);
	} else {
		scene.remove(axes);
	}

	renderer.clear();

	//CAMERA ZOOM IN AND ZOOM OUT
	camera1.position.y = -40 + controls.zoom*80;
	camera2 = new THREE.PerspectiveCamera( 20*controls.zoom, 0.5 * aspect, 1, 100000 );

	// CAMERA LATITUDE and LONGITUDE
    var result = camera2Pos(controls.latitude, -controls.longitude);
    var result2 = camera2Pos(0, -controls.longitude);
    camera2.position.x = result[0];
    camera2.position.y = result[1];
    camera2.position.z = result[2];

    camera1.position.x = result2[0];
    camera1.position.z = result2[2];

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

function camera2Pos(latitude, longtitude){

    var radius = 75;
  
    var alpha   = (90-latitude)*(Math.PI/180)
    var beta = (longtitude+180)*(Math.PI/180)

    x = -((radius) * Math.sin(alpha)*Math.cos(beta))
    z = ((radius) * Math.sin(alpha)*Math.sin(beta))
    y = ((radius) * Math.cos(alpha))

    return [x,y,z]

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
