require('./scss/main.scss');

const THREE = require('three');
const GLTFLoader = require('three-gltf-loader');
const { UnrealBloomPass } = require('three/examples/jsm/postprocessing/UnrealBloomPass.js');
const { EffectComposer } = require('three/examples/jsm/postprocessing/EffectComposer.js');
const { RenderPass } = require('three/examples/jsm/postprocessing/RenderPass.js');

var params = {
    exposure: 2,
    bloomStrength: 3,
    bloomThreshold: 0,
    bloomRadius: 1.8
};

var renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.setClearColor( 0xffffff, 0);
renderer.toneMapping = THREE.ReinhardToneMapping;
// renderer.toneMappingExposure = params.exposure ** 4;

var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;
bloomPass.copyUniforms[ "opacity" ].value = 0.6;
document.body.appendChild( renderer.domElement );

const worms = {
    default: "/assets/worm1.gltf",
    peluche: "/assets/WARMPELUCHE.gltf",
    blue: "/assets/WORMBLUE.gltf",
    yellow: "/assets/WORMYELLOW.gltf",
    test: "/assets/PrimaryIonDrive.glb"
};

THREE.Cache.enabled = true;
const loader2 = new GLTFLoader();

const loadGLTF = (path) => {
    return new Promise((res, rej) => {
        loader2.load(path, (gltf) => {res(gltf)});
    });
}

class Shelf {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.lights = [];
        this.wormObjects = [];
        this.movingWorms = [];

        this.composer = new EffectComposer(renderer);
        this.clock = null;

    }

    async addWorm(worm, x=0, y=0, z=0) {
        let gltf = await loadGLTF(worm);
        let wormObject = gltf.scene.children[0];

        wormObject.scale.set(0.25,0.25,0.25);
        wormObject.position.set(x,y,z);
        this.scene.add(wormObject);
        this.animate();

        wormObject.traverse((obj) => {
            if (obj.isMesh){
                obj.material.depthWrite = !obj.material.transparent;
            }
        });
        wormObject.rotation.y += 3*Math.random();
        this.wormObjects.push(wormObject);
        this.movingWorms.push(false);
    }

    addKeyBoardEvents() {
        document.addEventListener("keyup", e => {
            let index = e.key -1;
            if (!this.wormObjects[index]) return;

            this.movingWorms[index] = !this.movingWorms[index];
            if (this.shouldAnimate()) {
                this.animate();
            }
        });
    }
    async setupSceneFromFile() {
        let gltf = await loadGLTF(worms.default);
        this.scene = gltf.scene;
        this.scene.background = null;
        this.camera = gltf.cameras[0];

        const light1  = new THREE.AmbientLight(0x00ff00, 0.3);
        light1.name = 'ambient_light';
        this.camera.add( light1 );
        this.lights.push(light1);

        const light2  = new THREE.PointLight(0xFFFFFF, 1);
        // light2.position.set(0.5, 0, 0.866);
        light2.name = 'main_light';
        this.camera.add( light2 );
        this.lights.push(light2);

        let object = this.scene.children[0];
        this.scene.remove(object);
        
        let renderScene = new RenderPass( this.scene, this.camera);
        this.composer.addPass(renderScene);
        this.composer.addPass( bloomPass );
        this.clock = new THREE.Clock();

        this.animate();
    }
    shouldAnimate() {
        let should = false;
        for (let i=0;i<this.wormObjects.length;i++) {
            if (this.movingWorms[i]) {
                should = true;
            }
        }
        return should;
    }
    animate() {
        if (this.shouldAnimate()) {
            setTimeout( () => {
                requestAnimationFrame( this.animate.bind(this) );
            }, 100 );   
        }
        for (let i=0;i<this.wormObjects.length;i++) {
            if (this.movingWorms[i]) {
                this.wormObjects[i].rotation.y += 0.05;
            }
        }            

        this.composer.render();

    }
}

let shelf = new Shelf();
shelf.setupSceneFromFile().then(async () => {
    await shelf.addWorm(worms.blue, 250,60,0);
    await shelf.addWorm(worms.yellow, 90,30,0);
    await shelf.addWorm(worms.peluche, -80,20,0);
    await shelf.addWorm(worms.default, -280,-30,0);
    shelf.addKeyBoardEvents();
});