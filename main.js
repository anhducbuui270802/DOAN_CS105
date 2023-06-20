var activeControl = false,
  hasLight = false,
  alpha = 0,
  playMusic = false;

function init() {
  var scene = new THREE.Scene();

  var geometry, material, mesh;
  material = new THREE.MeshBasicMaterial({ color: "#ffffff" });

  var gridHelper = new THREE.GridHelper(150, 30, "#fff", "#fff");
  gridHelper.position.y = -0.1;
  scene.add(gridHelper);

  var pointLight = getPointLight(0xffffff, 10, 100);
  var sphere = getSphere(0.3);

  var gui = new dat.GUI();
  gui.domElement.id = "GUI";

  $(".geometry").click(function () {
    if (activeControl) {
      $(".controls-btn.active").removeClass("active");
      transformControls.detach(mesh);
    }

    var geometryName = $(this).text();

    switch (geometryName) {
      case "Box":
        geometry = new THREE.BoxGeometry(5, 5, 5);
        break;
      case "Cylinder Geometry":
        geometry = new THREE.CylinderGeometry(2, 2, 5, 5);
        break;
      case "Cylinder":
        geometry = new THREE.CylinderGeometry(3, 3, 8, 32);
        break;
      case "Cone":
        geometry = new THREE.ConeGeometry(3, 8, 32);
        break;
      case "Sphere":
        geometry = new THREE.SphereGeometry(3);
        break;
      case "Torus":
        geometry = new THREE.TorusGeometry(4, 2, 16, 100);
        break;
      case "Teapot":
        geometry = new THREE.TeapotGeometry(4, 10);
        break;
    }

    mesh = new THREE.Mesh(geometry, material);
    var height = new THREE.Vector3();
    mesh.geometry.computeBoundingBox();
    mesh.geometry.boundingBox.getSize(height);
    var teapotHeight = height.y;
    mesh.position.y = teapotHeight / 2;
    scene.remove(scene.getObjectByName("geometry"));
    mesh.name = "geometry";
    mesh.castShadow = true;
    scene.add(mesh);
  });

  $(".surface").click(function () {
    if (activeControl) {
      $(".controls-btn.active").removeClass("active");
      transformControls.detach(mesh);
    }

    var loader = new THREE.TextureLoader();
    scene.remove(scene.getObjectByName("geometry"));

    var materialName = $(this).text(),
      materialColor = material.color;

    switch (materialName) {
      case "Point":
        material = new THREE.PointsMaterial({
          color: materialColor,
          size: 0.2,
        });
        mesh = new THREE.Points(geometry, material);
        break;
      case "Line":
        material = new THREE.LineBasicMaterial({ color: materialColor });
        mesh = new THREE.Line(geometry, material);
        break;
      case "Solid":
        material = new THREE.MeshBasicMaterial({ color: 0x6d6d6d });
        mesh = new THREE.Mesh(geometry, material);
        break;
      case "Texture Brick":
        material = new THREE.MeshBasicMaterial({
          map: loader.load("./assets/textures/brick.jpg"),
        });
        mesh = new THREE.Mesh(geometry, material);
        break;
      case "Texture Concrete":
        material = new THREE.MeshBasicMaterial({
          map: loader.load("./assets/textures/concrete.jpg"),
        });
        mesh = new THREE.Mesh(geometry, material);
        break;
    }
    var height = new THREE.Vector3();
    mesh.geometry.computeBoundingBox();
    mesh.geometry.boundingBox.getSize(height);
    var geometryHeight = height.y;
    mesh.position.y = geometryHeight / 2;
    mesh.name = "geometry";
    mesh.castShadow = true;
    scene.add(mesh);
  });

  //Handle event click on button controls
  $(".controls-btn").click(function () {
    if ($(this).hasClass("active")) {
      $(this).removeClass("active");
      transformControls.detach(mesh);
      activeControl = false;
    } else {
      activeControl = true;
      const controlType = $(this).attr("type");
      switch (controlType) {
        case "translate":
          transformControls.attach(mesh);
          transformControls.setMode("translate");
          break;
        case "rotate":
          transformControls.attach(mesh);
          transformControls.setMode("rotate");
          break;
        case "scale":
          transformControls.attach(mesh);
          transformControls.setMode("scale");
          break;
        case "move-light":
          transformControls.attach(pointLight);
          transformControls.setMode("translate");
          break;
      }

      $(".controls-btn.active").removeClass("active");
      $(this).addClass("active");

      scene.add(transformControls);
    }
  });

  //Handle event on click light
  $(".light").click(function () {
    if ($(this).text() == "Point Light" && hasLight === false) {
      hasLight = true;
      scene.add(pointLight);
      pointLight.add(sphere);

      var plane = getPlane(150);
      gridHelper.add(plane);

      //   var pointLightHelper = getPointLightHelper(pointLight);
      scene.add(pointLightHelper);

      pointLightColorGUI = addColorGUI(
        plane.material,
        "Sphere Color",
        { color: 0x15151e },
        colorGUI
      );

      planeColorGUI = addColorGUI(
        plane.material,
        "Plane Color",
        { color: 0x15151e },
        colorGUI
      );
    } else {
      hasLight = false;

      scene.remove(scene.getObjectByName("PointLight"));
      //   scene.remove(scene.getObjectByName("PointLightHelper"));
      gridHelper.remove(scene.getObjectByName("Plane"));

      colorGUI.remove(planeColorGUI);
      colorGUI.remove(pointLightColorGUI);
    }
  });

  $(".animation").click(function () {
    var $nameAnimation = $(this).text();
    if ($(".animation.active").hasClass("active")) {
      $(".animation.active").removeClass("active");
    }
    switch ($nameAnimation) {
      case "Rotate Around":
        $(this).addClass("active");
        break;
      case "Rotate 360":
        $(this).addClass("active");
        break;
      case "Up Down 360":
        $(this).addClass("active");
        break;
      case "Around 360":
        $(this).addClass("active");
        break;
      case "Default":
        $(this).addClass("active");
        break;
      case "Remove Animation":
        break;
    }
  });

  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    500
  );
  camera.position.set(10, 7, 20);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.updateProjectionMatrix();
  function updateCamera() {
    camera.updateProjectionMatrix();
  }

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight - 46);
  renderer.setClearColor("#15151e");
  renderer.shadowMap.enabled = true; // ShadowMap (Đổ bóng).
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Type of shadowMap.
  document.getElementById("WebGL").appendChild(renderer.domElement);
  renderer.render(scene, camera);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  var transformControls = new THREE.TransformControls(
    camera,
    renderer.domElement
  );
  transformControls.size = 0.5;
  transformControls.addEventListener("dragging-changed", (event) => {
    controls.enabled = !event.value;
  });

  var cameraGUI = gui.addFolder("Camera");
  cameraGUI.add(camera, "fov", 0, 175).name("FOV").onChange(updateCamera);
  cameraGUI.add(camera, "near", 1, 50, 1).name("Near").onChange(updateCamera);
  cameraGUI.add(camera, "far", 0, 1000, 10).name("Far").onChange(updateCamera);
  cameraGUI.open();

  var planeColorGUI;
  var pointLightColorGUI;
  var colorGUI = gui.addFolder("Color");
  addColorGUI(material, "Geometry Color", { color: 0xffffff }, colorGUI);
  colorGUI.open();

  var lightGUI = gui.addFolder("Light Control");
  lightGUI.add(pointLight, "intensity", 1, 20, 1).name("Intensity");
  lightGUI.add(pointLight, "distance", 1, 200, 1).name("Distance");
  addColorGUI(pointLight, "Light Color", { color: 0xffffff }, lightGUI);
  lightGUI.open();

  update(renderer, scene, camera, controls);
}

function update(renderer, scene, camera, controls) {
  renderer.render(scene, camera);
  controls.update();

  var geometry = scene.getObjectByName("geometry");
  var name = $(".animation.active").text();
  switch (name) {
    case "Rotate Around":
      geometry.rotation.y = Date.now() * 0.0005;
      break;
    case "Rotate 360":
      geometry.rotation.x = Date.now() * 0.0005;
      geometry.rotation.y = Date.now() * 0.002;
      geometry.rotation.z = Date.now() * 0.001;
      break;
    case "Up Down 360":
      geometry.position.y = (Math.sin(Date.now() * 0.002) + 1) * 10;
      geometry.rotation.y = Date.now() * 0.002;
      geometry.rotation.z = Date.now() * 0.001;
      break;
    case "Around 360":
      alpha = Math.PI * 0.005 + alpha;
      geometry.position.x = Math.sin(alpha) * 5;
      geometry.position.z = Math.cos(alpha) * 5;
      geometry.rotation.y = Date.now() * 0.002;
      geometry.rotation.z = Date.now() * 0.001;
      if (alpha == 2 * Math.PI) alpha = 0;
      break;
    case "Default":
      geometry.rotation.x = 0;
      geometry.rotation.y = 0;
      geometry.rotation.z = 0;
      geometry.position.x = 0;
      geometry.position.y = 0;
      geometry.position.z = 0;
      break;
  }

  requestAnimationFrame(function () {
    update(renderer, scene, camera, controls);
  });
}

function getPlane(size) {
  var geometry = new THREE.PlaneGeometry(size, size);
  var material = new THREE.MeshStandardMaterial({
    color: "#000000",
    side: THREE.DoubleSide,
    shininess: 10,
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.rotation.x = Math.PI / 2;
  mesh.name = "Plane";

  return mesh;
}

function getSphere(size) {
  var geometry = new THREE.SphereGeometry(size, 24, 24);
  var material = new THREE.MeshBasicMaterial({
    color: "rgb(255, 255, 255)",
    // color: objColorGUI,
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.name = "Sphere";
  return mesh;
}

function getPointLight(color, intensity, distance) {
  var pointLight = new THREE.PointLight(color, intensity, distance);
  pointLight.position.set(10, 10, 10);
  pointLight.castShadow = true;
  pointLight.name = "PointLight";

  return pointLight;
}

// function getPointLightHelper(pointLight) {
//   const sphereSize = 1;
//   const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
//   pointLightHelper.name = "PointLightHelper";

//   return pointLightHelper;
// }

function addColorGUI(obj, name, params, folder) {
  var objColorGUI = folder
    .addColor(params, "color")
    .name(name)
    .onChange(function () {
      obj.color.set(params.color);
    });

  return objColorGUI;
}

init();
