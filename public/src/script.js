/***********
	Adding event listeners for drag and drop
***********/
let $ = id => document.querySelector(id);
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
	document.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) {
	e.preventDefault();
	e.stopPropagation();
	e.dataTransfer.dropEffect = 'copy';
}
/***********
	threejs 
***********/

// Gui options
let render_mode = {
	Planar: false,
	Axial: false,
	addLightToScene: false,
	DragControls: false
};
//global variables
let scene, camera, renderer, controls;
let obj_array = [];

// mouse coordinates
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

//updateing mouse cood
function onMouseMove(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', onMouseMove, false);

//threejs everything is inside a scene
scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);
scene.add(new THREE.AmbientLight(0xf0f0f0));

camera = new THREE.PerspectiveCamera(
	70,
	window.innerWidth / window.innerHeight,
	1,
	10000
);
camera.position.set(0, 100, 1000);
scene.add(camera);
renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
window.addEventListener('resize', onWindowResize, false);

controls = new THREE.OrbitControls(camera);

function animate() {
	raycasterRenderer();
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
animate();

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

/***********
	file drop
***********/
document.addEventListener('drop', handleFileSelect, false);

function handleFileSelect(ev) {
	if (!render_mode.Planar && !render_mode.Axial) {
		alert('choose a type planer or axial');
		return;
	}

	let files = [...ev.dataTransfer.files];
	files.forEach(file => {
		loadFile(file);
	});
}

//TODO: adding .tjs support
function loadFile(file) {
	let ext = file['name'].split('.').pop();
	let reader = new FileReader();

	switch (ext) {
		case 'STL':
		case 'stl':
			let loaderSTL = new THREE.STLLoader();
			reader.onload = () => {
				let geometry = new THREE.STLLoader().parse(reader.result);
				geometry.sourceType = 'stl';
				var material = new THREE.MeshStandardMaterial();
				var mesh = new THREE.Mesh(geometry, material);
				addObjToScene(mesh, file['name']);
			};
			reader.readAsText(file);
			break;
		case 'JSON':
		case 'TJS':
		case 'tjs':
		case 'json':
			reader.onload = () => {
				let contents = reader.result;
				if (contents.indexOf('postMessage') !== -1) {
					var blob = new Blob([contents], { type: 'text/javascript' });
					var url = URL.createObjectURL(blob);

					var worker = new Worker(url);

					worker.onmessage = function(event) {
						event.data.metadata = { version: 2 };
						handleJSON(event.data, file['name']);
					};

					worker.postMessage(Date.now());

					return;
				}

				var data;

				try {
					data = JSON.parse(contents);
				} catch (error) {
					alert(error);
					return;
				}

				handleJSON(data, file['name']);
			};
			reader.readAsText(file);
			break;
		default:
			alert('format not supported');
	}
}

function handleJSON(data, name) {
	var loader = new THREE.JSONLoader();
	data.metadata.type = 'Geometry';
	var result = loader.parse(data);

	var geometry = result.geometry;
	var material;

	if (result.materials !== undefined) {
		if (result.materials.length > 1) {
			material = new THREE.MultiMaterial(result.materials);
		} else {
			material = result.materials[0];
		}
	} else {
		material = new THREE.MeshStandardMaterial();
	}

	geometry.sourceType = 'ascii';

	var mesh;

	if (geometry.animation && geometry.animation.hierarchy) {
		mesh = new THREE.SkinnedMesh(geometry, material);
	} else {
		mesh = new THREE.Mesh(geometry, material);
	}

	addObjToScene(mesh, name);
}

let gui1 = new dat.GUI();
let gui1_f3;

function addObjToScene(obj, name) {
	obj.name = name;
	obj_array.push(obj);
	// createIcon(obj.name, obj.uuid);
	scene.add(obj);
	// gui1_f3.add(obj, 'name').on
}

// function createIcon(name, uuid) {
// 	let btn = document.createElement('button');
// 	btn.classList.add('file');
// 	btn.id = uuid;
// 	btn.innerText = name;
// 	btn.addEventListener('click', e => {
// 		setTarget(e.target.id);
// 	});
// 	$('.filemanager').appendChild(btn);
// }

let isEditorSet = false;

// function setTarget(id) {
// 	target = obj_array.find(e => {
// 		return e.uuid === id;
// 	});
// 	if (!isEditorSet) {
// 		isEditorSet = !isEditorSet;
// 		objEditor();
// 	}
// }

gui1_f3 = gui1.addFolder('Transformation');

function objEditor() {
	let options = {
		x: target.position.x,
		y: target.position.y,
		z: target.position.z,
		rotateX: target.rotation.x,
		rotateY: target.rotation.y,
		rotateZ: target.rotation.z,
		center() {
			centerObj();
		},
		scale: 1
	};

	// gui1_f3.add(options, 'z', -10, 10).onChange(() => {
	// 	disableControls();
	// 	target.position.z = options.z;
	// });
	// gui1_f3.add(options, 'x', -10, 10).onChange(() => {
	// 	disableControls();
	// 	target.position.x = options.x;
	// });
	// gui1_f3.add(options, 'y', -10, 10).onChange(() => {
	// 	disableControls();
	// 	render_mode.Planar
	// 		? (target.position.y = 0)
	// 		: (target.position.y = options.position);
	// });

	// gui1_f3.add(options, 'rotateX').onChange(() => {
	// 	disableControls();
	// 	target.rotation.x = options.rotateX;
	// });
	// gui1_f3.add(options, 'rotateY').onChange(() => {
	// 	disableControls();
	// 	target.rotation.y = options.rotateY;
	// });
	// gui1_f3.add(options, 'rotateZ').onChange(() => {
	// 	disableControls();
	// 	target.rotation.z = options.rotateZ;
	// });
	gui1_f3.add(options, 'center');
	gui1_f3.add(options, 'scale', 0.5, 5).onChange(() => {
		disableControls();
		scaleObj(target, options.scale);
	});
	gui1_f3.open();
}

function disableControls() {
	controls.enabled = false;
}

renderer.domElement.addEventListener('mouseover', () => {
	controls.enabled = true;
});

/***********
	Planer and axial functionality 
***********/

//Planar class for now only responsible for adding and removing plane from scene
class Planar {
	constructor(scene) {
		this.scene = scene;
		this.planeGeometry = new THREE.PlaneBufferGeometry(1000, 1000);
		this.planeMaterial = new THREE.ShadowMaterial({ opacity: 1 });
		this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
		this.helper = new THREE.GridHelper(1000, 100);
	}

	add() {
		this.planeGeometry.rotateX(-Math.PI / 2);
		this.scene.add(this.plane);
		this.helper.material.opacity = 0.5;
		this.helper.material.transparent = true;
		this.scene.add(this.helper);
	}

	remove() {
		this.scene.remove(this.plane);
		this.scene.remove(this.helper);
	}
}

//same a planer
class Axial {
	constructor(scene) {
		this.scene = scene;
		this.axesHelper = new THREE.AxesHelper(500);
		// red x
		// green y
	}
	add() {
		this.scene.add(this.axesHelper);
	}
	remove() {
		this.scene.remove(this.axesHelper);
	}
}

//just for lighting in the scene nothing to do whith the rendering
class CustomLight {
	constructor(scene) {
		this.scene = scene;
		this.keyLight = new THREE.DirectionalLight(
			new THREE.Color('hsl(30, 100%, 75%)'),
			1.0
		);
		this.fillLight = new THREE.DirectionalLight(
			new THREE.Color('hsl(240, 100%, 75%)'),
			0.75
		);
		this.backLight = new THREE.DirectionalLight(0xffffff, 1.0);
	}

	add() {
		this.keyLight.position.set(-100, 0, 100);
		this.fillLight.position.set(100, 0, 100);
		this.backLight.position.set(100, 0, -100).normalize();
		this.scene.add(this.keyLight);
		this.scene.add(this.fillLight);
		this.scene.add(this.backLight);
	}

	remove() {
		this.scene.remove(this.keyLight);
		this.scene.remove(this.fillLight);
		this.scene.remove(this.backLight);
	}
}

//class responsible for manipulation of single item selected in the scene
class Target {
	constructor() {
		this.isTargetSet = false;
		this.obj;
		this.Selectedcolor = 0x32de2e;
		this.objColor;
	}

	set(obj) {
		this.obj = obj;
		this.objColor = obj.material.color.getHex();
		this.addColor();
		this.isTargetSet = true;
	}

	remove() {
		this.obj.material.color.set(this.objColor);
	}

	addColor() {
		this.obj.material.color.set(this.Selectedcolor);
	}

	centerObj() {
		this.obj.position.x = 0;
		this.obj.position.y = 0;
		this.obj.position.z = 0;
	}
}

let axial = new Axial(scene);
let planer = new Planar(scene);
let customLight = new CustomLight(scene);
let target = new Target();

//changing every obj y pos to 0
function changeToPlaner() {
	obj_array.forEach(e => {
		e.position.y = 0;
	});
}
// changing every obj y pos to 0
function changeToAxial() {
	obj_array.forEach(e => {
		// e.position.y = 0;
		e.position.x = 0;
		e.position.z = 0;
	});
}

//scaling the obj
function scaleObj(obj, scaleUnit) {
	let x = scaleUnit;
	obj.scale.set(x, x, x);
}

/***********
	dragControls 
	-- for drag movment of the obj 
***********/
let dragControls = new THREE.DragControls(
	obj_array, // our main array
	camera,
	renderer.domElement
);
dragControls.addEventListener('dragstart', function(event) {
	controls.enabled = false;
});
dragControls.addEventListener('dragend', function(event) {
	controls.enabled = true;
});
//init disabling dragControls
dragControls.enabled = false;

//helper arrow in the scene for direction
function addHelpArrow() {
	let dir = new THREE.Vector3(1, 2, 0);
	dir.normalize();
	let origin = new THREE.Vector3(0, 0, 0);
	let length = 1;
	let hex = 0xffff00;
	let arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
	scene.add(arrowHelper);
}

//creating gui using lib dat.gui
//https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
function createGui() {
	let gui1_f1 = gui1.addFolder('Planar/Axial');
	gui1_f1
		.add(render_mode, 'Planar')
		.onChange(() => (render_mode.Planar ? planer.add() : planer.remove()));

	gui1_f1
		.add(render_mode, 'Axial')
		.onChange(() => (render_mode.Axial ? axial.add() : axial.remove()));

	let gui1_f2 = gui1.addFolder('Fuction');

	gui1_f2
		.add(render_mode, 'addLightToScene')
		.onChange(
			() =>
				render_mode.addLightToScene ? customLight.add() : customLight.remove()
		);

	gui1_f2
		.add(render_mode, 'DragControls')
		.onChange(
			() =>
				render_mode.DragControls
					? (dragControls.enabled = true)
					: (dragControls.enabled = false)
		);

	gui1_f1.open();
}
createGui();

/***********
	-- raycasterRenderer() is inside the render function
	-- raycasterRenderer is for selecting and highlighting a obj
	CHANGES
	-- target is now a class 
***********/

function raycasterRenderer() {
	raycaster.setFromCamera(mouse, camera);
	let intersects = raycaster.intersectObjects(obj_array);

	if (intersects.length > 0) {
		document.addEventListener('click', () => {
			if (!target.isTargetSet) {
				target.set(intersects[0].object);
			} else {
				if (intersects[0].object.uuid !== target.obj.uuid) {
					target.remove();
					target.set(intersects[0].object);
				}
			}
		});
		/***********
			start from here----
		***********/
		// if (!isEditorSet) {
		// 	isEditorSet = !isEditorSet;
		// 	objEditor();
		// }
	}
}
