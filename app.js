import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 10;  // הרחקנו מעט את המצלמה

const scene = new THREE.Scene();
let fairyZelda;
let mixer;
const loader = new GLTFLoader();

const modelPath = './models/Fairy Zelda BOTW.glb';

loader.load(modelPath,
    function (gltf) {
        fairyZelda = gltf.scene;
        fairyZelda.scale.set(1, 1, 1);  // הגדלנו את המודל
        fairyZelda.position.set(0, 0, 0);
        scene.add(fairyZelda);

        console.log('מודל נטען בהצלחה');
        console.log('מיקום המודל:', fairyZelda.position);
        console.log('גודל המודל:', fairyZelda.scale);

        mixer = new THREE.AnimationMixer(fairyZelda);
        if (gltf.animations.length > 0) {
            mixer.clipAction(gltf.animations[0]).play();
            console.log('אנימציה הופעלה');
        } else {
            console.log('אין אנימציות במודל');
        }
        modelMove();
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% טעון');
    },
    function (error) {
        console.error('שגיאה בטעינת המודל:', error);
        console.error('סטאק השגיאה:', error.stack);
    }
);

const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// תאורה
const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(0, 1, 1);
scene.add(topLight);

const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    renderer.render(scene, camera);
    if(mixer) mixer.update(0.02);
};
reRender3D();

let arrPositionModel = [
    {
        id: 'banner',
        position: {x: 0, y: -1, z: 0},
        rotation: {x: 0, y: 1.5, z: 0}
    },
    {
        id: "intro",
        position: { x: 1, y: -1, z: -5 },
        rotation: { x: 0.5, y: -0.5, z: 0 },
    },
    {
        id: "description",
        position: { x: -1, y: -1, z: -5 },
        rotation: { x: 0, y: 0.5, z: 0 },
    },
    {
        id: "contact",
        position: { x: 0.8, y: -1, z: 0 },
        rotation: { x: 0.3, y: -0.5, z: 0 },
    },
];

const modelMove = () => {
    const sections = document.querySelectorAll('.section');
    let currentSection;
    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
            currentSection = section.id;
        }
    });
    let position_active = arrPositionModel.findIndex(
        (val) => val.id == currentSection
    );
    if (position_active >= 0 && fairyZelda) {
        let new_coordinates = arrPositionModel[position_active];
        gsap.to(fairyZelda.position, {
            x: new_coordinates.position.x,
            y: new_coordinates.position.y,
            z: new_coordinates.position.z,
            duration: 3,
            ease: "power1.out"
        });
        gsap.to(fairyZelda.rotation, {
            x: new_coordinates.rotation.x,
            y: new_coordinates.rotation.y,
            z: new_coordinates.rotation.z,
            duration: 3,
            ease: "power1.out"
        })
    }
}

window.addEventListener('scroll', () => {
    if (fairyZelda) {
        modelMove();
    }
})

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})

// פונקציה לשינוי גודל המודל
function scaleModel(scaleChange) {
    if (fairyZelda) {
        fairyZelda.scale.x += scaleChange;
        fairyZelda.scale.y += scaleChange;
        fairyZelda.scale.z += scaleChange;
        console.log('גודל המודל החדש:', fairyZelda.scale);
    }
}

// מאזין לאירועי מקלדת לשינוי גודל המודל
window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case '+':
        case '=':
            scaleModel(0.1);
            break;
        case '-':
        case '_':
            scaleModel(-0.1);
            break;
    }
});

// פונקציה לבדיקת נראות המודל
function checkModelVisibility() {
    if (fairyZelda) {
        const box = new THREE.Box3().setFromObject(fairyZelda);
        const size = box.getSize(new THREE.Vector3());
        console.log('גודל המודל:', size);
        console.log('מיקום המודל:', fairyZelda.position);
        console.log('סיבוב המודל:', fairyZelda.rotation);
    } else {
        console.log('המודל עדיין לא נטען');
    }
}

// קורא לפונקציה כל 5 שניות
setInterval(checkModelVisibility, 5000);
