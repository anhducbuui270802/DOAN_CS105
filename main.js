import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "./node_modules/three/examples/jsm/loaders/FBXLoader.js";
import { GroundProjectedSkybox } from "three/addons/objects/GroundProjectedSkybox.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Vector3 } from "three";

const params = {
  height: 20,
  radius: 440,
};

var activeControl = false,
  hasLight = false,
  alpha = 0,
  playMusic = false;

let currentBaseAction = "idle";
const allActions = [];
const baseActions = {
  idle: { weight: 1 },
  walk: { weight: 0 },
  run: { weight: 0 },
};
const additiveActions = {
  sneak_pose: { weight: 0 },
  sad_pose: { weight: 0 },
  agree: { weight: 0 },
  headShake: { weight: 0 },
};
let guiSettings, numAnimations;
let model, skeleton, mixer, clock;
const crossFadeControls = [];

let scene, camera, renderer, Light;
let geometry, material, mesh;
let skybox;
var controls;

function init() {
  scene = new THREE.Scene();

  material = new THREE.MeshPhysicalMaterial({ color: "rgb(200, 200, 200)" });

  clock = new THREE.Clock();

  var plane = getPlane(150);
  plane.position.y = -0.01;
  scene.add(plane);

  scene.background = new THREE.Color("#1b2139");

  scene.fog = new THREE.Fog("#1b2139", 10, 100);

  var sunLight = getDirectionalLight(1);
  sunLight.position.set(7, 7, 7);
  sunLight.name = "SunLight";
  scene.add(sunLight);

  var sphere = getSphere(0.3);

  var gui = new dat.GUI();
  gui.domElement.id = "GUI";

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    100
  );
  camera.position.set(10, 7, 20);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.updateProjectionMatrix();
  function updateCamera() {
    camera.updateProjectionMatrix();
  }

  // PLANE
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
        break;
      case "Grid":
        plane = new THREE.GridHelper(150, 30, "#fff", "#fff");
        plane.name = "Plane";
        break;
      case "None":
        scene.remove(scene.getObjectByName("Plane"));
        break;
    }
    plane.position.y = -0.1;
    scene.add(plane);
  });

  // GEOMETRY
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

  // MODEL
  $(".model").click(function () {
    if (activeControl) {
      $(".controls-btn.active").removeClass("active");
      transformControls.detach(mesh);
    }

    var modelName = $(this).text();

    const loader_model2 = new FBXLoader();
    const loader = new GLTFLoader();

    scene.remove(scene.getObjectByName("model"));

    switch (modelName) {
      case "Model 1":
        loader.load("./assets/module/Soldier.glb", function (gltf) {
          model = gltf.scene;
          gltf.scene.scale.set(5, 5, 5);
          model.traverse(function (child) {
            if (child.isMesh) {
              skeleton;
              child.castShadow = true;
              child.receiveShadow = true;
              child.material.side = THREE.FrontSide;
              child.material.shadowSide = THREE.BackSide;
              child.material.needsUpdate = true;
            }
          });
          model.name = "model";
          skeleton = new THREE.SkeletonHelper(model);
          skeleton.visible = false;
          scene.add(skeleton);
          scene.add(model);

          const animations = gltf.animations;
          mixer = new THREE.AnimationMixer(model);

          numAnimations = animations.length;

          for (let i = 0; i !== numAnimations; ++i) {
            let clip = animations[i];
            const name = clip.name;

            if (baseActions[name]) {
              const action = mixer.clipAction(clip);
              activateAction(action);
              baseActions[name].action = action;
              allActions.push(action);
            } else if (additiveActions[name]) {
              // Make the clip additive and remove the reference frame

              THREE.AnimationUtils.makeClipAdditive(clip);

              if (clip.name.endsWith("_pose")) {
                clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
              }

              const action = mixer.clipAction(clip);
              activateAction(action);
              additiveActions[name].action = action;
              allActions.push(action);
            }
          }
          createPanel(gui);

          animate();

          update(renderer, scene, camera, controls);
        });
        break;
      case "Model 2":
        loader_model2.load(
          "./assets/module/SambaDancing.fbx",
          function (object) {
            mixer = new THREE.AnimationMixer(object);
            object.scale.set(0.05, 0.05, 0.05);
            object.name = "model";
            const action = mixer.clipAction(object.animations[0]);
            action.play();

            object.traverse(function (child) {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            scene.add(object);
          }
        );
        animate_model2();
        break;
      case "Model 3":
        loader_model2.load(
          "./assets/module/RumbaDancing.fbx",
          function (object) {
            mixer = new THREE.AnimationMixer(object);
            object.scale.set(0.05, 0.05, 0.05);
            object.name = "model";
            const action = mixer.clipAction(object.animations[0]);
            action.play();

            object.traverse(function (child) {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            scene.add(object);
          }
        );
        animate_model2();
        break;
      case "Model 4":
        loader.load("./assets/module/Xbot.glb", function (gltf) {
          model = gltf.scene;
          gltf.scene.scale.set(5, 5, 5);
          model.traverse(function (child) {
            if (child.isMesh) {
              skeleton;
              child.castShadow = true;
              child.receiveShadow = true;
              child.material.side = THREE.FrontSide;
              child.material.shadowSide = THREE.BackSide;
              child.material.needsUpdate = true;
            }
          });
          model.name = "model";
          skeleton = new THREE.SkeletonHelper(model);
          skeleton.visible = false;
          scene.add(skeleton);
          scene.add(model);

          const animations = gltf.animations;
          mixer = new THREE.AnimationMixer(model);

          numAnimations = animations.length;

          for (let i = 0; i !== numAnimations; ++i) {
            let clip = animations[i];
            const name = clip.name;

            if (baseActions[name]) {
              const action = mixer.clipAction(clip);
              activateAction(action);
              baseActions[name].action = action;
              allActions.push(action);
            } else if (additiveActions[name]) {
              // Make the clip additive and remove the reference frame

              THREE.AnimationUtils.makeClipAdditive(clip);

              if (clip.name.endsWith("_pose")) {
                clip = THREE.AnimationUtils.subclip(clip, clip.name, 2, 3, 30);
              }

              const action = mixer.clipAction(clip);
              activateAction(action);
              additiveActions[name].action = action;
              allActions.push(action);
            }
          }
          createPanel(gui);

          animate();

          update(renderer, scene, camera, controls);
        });
        break;
      case "Remove Model":
        break;
    }
  });

  // SURFACE & TEXTURE
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
        material = new THREE.MeshPhysicalMaterial({
          map: loader.load("./assets/textures/brick.jpg"),
        });
        mesh = new THREE.Mesh(geometry, material);
        break;
      case "Texture Earth":
        material = new THREE.MeshPhysicalMaterial({
          map: loader.load("./assets/textures/earth.jpg"),
        });
        mesh = new THREE.Mesh(geometry, material);
        break;
      case "Upload Texture":
        const fileInput = document.getElementById("texture-file-input");
        fileInput.addEventListener("change", handleTextureUpload);

        function handleTextureUpload(event) {
          const file = event.target.files[0];
          const reader = new FileReader();

          reader.addEventListener("load", function () {
            const imgUrl = reader.result;
            const texture = new THREE.TextureLoader().load(imgUrl);
            material.map = texture;
            material.needsUpdate = true;
          });
          reader.readAsDataURL(file);
        }

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

  // CONTROLS
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
          transformControls.attach(Light);
          transformControls.setMode("translate");

          break;
      }

      $(".controls-btn.active").removeClass("active");
      $(this).addClass("active");

      scene.add(transformControls);
    }
  });

  // LIGHT
  $(".light").click(function () {
    if (activeControl) {
      $(".controls-btn.active").removeClass("active");
      transformControls.detach(scene.getObjectByName("Light"));
    }
    scene.remove(scene.getObjectByName("Light"));

    // Point light
    if ($(this).text() == "Point Light") {
      Light = getPointLight(0xffffff, 2, 100);
      hasLight = true;
      scene.add(Light);
      Light.add(sphere);

      var lightGUI = gui.addFolder("Light Control");
      lightGUI.add(Light, "intensity", 1, 20, 1).name("Intensity");
      lightGUI.add(Light, "distance", 1, 200, 1).name("Distance");
      LightColorGUI = addColorGUI(
        Light,
        "Light Color",
        { color: 0xffffff },
        lightGUI
      );
      lightGUI.open();
      const selectedColor = LightColorGUI.getValue();
      lightGUI.onChange(function () {
        sphere.material.color.set(selectedColor);
      });
    }
    // Spot light
    else if ($(this).text() == "Spot Light") {
      Light = getSpotLight(2);
      hasLight = true;
      scene.add(Light);
      Light.add(sphere);
      var lightGUI = gui.addFolder("Light Control");
      lightGUI.add(Light, "intensity", 1, 20, 1).name("Intensity");
      lightGUI.add(Light, "distance", 1, 200, 1).name("Distance");
      LightColorGUI = addColorGUI(
        Light,
        "Light Color",
        { color: 0xffffff },
        lightGUI
      );
      lightGUI.open();
      const selectedColor = LightColorGUI.getValue();
      lightGUI.onChange(function () {
        sphere.material.color.set(selectedColor);
      });
    }
    // Directional light
    else if ($(this).text() == "Directional") {
      Light = getDirectionalLight(2);
      hasLight = true;
      scene.add(Light);
      Light.add(sphere);
      var lightGUI = gui.addFolder("Light Control");
      lightGUI.add(Light, "intensity", 1, 20, 1).name("Intensity");
      lightGUI.add(Light, "distance", 1, 200, 1).name("Distance");
      LightColorGUI = addColorGUI(
        Light,
        "Light Color",
        { color: 0xffffff },
        lightGUI
      );
      lightGUI.open();
      const selectedColor = LightColorGUI.getValue();
      lightGUI.onChange(function () {
        sphere.material.color.set(selectedColor);
      });
    }
    // Ambient light
    else if ($(this).text() == "Ambient") {
      Light = getAmbientLight(2);
      hasLight = true;
      scene.add(Light);
      Light.add(sphere);
      var lightGUI = gui.addFolder("Light Control");
      lightGUI.add(Light, "intensity", 1, 20, 1).name("Intensity");
      lightGUI.add(Light, "distance", 1, 200, 1).name("Distance");
      LightColorGUI = addColorGUI(
        Light,
        "Light Color",
        { color: 0xffffff },
        lightGUI
      );
      lightGUI.open();
      const selectedColor = LightColorGUI.getValue();
      lightGUI.onChange(function () {
        sphere.material.color.set(selectedColor);
      });
    }
    // Remove light
    else {
      hasLight = false;
      gui.removeFolder("Light Control");
      gui.updateDisplay();
    }
  });

  // ANIMATION
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

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight - 46);
  renderer.shadowMap.enabled = true; // ShadowMap (Đổ bóng).
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Type of shadowMap.
  document.getElementById("WebGL").appendChild(renderer.domElement);
  renderer.render(scene, camera);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 3, 0);
  controls.update();

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

  var LightColorGUI;
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
      var height = new THREE.Vector3();
      mesh.geometry.computeBoundingBox();
      mesh.geometry.boundingBox.getSize(height);
      var geometryHeight = height.y;
      geometry.rotation.x = 0;
      geometry.rotation.y = 0;
      geometry.rotation.z = 0;
      geometry.position.x = 0;
      geometry.position.y = geometryHeight / 2;
      geometry.position.z = 0;

      break;
  }

  requestAnimationFrame(function () {
    update(renderer, scene, camera, controls);
  });
}

function getPlane(size) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshPhysicalMaterial({
      color: 0x333333,

      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
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
  pointLight.position.set(7, 7, 7);
  pointLight.castShadow = true;
  pointLight.name = "Light";
  return pointLight;
}

function getSpotLight(intensity) {
  var light = new THREE.SpotLight(0xffffff, intensity);
  light.position.set(7, 7, 7);
  light.castShadow = true;
  light.name = "Light";
  return light;
}

function getDirectionalLight(intensity) {
  var light = new THREE.DirectionalLight(0xffffff, intensity);
  light.position.set(7, 7, 7);
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
  light.position.set(7, 7, 7);
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

function createPanel(gui) {
  // const gui = new GUI({ width: 310 });
  emptyGUI(gui);
  gui.width = 310;

  const folder1 = gui.addFolder("Base Actions");
  const folder2 = gui.addFolder("Additive Action Weights");
  const folder3 = gui.addFolder("General Speed");

  guiSettings = {
    "modify time scale": 1.0,
  };

  const baseNames = ["None", ...Object.keys(baseActions)];

  for (let i = 0, l = baseNames.length; i !== l; ++i) {
    const name = baseNames[i];
    const settings = baseActions[name];
    guiSettings[name] = function () {
      const currentSettings = baseActions[currentBaseAction];
      const currentAction = currentSettings ? currentSettings.action : null;
      const action = settings ? settings.action : null;

      if (currentAction !== action) {
        prepareCrossFade(currentAction, action, 0.35);
      }
    };

    crossFadeControls.push(folder1.add(guiSettings, name));
  }

  for (const name of Object.keys(additiveActions)) {
    const settings = additiveActions[name];

    guiSettings[name] = settings.weight;
    folder2
      .add(guiSettings, name, 0.0, 1.0, 0.01)
      .listen()
      .onChange(function (weight) {
        setWeight(settings.action, weight);
        settings.weight = weight;
      });
  }

  folder3
    .add(guiSettings, "modify time scale", 0.0, 1.5, 0.01)
    .onChange(modifyTimeScale);

  folder1.open();
  folder2.open();
  folder3.open();

  crossFadeControls.forEach(function (control) {
    control.setInactive = function () {
      control.domElement.classList.add("control-inactive");
    };

    control.setActive = function () {
      control.domElement.classList.remove("control-inactive");
    };

    const settings = baseActions[control.property];

    if (!settings || !settings.weight) {
      control.setInactive();
    }
  });
}

function activateAction(action) {
  const clip = action.getClip();
  const settings = baseActions[clip.name] || additiveActions[clip.name];
  setWeight(action, settings.weight);
  action.play();
}

function modifyTimeScale(speed) {
  mixer.timeScale = speed;
}

function prepareCrossFade(startAction, endAction, duration) {
  // If the current action is 'idle', execute the crossfade immediately;
  // else wait until the current action has finished its current loop

  if (currentBaseAction === "idle" || !startAction || !endAction) {
    executeCrossFade(startAction, endAction, duration);
  } else {
    synchronizeCrossFade(startAction, endAction, duration);
  }

  // Update control colors

  if (endAction) {
    const clip = endAction.getClip();
    currentBaseAction = clip.name;
  } else {
    currentBaseAction = "None";
  }

  crossFadeControls.forEach(function (control) {
    const name = control.property;

    if (name === currentBaseAction) {
      control.setActive();
    } else {
      control.setInactive();
    }
  });
}

function synchronizeCrossFade(startAction, endAction, duration) {
  mixer.addEventListener("loop", onLoopFinished);

  function onLoopFinished(event) {
    if (event.action === startAction) {
      mixer.removeEventListener("loop", onLoopFinished);

      executeCrossFade(startAction, endAction, duration);
    }
  }
}

function executeCrossFade(startAction, endAction, duration) {
  // Not only the start action, but also the end action must get a weight of 1 before fading
  // (concerning the start action this is already guaranteed in this place)

  if (endAction) {
    setWeight(endAction, 1);
    endAction.time = 0;

    if (startAction) {
      // Crossfade with warping

      startAction.crossFadeTo(endAction, duration, true);
    } else {
      // Fade in

      endAction.fadeIn(duration);
    }
  } else {
    // Fade out

    startAction.fadeOut(duration);
  }
}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))

function setWeight(action, weight) {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  // Render loop

  requestAnimationFrame(animate);

  for (let i = 0; i !== numAnimations; ++i) {
    const action = allActions[i];
    const clip = action.getClip();
    const settings = baseActions[clip.name] || additiveActions[clip.name];
    settings.weight = action.getEffectiveWeight();
  }

  // Get the time elapsed since the last frame, used for mixer update

  const mixerUpdateDelta = clock.getDelta();

  // Update the animation mixer, the stats gui, and render this frame

  mixer.update(mixerUpdateDelta);

  // stats.update();

  // renderer.render(scene, camera);
}

function animate_model2() {
  requestAnimationFrame(animate_model2);

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);

  // stats.update();
}

function emptyGUI(gui) {
  // Lấy danh sách tất cả các folder của dat.GUI()
  var folders = gui.__folders;

  // Lặp qua từng folder và xoá chúng
  for (var folderName in folders) {
    gui.removeFolder(folders[folderName]);
  }

  // Xoá các control cấp trên của dat.GUI()
  gui.__controllers.length = 0;

  // Xoá các control cấp dưới của dat.GUI()
  gui.__folders = {};
}

init();
