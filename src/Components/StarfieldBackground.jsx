import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// استخدام React.memo لتحسين الأداء ومنع إعادة التصيير غير الضرورية
const StarfieldBackground = React.memo(({ mainContentRef }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        // التحقق من وجود canvas و mainContentRef قبل بدء أي شيء
        if (!canvasRef.current || !mainContentRef || !mainContentRef.current) {
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

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
                size,
                color,
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
        
        const clock = new THREE.Clock();
        let animationFrameId;

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();
            starsFar.rotation.y = elapsedTime * 0.01;
            starsMid.rotation.y = elapsedTime * 0.02;
            starsClose.rotation.y = elapsedTime * 0.03;
            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        
        const handleScroll = () => {
            // التحقق مرة أخرى داخل دالة السكرول
            if (!mainContentRef.current) return;
            const scrollY = mainContentRef.current.scrollTop;
            const docHeight = mainContentRef.current.scrollHeight - mainContentRef.current.clientHeight;
            const scrollPercent = docHeight > 0 ? scrollY / docHeight : 0;
            camera.position.z = 5 - scrollPercent * 10;
        };

        window.addEventListener("resize", handleResize);
        const mainContentElement = mainContentRef.current;
        mainContentElement.addEventListener("scroll", handleScroll);

        // Cleanup function to remove listeners and dispose of resources
        return () => {
            window.removeEventListener("resize", handleResize);
            if (mainContentElement) {
                mainContentElement.removeEventListener("scroll", handleScroll);
            }
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
        };
        
    // إضافة mainContentRef كـ dependency للـ useEffect
    }, [mainContentRef]);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 -z-10 h-full w-full bg-black" />;
});

export default StarfieldBackground;