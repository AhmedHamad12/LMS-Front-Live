import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // --- Three.js Background Animation Script ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // --- Starfield Creation ---
    const createStarfield = (count, size, color) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        size: size,
        color: color,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.7,
      });
      const starfield = new THREE.Points(geometry, material);
      scene.add(starfield);
      return starfield;
    };

    const starsFar = createStarfield(8000, 0.05, 0x888888);
    const starsMid = createStarfield(5000, 0.1, 0xbbbbbb);
    const starsClose = createStarfield(1500, 0.15, 0xffffff);

    // --- Scroll-based Animation ---
    const mainContent = document.getElementById('main-content');
    function moveCameraAndStars() {
      if (!mainContent) return;
      const scrollY = mainContent.scrollTop;
      const docHeight = mainContent.scrollHeight - mainContent.clientHeight;
      const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
      camera.position.z = 5 - scrollPercent * 10;
    }
    if (mainContent) {
      mainContent.addEventListener('scroll', moveCameraAndStars);
    }
    moveCameraAndStars();

    // --- General Animation Loop ---
    const clock = new THREE.Clock();
    let animationId;
    function animate() {
      const elapsedTime = clock.getElapsedTime();
      starsFar.rotation.y = elapsedTime * 0.01;
      starsMid.rotation.y = elapsedTime * 0.02;
      starsClose.rotation.y = elapsedTime * 0.03;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }

    // --- Handle window resize ---
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    }
    window.addEventListener('resize', handleResize);

    animate();

    // Cleanup
    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', moveCameraAndStars);
      }
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      // Dispose geometries/materials
      [starsFar, starsMid, starsClose].forEach(starfield => {
        starfield.geometry.dispose();
        starfield.material.dispose();
      });
    };
  }, []);

  return (
    <canvas
      id="bg-canvas"
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}
    />
  );
};

export default BackgroundAnimation;