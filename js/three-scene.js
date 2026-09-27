/**
 * MOHIT — 3D Hero Digital Sculpture Experience
 * Technology: Three.js (r128)
 * Theme: Black / White / Red Accent, High-Depth Cyber Sculptural Object
 */

(function () {
  'use strict';

  const container = document.getElementById('hero-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  // Scene State
  let scene, camera, renderer;
  let sculptureGroup, outerMesh, wireframeMesh, innerCore, particleSystem;
  let orbitalRing1, orbitalRing2;
  let pointLightRed, pointLightWhite, ambientLight;

  // Interaction State
  let targetRotationX = 0;
  let targetRotationY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;
  let scrollProgress = 0;

  // Configuration options
  const config = {
    isWireframeOnly: false,
    rotationSpeedMultiplier: 1.0,
    particlesCount: window.innerWidth < 768 ? 250 : 650
  };

  function initThree() {
    // 1. Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.035);

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8.5);

    // 3. Renderer setup
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) {
      console.warn("WebGL not supported, graceful fallback triggered.", e);
      return;
    }

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Lighting Design
    ambientLight = new THREE.AmbientLight(0x161616, 1.2);
    scene.add(ambientLight);

    // Dynamic Pulsing Red Light in the core
    pointLightRed = new THREE.PointLight(0xe10600, 3.5, 12, 1.8);
    pointLightRed.position.set(0, 0, 0);
    scene.add(pointLightRed);

    // Rim / Edge Specular White Light
    pointLightWhite = new THREE.PointLight(0xffffff, 2.2, 16, 2.0);
    pointLightWhite.position.set(4, 5, 4);
    scene.add(pointLightWhite);

    // Soft dark red fill light from underneath
    const fillLight = new THREE.PointLight(0x680000, 2.0, 10, 2);
    fillLight.position.set(-3, -4, -2);
    scene.add(fillLight);

    // 5. Build Sculptural Geometry
    sculptureGroup = new THREE.Group();
    // Shift slightly to right on desktop to frame nicely alongside hero copy
    if (window.innerWidth > 1024) {
      sculptureGroup.position.set(1.5, 0.2, 0);
    } else {
      sculptureGroup.position.set(0, -0.4, 0);
    }
    scene.add(sculptureGroup);

    // A. Outer Geometric Shell (Icosahedron with multifaceted dark reflective material)
    const outerGeo = new THREE.IcosahedronGeometry(2.1, 1);
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a0a,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      reflectivity: 0.9,
      flatShading: true,
      transparent: true,
      opacity: 0.88
    });
    outerMesh = new THREE.Mesh(outerGeo, outerMat);
    sculptureGroup.add(outerMesh);

    // B. Wireframe Cage with vibrant red glow
    const wireframeGeo = new THREE.WireframeGeometry(outerGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0xff2a23,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.65
    });
    wireframeMesh = new THREE.LineSegments(wireframeGeo, wireframeMat);
    sculptureGroup.add(wireframeMesh);

    // C. Glowing Inner Cyber Core (Octahedron pulsating)
    const coreGeo = new THREE.OctahedronGeometry(1.05, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xe10600,
      emissive: 0x800000,
      emissiveIntensity: 1.4,
      metalness: 0.5,
      roughness: 0.2,
      flatShading: true
    });
    innerCore = new THREE.Mesh(coreGeo, coreMat);
    sculptureGroup.add(innerCore);

    // D. Elegant Orbital Ring 1
    const ringGeo1 = new THREE.TorusGeometry(3.0, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.7
    });
    orbitalRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    orbitalRing1.rotation.x = Math.PI / 3;
    sculptureGroup.add(orbitalRing1);

    // E. Orbital Ring 2 (Red Accent)
    const ringGeo2 = new THREE.TorusGeometry(3.4, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xe10600,
      transparent: true,
      opacity: 0.5
    });
    orbitalRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    orbitalRing2.rotation.y = Math.PI / 4;
    sculptureGroup.add(orbitalRing2);

    // 6. Particle Field (Data constellation dust)
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(config.particlesCount * 3);
    const particleColors = new Float32Array(config.particlesCount * 3);

    const cWhite = new THREE.Color(0xf5f5f5);
    const cRed = new THREE.Color(0xff2a23);
    const cDark = new THREE.Color(0x3a3a3a);

    for (let i = 0; i < config.particlesCount; i++) {
      const idx = i * 3;
      particlePositions[idx] = (Math.random() - 0.5) * 18;
      particlePositions[idx + 1] = (Math.random() - 0.5) * 16;
      particlePositions[idx + 2] = (Math.random() - 0.5) * 14;

      const rand = Math.random();
      const chosenColor = rand > 0.8 ? cRed : rand > 0.35 ? cDark : cWhite;
      particleColors[idx] = chosenColor.r;
      particleColors[idx + 1] = chosenColor.g;
      particleColors[idx + 2] = chosenColor.b;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // 7. Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('scroll', onScroll, { passive: true });

    setupControls();
    animate(0);
  }

  function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);

    if (window.innerWidth > 1024) {
      sculptureGroup.position.set(1.5, 0.2, 0);
    } else {
      sculptureGroup.position.set(0, -0.4, 0);
    }
  }

  function onMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
  }

  function onScroll() {
    const scrollY = window.scrollY;
    scrollProgress = Math.min(scrollY / window.innerHeight, 2);
  }

  function setupControls() {
    const wireframeBtn = document.getElementById('btn-toggle-wireframe');
    const speedBtn = document.getElementById('btn-toggle-speed');

    if (wireframeBtn) {
      wireframeBtn.addEventListener('click', function () {
        config.isWireframeOnly = !config.isWireframeOnly;
        outerMesh.visible = !config.isWireframeOnly;
        wireframeBtn.classList.toggle('active', config.isWireframeOnly);
      });
    }

    if (speedBtn) {
      speedBtn.addEventListener('click', function () {
        config.rotationSpeedMultiplier = config.rotationSpeedMultiplier === 1.0 ? 2.5 : 1.0;
        speedBtn.classList.toggle('active', config.rotationSpeedMultiplier > 1.0);
      });
    }
  }

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    const speedFactor = config.rotationSpeedMultiplier;

    // Smooth Parallax Lerp
    targetRotationY += (mouseX - targetRotationY) * 0.05;
    targetRotationX += (mouseY - targetRotationX) * 0.05;

    if (sculptureGroup) {
      // Intrinsic rotation
      sculptureGroup.rotation.y += 0.004 * speedFactor;
      sculptureGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.12 + targetRotationX * 0.8;
      sculptureGroup.rotation.z = Math.cos(elapsedTime * 0.4) * 0.08 + targetRotationY * 0.8;

      // Scroll-based transformation
      sculptureGroup.position.y = (window.innerWidth > 1024 ? 0.2 : -0.4) - scrollProgress * 1.8;
      sculptureGroup.scale.setScalar(Math.max(0.65, 1 - scrollProgress * 0.3));

      // Inner Core Counter-Rotation & Pulse
      if (innerCore) {
        innerCore.rotation.y -= 0.012 * speedFactor;
        innerCore.rotation.x += 0.008 * speedFactor;
        const pulse = 1 + Math.sin(elapsedTime * 2.8) * 0.12;
        innerCore.scale.set(pulse, pulse, pulse);
      }

      // Orbital Rings Rotation
      if (orbitalRing1) {
        orbitalRing1.rotation.z += 0.003 * speedFactor;
      }
      if (orbitalRing2) {
        orbitalRing2.rotation.x += 0.005 * speedFactor;
        orbitalRing2.rotation.y -= 0.004 * speedFactor;
      }

      // Core Light Pulse
      if (pointLightRed) {
        pointLightRed.intensity = 2.8 + Math.sin(elapsedTime * 3) * 1.4;
      }
    }

    // Particle drift
    if (particleSystem) {
      particleSystem.rotation.y = elapsedTime * 0.015;
    }

    renderer.render(scene, camera);
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }
})();
