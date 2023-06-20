// import * as THREE from "./node_modules/three/build/three.js";
// import { OrbitControls } from "./assets/lib/OrbitControls.js";
// import { TransformControls } from "./assets/lib/TransformControls.js";
// import { GLTFLoader } from "./assets/lib/GLTFLoader.js";

function geometry_func(activeControl) {
  if (activeControl) {
    $(".controls-btn.active").removeClass("active");
    transformControls.detach(mesh);
  }

  var geometryName = $(this).text();

  switch (geometryName) {
    case "Box":
      geometry = new THREE.BoxGeometry(5, 5, 5);
      break;
    case "Sphere":
      geometry = new THREE.SphereGeometry(3);
      break;
    case "Cone":
      geometry = new THREE.ConeGeometry(3, 8, 32);
      break;
    case "Cylinder":
      geometry = new THREE.CylinderGeometry(3, 3, 8, 32);
      break;
    case "Torus":
      geometry = new THREE.TorusGeometry(4, 2, 16, 100);
      break;
    case "Circle":
      geometry = new THREE.CircleGeometry(5, 32);
      break;
    case "Cylinder Geometry":
      geometry = new THREE.CylinderGeometry(2, 2, 5, 5);
      break;
    case "Teapot":
      geometry = new THREE.TeapotGeometry(4, 10);
      break;
  }
  mesh = new THREE.Mesh(geometry, material);

  scene.remove(scene.getObjectByName("geometry"));

  mesh.name = "geometry";
  mesh.castShadow = true;

  scene.add(mesh);
};

export { geometry_func };
