import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
// import * as Xbot from "./src/model1.js"

var activeControl = false,
  hasLight = false,
  alpha = 0,
  playMusic = false;

function init() {
  var scene = new THREE.Scene();

  var geometry, material, mesh;
  material = new THREE.MeshPhysicalMaterial({ color: "rgb(200, 200, 200)" });

  var plane = getPlane(150);
  plane.position.y = -0.1;
  scene.add(plane);

  var sunLinght = getDirectionalLight(1);
  sunLinght.name = "SunLinght";
  scene.add(sunLinght);

  var pointLight = getPointLight(0xffffff, 2, 100);
  var spotLight = getSpotLight(2);
  var directionalLight = getDirectionalLight(2);
  var ambientLight = getAmbientLight(2);  

  var sphere = getSphere(0.3);

  var gui = new dat.GUI();
  gui.domElement.id = "GUI";

  $(".plane").click(function () {
    if (activeControl) {
      $(".controls-btn.active").removeClass("active");
      transformControls.detach(mesh);
    }

    var planeName = $(this).text();
    scene.remove(scene.getObjectByName("Plane"));
    switch (planeName) {
      case "Default":
        plane = getPlane(150);
        plane.name = "Plane";
        break;
      case "GridHelper":
        plane = new THREE.GridHelper(150, 30, "#fff", "#fff");
        plane.name = "Plane";
        break;
      case "None":
        break;
    }
    plane.position.y = -0.1;
    scene.add(plane);
  });

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
      case "Remove Geometry":
        scene.remove(scene.getObjectByName("geometry"));
        return;
        break;
    }

    mesh = new THREE.Mesh(geometry, material);
    var height = new THREE.Vector3();
    mesh.geometry.computeBoundingBox();
    mesh.geometry.boundingBox.getSize(height);
    var geometryHeight = height.y;
    mesh.position.y = geometryHeight / 2;
    scene.remove(scene.getObjectByName("geometry"));
    mesh.name = "geometry";
    mesh.castShadow = true;
    scene.add(mesh);
  });

  $(".model").click(function () {
    if (activeControl) {
      $(".controls-btn.active").removeClass("active");
      transformControls.detach(mesh);
    }

    var modelName = $(this).text();

    const loader = new GLTFLoader();


    switch (modelName) {
      case "Model 1":
        loader.load(
          "./assets/module/Soldier.glb",
          function (gltf) {
            const model = gltf.scene;
            gltf.scene.scale.set(5, 5, 5);
            model.traverse(function (child) {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.side = THREE.FrontSide;
                child.material.shadowSide = THREE.BackSide;
                child.material.needsUpdate = true;
              }
            });

            scene.add(model);
          },
          undefined,
          function (error) {
            console.error(error);
          }
        );
        break;
      case "Model 2":
        loader.load("../assets/module/Xbot.glb", function (gltf) {
          model = gltf.scene;
          scene.add(model);

          model.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
          });

          skeleton = new THREE.SkeletonHelper(model);
          skeleton.visible = false;
          scene.add(skeleton);

          // const animations = gltf.animations;
          // mixer = new THREE.AnimationMixer(model);

          // numAnimations = animations.length;

          // for (let i = 0; i !== numAnimations; ++i) {
          //   let clip = animations[i];
          //   const name = clip.name;

          //   if (baseActions[name]) {
          //     const action = mixer.clipAction(clip);
          //     activateAction(action);
          //     baseActions[name].action = action;
          //     allActions.push(action);
          //   } else if (additiveActions[name]) {
          //     // Make the clip additive and remove the reference frame

          //     THREE.AnimationUtils.makeClipAdditive(clip);

          //     if (clip.name.endsWith("_pose")) {
          //       clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
          //     }

          //     const action = mixer.clipAction(clip);
          //     activateAction(action);
          //     additiveActions[name].action = action;
          //     allActions.push(action);
          //   }
          // }

          // createPanel();

          // animate();
        });
        break;
    }
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
      case "Default":
        material = new THREE.MeshPhysicalMaterial({
          color: "rgb(200, 200, 200)",
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
          transformControls.attach(spotLight);
          transformControls.attach(directionalLight);
          transformControls.attach(ambientLight);
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
    scene.remove(scene.getObjectByName("Light"));
    if ($(this).text() == "Point Light" && hasLight === false) {
      hasLight = true;
      scene.add(pointLight);
      pointLight.add(sphere);

      var lightGUI = gui.addFolder("Light Control");
      lightGUI.add(pointLight, "intensity", 1, 20, 1).name("Intensity");
      lightGUI.add(pointLight, "distance", 1, 200, 1).name("Distance");
      pointLightColorGUI = addColorGUI(
        pointLight,
        "Light Color",
        { color: 0xffffff },
        lightGUI
      );
      lightGUI.open();
      const selectedColor = pointLightColorGUI.getValue();
      lightGUI.onChange(function () {
        sphere.material.color.set(selectedColor);
      });
    } else if ($(this).text() == "Spot Light" && hasLight === false) {
      hasLight = true;
      scene.add(spotLight);
      spotLight.add(sphere);
      var lightGUI = gui.addFolder("Light Control");
      lightGUI.add(spotLight, "intensity", 1, 20, 1).name("Intensity");
      lightGUI.add(spotLight, "distance", 1, 200, 1).name("Distance");
      spotLightColorGUI = addColorGUI(
        spotLight,
        "Light Color",
        { color: 0xffffff },
        lightGUI
      );
      lightGUI.open();
      const selectedColor = spotLightColorGUI.getValue();
      lightGUI.onChange(function () {
        sphere.material.color.set(selectedColor);
      });
    } else if ($(this).text() == "Directional" && hasLight === false) {
      hasLight = true;
      scene.add(directionalLight);
      directionalLight.position.set(10, 10, 10);
      directionalLight.add(sphere);
      var lightGUI = gui.addFolder("Light Control");
      lightGUI.add(directionalLight, "intensity", 1, 20, 1).name("Intensity");
      lightGUI.add(directionalLight, "distance", 1, 200, 1).name("Distance");
      pointLightColorGUI = addColorGUI(
        directionalLight,
        "Light Color",
        { color: 0xffffff },
        lightGUI
      );
      lightGUI.open();
      const selectedColor = pointLightColorGUI.getValue();
      lightGUI.onChange(function () {
        sphere.material.color.set(selectedColor);
      });
    } else if ($(this).text() == "Ambient" && hasLight === false) {
      hasLight = true;
      scene.add(ambientLight);
      ambientLight.position.set(10, 10, 10);
      ambientLight.add(sphere);
      var lightGUI = gui.addFolder("Light Control");
      lightGUI.add(ambientLight, "intensity", 1, 20, 1).name("Intensity");
      lightGUI.add(ambientLight, "distance", 1, 200, 1).name("Distance");
      pointLightColorGUI = addColorGUI(
        ambientLight,
        "Light Color",
        { color: 0xffffff },
        lightGUI
      );
      lightGUI.open();
      const selectedColor = pointLightColorGUI.getValue();
      lightGUI.onChange(function () {
        sphere.material.color.set(selectedColor);
      });
    } else {
      hasLight = false;
      gui.removeFolder("Color");
      gui.updateDisplay();
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

  var pointLightColorGUI;
  var colorGUI = gui.addFolder("Color");
  addColorGUI(material, "Geometry Color", { color: 0xffffff }, colorGUI);
  addColorGUI(plane.material, "Plane Color", { color: 0xffffff }, colorGUI);
  colorGUI.open();
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
  var material = new THREE.MeshPhysicalMaterial({
    color: "rgb(120, 120, 120)",
    side: THREE.DoubleSide,
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
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.name = "Sphere";
  return mesh;
}

function getPointLight(color, intensity, distance) {
  var pointLight = new THREE.PointLight(color, intensity, distance);
  pointLight.position.set(10, 10, 10);
  pointLight.castShadow = true;
  pointLight.name = "Light";
  return pointLight;
}

function getSpotLight(intensity) {
  var light = new THREE.SpotLight(0xffffff, intensity);
  light.position.set(10, 10, 10);
  light.castShadow = true;
  light.shadow.bias = 0.001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.name = "Light";
  return light;
}

function getDirectionalLight(intensity) {
  var light = new THREE.DirectionalLight(0xffffff, intensity);
  light.castShadow = true;
  light.shadow.bias = 0.001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.left = -5;
  light.shadow.camera.bottom = -5;
  light.shadow.camera.right = 5;
  light.shadow.camera.top = 5;
  light.name = "Light";
  return light;
}

function getAmbientLight(intensity) {
  var light = new THREE.AmbientLight("rgb(10,30,50)", intensity);
  light.name = "Light";
  return light;
}

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
