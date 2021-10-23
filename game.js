import * as THREE from './three/three.module.js';

import { GLTFLoader } from './three/GLTFLoader.js';
import { OrbitControls } from './three/OrbitControls.js';

const controls = {
    moveW: false,
    moveS: false,
    moveA: false,
    moveD: false,
    jmp: false,
    shft: false
};



let posx, posy, posz;
let camcontrols;
let mixer, camera, scene, renderer, clock, gob;
let walkAn, idleAn, runAn, jumpAn, danceAn;
camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set(0, 6, -10);
makeEnvi();
animate();

function makeEnvi(){

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;

    document.body.appendChild( renderer.domElement );


    scene = new THREE.Scene();
    
    scene.add( camera );

    const hemLight = new THREE.HemisphereLight( 0xffffff, 0x2e1b01, .8 );
    hemLight.position.set( 0, 100, 0);
    scene.add(hemLight);
        
    const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.position.set( -5 , 10, 10 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = - 100;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add( dirLight );

    
  
    clock = new THREE.Clock();

    const skyBox = new THREE.CubeTextureLoader();
      const texture = skyBox.load([
          './resources/bay_ft.jpg',
          './resources/bay_bk.jpg',
          './resources/bay_up.jpg',
          './resources/bay_dn.jpg',
          './resources/bay_rt.jpg',
          './resources/bay_lf.jpg',
      ]);

    scene.background = texture;

    const groundText = new THREE.TextureLoader().load( "./resources/Grass.jpg" );

    const geometry = new THREE.PlaneGeometry( 100, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, map: groundText} );

    material.map.repeat.set(15, 15);
    material.map.wrapS = THREE.RepeatWrapping;
	material.map.wrapT = THREE.RepeatWrapping;
	material.map.encoding = THREE.sRGBEncoding;

 
    const floor = new THREE.Mesh( geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;

    scene.add( floor );

    camcontrols = new OrbitControls( camera, renderer.domElement );
	camcontrols.target.set( 0, 6, 0 );
    camcontrols.enablePan = false;
    camera.lookAt(0, 6);

    camcontrols.update();

    const loader = new GLTFLoader();
    loader.setPath('./resources/3dmodel/');
    loader.load('./troll.glb', function ( gltf ) {
        
        gob = gltf.scene;
        scene.add(gob);

      

        gob.traverse( function ( object ) {

            if ( object.isMesh ) object.castShadow = true;

        } );
        
        
        

        scene.add( gob );

        const animations = gltf.animations;
        gob.scale.setScalar(100);
        mixer = new THREE.AnimationMixer( gob );

        idleAn = mixer.clipAction( animations[ 4 ]);
        idleAn.play();

        walkAn = mixer.clipAction( animations[ 1 ]);
        runAn = mixer.clipAction( animations[ 2 ]);
        danceAn = mixer.clipAction( animations[ 0 ]);
        jumpAn = mixer.clipAction( animations[ 3 ]);

		} );

	//document.addEventListener( 'keydown', onKeyDown );
	//document.addEventListener( 'keyup', onKeyUp );



    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener( 'keydown', onKeyDown );
	document.addEventListener( 'keyup', onKeyUp );



};
function move(){
    posx = gob.position.x;
    posy = gob.position.y;
    posz = gob.position.z;

    if (controls.moveW == true){
        gob.translateZ(.05);
        walkAn.play();
        camera.translateZ(-.05);
    }
    if (controls.moveW == true && controls.shft == true){
        gob.translateZ(.15);
        runAn.play();
        camera.translateZ(-.15);
    }
    if (controls.moveS == true){
        gob.translateZ(-.05);
        camera.translateZ(.05)
        walkAn.play()
    }
    if (controls.moveA == true){
        gob.rotation.y +=.03;
        camera.position.y= Math.PI;
        camera.postion.x = Math.PI;
        walkAn.play();
    }
    if (controls.moveD == true){
        gob.rotation.y -=.03; 
        walkAn.play();
    }
    if (controls.jmp == true){

    }
    if(controls.moveA == false && controls.moveW == false){  
        idleAn.play();
    }

        


}
function onKeyDown( event ) {

    switch ( event.code ) {

        case 'ShiftLeft': controls.shft = true; break;

        case 'ArrowUp':
        case 'KeyW': controls.moveW = true; break;

        case 'ArrowDown':
        case 'KeyS': controls.moveS = true; break;

        case 'ArrowLeft':
        case 'KeyA': controls.moveA = true; break;

        case 'ArrowRight':
        case 'KeyD': controls.moveD = true; break;
        
        case 'Space': controls.jmp = true; break;
        
        

    }

}

function onKeyUp( event ) {
     
    switch ( event.code ) {

        case 'ShiftLeft': controls.shft = false; runAn.stop(); break;
        case 'ArrowUp':
        case 'KeyW': controls.moveW = false; break;

        case 'ArrowDown':
        case 'KeyS': controls.moveS = false; break;

        case 'ArrowLeft':
        case 'KeyA': controls.moveA = false; break;

        case 'ArrowRight':
        case 'KeyD': controls.moveD = false; break;

        case 'Space': controls.jmp = false; break;

    }
    if(controls.shft == false && controls.moveW == false && controls.moveA == false && controls.moveD == false && controls.moveS == false){
        mixer.stopAllAction();
    }

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}
function animate() {

    
    requestAnimationFrame( animate );

    if ( mixer ) mixer.update( clock.getDelta() );
    
    render();
}
function render() {

    move();

    const delta = clock.getDelta();
 
    camera.lookAt(posx, posy+6, posz);

	if ( mixer ) mixer.update( delta );
    
    renderer.render( scene, camera );
}