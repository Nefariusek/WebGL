let container;
let camera, scene, renderer, group;
let targetRotation = 0;
let targetRotationOnMouseDown = 0;
let mouseX = 0;
let mouseXOnMouseDown = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init = () => {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 100, 500);
  scene.add(camera);

  group = new THREE.Object3D();
  scene.add(group);

  let imgTexture = new THREE.TextureLoader().load(
    "img/texture.jpg",
    imgTexture => {
      imgTexture.repeat.set(1, 1);
      imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
      imgTexture.anisotropy = 16;
      imgTexture.needsUpdate = true;
    }
  );

  let shininess = 100,
    specular = 0x333333,
    bumpScale = 1,
    shading = THREE.SmoothShading; //#333333
  //console.log(imgTexture);
  let materials = [];
  materials.push(
    new THREE.MeshPhongMaterial({
      map: imgTexture,
      bumpMap: imgTexture,
      bumpScale: bumpScale,
      color: 0xffffff,
      specular: specular,
      shininess: shininess,
      flatShading: shading
    })
  );
  materials.push(
    new THREE.MeshPhongMaterial({
      map: imgTexture,
      color: 0x2b1d0e,
      specular: specular,
      shininess: shininess,
      flatShading: shading
    })
  ); //#654321
  materials.push(
    new THREE.MeshPhongMaterial({
      map: imgTexture,
      color: 0x2b1d0e,
      flatShading: shading
    })
  ); //#2b1d0e
  materials.push(
    new THREE.MeshPhongMaterial({
      map: imgTexture,
      color: 0xffffff,
      flatShading: shading
    })
  );
  //console.log(materials);

  let trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(10, 20, 350, 50, 1, false),
    materials[2]
  );
  group.add(trunk);
 
  const addBranch = (count, x, y, z) => {
    for (branches = 0; branches <= 1; branches++) {
      console.log(`x ${x} y ${y} z${z}`);
      branchMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(6, 6, 200 - count * 10, 50, 1, false),
        materials[2]
      );
      branchMesh.position.set(x, y, z);

      if (branches == 0) {
        branchMesh.rotation.set(-Math.PI / 2, 0, 0);
        for (number = 0; number < 21 - 1 * count; number++) {
          const sphGeometry = new THREE.SphereGeometry(5);
          sphMesh = new THREE.Mesh(sphGeometry, materials[0]);
          sphMesh.position.set(
            -100 + count * 5 + (x + 10 * number),
            y + 5,
            z + 10
          );
          group.add(sphMesh);
        }
      } else if (branches == 1) {
        branchMesh.rotation.set(0, 0, -Math.PI / 2);
        for (number = 0; number < 21 - 1* count; number++) {
          const sphGeometry = new THREE.SphereGeometry(5);
          sphMesh = new THREE.Mesh(sphGeometry, materials[0]);
          sphMesh.position.set(
            z + 10,
            y + 5,
            -100 + count * 5 + (x + 10 * number)
          );
          group.add(sphMesh);
        }
      }
      group.add(branchMesh);
    }
  };

  let iBranchCnt = 10;
  for (i1 = 0; i1 < iBranchCnt; i1++) {
    addBranch(i1, 0, i1 * 20, 0);
  }

  let groundTexture = new THREE.TextureLoader().load(
    "img/ground.jpg",
    undefined,
    (groundTexture) =>  {
      groundMaterial.map = groundTexture;
    }
  );
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(25, 25);
  groundTexture.anisotropy = 16;
  let groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x228c22,
    specular: 0x111111,
    map: groundTexture
  });

  let groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20000, 20000),
    groundMaterial
  );
  groundMesh.position.y = -150;
  groundMesh.rotation.x = -Math.PI / 2;
  group.add(groundMesh);

  let petalMats = [];
  const petalTexture = new THREE.TextureLoader().load("img/petal.png");
  const petalGeometry = new THREE.Geometry();
  for (i = 0; i < 10000; i++) {
    let vertex = new THREE.Vector3();
    vertex.x = Math.random() * 2000 - 1000;
    vertex.y = Math.random() * 2000 - 1000;
    vertex.z = Math.random() * 2000 - 1000;

    petalGeometry.vertices.push(vertex);
  }

  const states = [
    [[0.65, 1.0, 0.55], petalTexture, 10],
    [[0.70, 1.0, 0.6], petalTexture, 8],
    [[0.67, 1.0, 0.65], petalTexture, 6]
  ];

  for (i = 0; i < states.length; i++) {
    color = states[i][0];
    sprite = states[i][1];
    size = states[i][2];

    petalMats[i] = new THREE.PointsMaterial({
      size: size,
      map: sprite,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true
    });
    //console.log(color)
    petalMats[i].color.setHSL(color[0], color[1], color[2]);
    particles = new THREE.Points(petalGeometry, petalMats[i]);

    particles.rotation.x = Math.random() * 10;
    particles.rotation.y = Math.random() * 10;
    particles.rotation.z = Math.random() * 10;

    group.add(particles);
  }

  scene.add(new THREE.AmbientLight(0x404040)); //#404040  #222222 #111111

  particleLight = new THREE.Mesh(
    new THREE.SphereGeometry(40, 100, 100),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  particleLight.position.y = 250;
  group.add(particleLight);

  pointLight = new THREE.PointLight(0xffff99, 1, 1000); //#ffffaa #ffff99
  group.add(pointLight);

  pointLight.position = particleLight.position;

  //console.log("cos")
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setClearColor(scene.fog.color);

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  renderer.encoding = true;
  renderer.gammaOutput = true;
  renderer.physicallyBasedShading = true;
};

onWindowResize = () => {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
};

onDocumentMouseDown = e => {
  e.preventDefault();

  document.addEventListener("mousemove", onDocumentMouseMove, false);
  document.addEventListener("mouseup", onDocumentMouseUp, false);
  document.addEventListener("mouseout", onDocumentMouseOut, false);

  mouseXOnMouseDown = e.clientX - windowHalfX;
  targetRotationOnMouseDown = targetRotation;
};

onDocumentMouseMove = e => {
  mouseX = event.clientX - windowHalfX;
  targetRotation =
    targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
};

onDocumentMouseUp = e => {
  document.removeEventListener("mousemove", onDocumentMouseMove, false);
  document.removeEventListener("mouseup", onDocumentMouseUp, false);
  document.removeEventListener("mouseout", onDocumentMouseOut, false);
};

onDocumentMouseOut = e => {
  document.removeEventListener("mousemove", onDocumentMouseMove, false);
  document.removeEventListener("mouseup", onDocumentMouseUp, false);
  document.removeEventListener("mouseout", onDocumentMouseOut, false);
};

onDocumentTouchStart = e => {
  if (e.touches.length == 1) {
    e.preventDefault();

    mouseXOnMouseDown = e.touches[0].pageX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;
  }
};

onDocumentTouchMove = e => {
  if (e.touches.length == 1) {
    e.preventDefault();

    mouseX = e.touches[0].pageX - windowHalfX;
    targetRotation =
      targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
  }
};

animate = () => {
  requestAnimationFrame(animate);
  render();
};

render = () => {
  let timer = Date.now() * 0.0001;

  group.rotation.y += (targetRotation - group.rotation.y) * 0.01;

  particleLight.position.x = Math.sin(timer * 7) * 300;
  particleLight.position.z = Math.cos(timer * 3) * 300;

  //camera.position.x = Math.cos(timer) * 1000;
  //camera.position.z = Math.sin(timer) * 500;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
};

document.addEventListener("mousedown", onDocumentMouseDown, false);
document.addEventListener("touchstart", onDocumentTouchStart, false);
document.addEventListener("touchmove", onDocumentTouchMove, false);
window.addEventListener("resize", onWindowResize, false);

init();
animate();
