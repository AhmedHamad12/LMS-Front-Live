import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import * as THREE from "three";
import { Hourglass, LogOut } from 'lucide-react';

function Waiting() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const cookies = new Cookies();

  // Three.js background effect
  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    const createStarfield = (count, size, color) => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i*3+0] = (Math.random() - 0.5) * 200;
            positions[i*3+1] = (Math.random() - 0.5) * 200;
            positions[i*3+2] = (Math.random() - 0.5) * 200;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ size, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 });
        return new THREE.Points(geometry, material);
    };
    const stars = [createStarfield(8000, 0.05, 0x888888), createStarfield(5000, 0.1, 0xbbbbbb)];
    stars.forEach(s => scene.add(s));
    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        stars[0].rotation.y = elapsedTime * 0.01;
        stars[1].rotation.y = elapsedTime * 0.02;
        renderer.render(scene, camera);
    };
    animate();
  }, []);
  
  const handleLogout = () => {
    cookies.remove('token', { path: '/' });
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <canvas ref={canvasRef} className="fixed top-0 left-0 -z-10 h-full w-full bg-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A19] via-transparent to-[#0A0A19] opacity-80" />
        
        <div className="max-w-lg w-full text-center bg-slate-900/50 backdrop-blur-lg border border-cyan-400/20 rounded-2xl p-8 sm:p-12 shadow-2xl shadow-cyan-500/10 z-10">
            
            <div className="flex justify-center mb-6">
                <div className="rounded-full bg-cyan-500/10 p-5 border-2 border-cyan-500/30">
                    <Hourglass className="h-16 w-16 text-cyan-400 animate-[spin_3s_linear_infinite]" />
                </div>
            </div>

            <h1 className="text-4xl font-black text-white mb-4" style={{ textShadow: "0 0 10px rgba(0, 191, 255, 0.5)" }}>
                الحساب قيد المراجعة
            </h1>
            
            <p className="text-lg text-slate-300 mb-8">
                شكرًا لتسجيلك! يقوم فريقنا بمراجعة طلب انضمامك حاليًا. سيصلك إشعار عبر البريد الإلكتروني فور تفعيل الحساب.
            </p>

            <div className="pt-8 border-t border-slate-700/50 space-y-4">
                <p className="text-sm text-slate-400">
                    هل لديك استفسار؟ تواصل مع فريق الدعم: 
                    <span className="block font-bold text-cyan-400 mt-1 tracking-wider">
                        01094870104
                    </span>
                </p>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-700/80 px-5 py-3 text-base font-bold text-white transition-colors hover:bg-slate-600/80"
                >
                    <LogOut size={20}/>
                    تسجيل الخروج والعودة
                </button>
            </div>
        </div>
    </div>
  );
}

export default Waiting;