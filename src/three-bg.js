import * as THREE from 'three';

export function initThreeBackground() {
  const canvas = document.querySelector('#bg-canvas');
  if (!canvas) return;

  // 1. Scene Setup
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50; // Pull camera back so we can see a wide field

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true, // Transparent background so the CSS mesh shows through
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 2. Particle Geometry Setup
  const particleCount = 200; // Adjust for density vs performance
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  // Distribute particles randomly in a 3D box
  const range = 150;
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * range;     // x
    positions[i + 1] = (Math.random() - 0.5) * range; // y
    positions[i + 2] = (Math.random() - 0.5) * range; // z

    // Assign a random velocity for slow drifting
    velocities.push({
      x: (Math.random() - 0.5) * 0.05,
      y: (Math.random() - 0.5) * 0.05,
      z: (Math.random() - 0.5) * 0.05
    });
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // 3. Materials
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.8,
    color: 0x8b5cf6, // Default violet-ish, will be overridden by theme sync
    transparent: true,
    opacity: 0.6,
  });

  const particles = new THREE.Points(particlesGeometry, particleMaterial);
  scene.add(particles);

  // 4. Lines (The Network)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x8b5cf6,
    transparent: true,
    opacity: 0.15
  });

  const linesGeometry = new THREE.BufferGeometry();
  const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
  scene.add(linesMesh);

  // 5. Mouse Interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    // Calculate normalized mouse coordinates (-1 to +1)
    mouseX = (event.clientX - windowHalfX) * 0.0005;
    mouseY = (event.clientY - windowHalfY) * 0.0005;
  });

  // 6. Theme Sync (Light/Dark mode colors)
  function syncTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const colorHex = isDark ? 0xa78bfa : 0x6366f1; // violet-400 vs indigo-500

    // Lower opacity to prevent UI clutter
    const baseOpacity = isDark ? 0.12 : 0.08;

    particleMaterial.color.setHex(colorHex);
    lineMaterial.color.setHex(colorHex);

    // Particles are slightly more visible than lines
    particleMaterial.opacity = baseOpacity + 0.1;
    lineMaterial.opacity = baseOpacity;
  }

  syncTheme();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        syncTheme();
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  // 7. Animation Loop
  const connectionDistance = 20;

  function animate() {
    requestAnimationFrame(animate);

    targetX = mouseX * 20;
    targetY = mouseY * 20;
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    const posAttribute = particlesGeometry.attributes.position;
    const currentPositions = posAttribute.array;
    const lineVertices = [];

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const v = velocities[i];

      currentPositions[idx] += v.x;
      currentPositions[idx + 1] += v.y;
      currentPositions[idx + 2] += v.z;

      const halfRange = range / 2;
      if (currentPositions[idx] > halfRange) currentPositions[idx] = -halfRange;
      if (currentPositions[idx] < -halfRange) currentPositions[idx] = halfRange;

      if (currentPositions[idx + 1] > halfRange) currentPositions[idx + 1] = -halfRange;
      if (currentPositions[idx + 1] < -halfRange) currentPositions[idx + 1] = halfRange;

      if (currentPositions[idx + 2] > halfRange) currentPositions[idx + 2] = -halfRange;
      if (currentPositions[idx + 2] < -halfRange) currentPositions[idx + 2] = halfRange;

      for (let j = i + 1; j < particleCount; j++) {
        const jIdx = j * 3;
        const dx = currentPositions[idx] - currentPositions[jIdx];
        const dy = currentPositions[idx + 1] - currentPositions[jIdx + 1];
        const dz = currentPositions[idx + 2] - currentPositions[jIdx + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < connectionDistance * connectionDistance) {
          lineVertices.push(
            currentPositions[idx], currentPositions[idx + 1], currentPositions[idx + 2],
            currentPositions[jIdx], currentPositions[jIdx + 1], currentPositions[jIdx + 2]
          );
        }
      }
    }

    posAttribute.needsUpdate = true;
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));

    scene.rotation.y += 0.001;
    scene.rotation.x += 0.0005;

    renderer.render(scene, camera);
  }

  animate();

  // 8. Handle Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
