import { useRef, useEffect, memo } from 'react';
import { useTheme } from '../context/ThemeContext';
import cloudSrc from '../assets/cloud.png';
import starSrc from '../assets/star.png';
import './AnimatedBackground.css';

/* ========= YULDUZLAR — JS animatsiya bilan ========= */
function Stars() {
    const containerRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        let id;

        // Yulduz elementlarini yaratish
        const stars = Array.from({ length: 55 }, () => {
            const img = document.createElement('img');
            img.src = starSrc;
            img.alt = '';
            const size = 10 + Math.random() * 22;
            Object.assign(img.style, {
                position: 'absolute',
                left: Math.random() * 95 + '%',
                top: Math.random() * 95 + '%',
                width: size + 'px',
                height: size + 'px',
                filter: 'drop-shadow(0 0 4px rgba(100,150,255,0.7))',
                pointerEvents: 'none',
            });
            el.appendChild(img);
            return {
                el: img,
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.04,
            };
        });

        function loop() {
            for (const s of stars) {
                s.phase += s.speed;
                const opacity = 0.2 + (Math.sin(s.phase) * 0.5 + 0.5) * 0.8;
                const scale = 0.6 + (Math.sin(s.phase) * 0.5 + 0.5) * 0.5;
                s.el.style.opacity = opacity;
                s.el.style.transform = `scale(${scale})`;
            }
            id = requestAnimationFrame(loop);
        }
        loop();

        return () => {
            cancelAnimationFrame(id);
            stars.forEach(s => s.el.remove());
        };
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }} />;
}

/* ========= BULUTLAR — JS animatsiya bilan ========= */
function Clouds() {
    const containerRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        let id;
        const W = window.innerWidth;

        const clouds = Array.from({ length: 12 }, () => {
            const img = document.createElement('img');
            img.src = cloudSrc;
            img.alt = '';
            const size = 100 + Math.random() * 220;
            const opacity = 0.45 + Math.random() * 0.45;
            Object.assign(img.style, {
                position: 'absolute',
                top: Math.random() * 90 + '%',
                width: size + 'px',
                height: 'auto',
                opacity: opacity,
                pointerEvents: 'none',
            });
            el.appendChild(img);
            return {
                el: img,
                x: Math.random() * (W + 300) - 300, // random boshlang'ich
                speed: 0.3 + Math.random() * 0.5,
                size,
            };
        });

        function loop() {
            const w = window.innerWidth;
            for (const c of clouds) {
                c.x += c.speed;
                if (c.x > w + 50) {
                    c.x = -c.size - 50;
                }
                c.el.style.transform = `translateX(${c.x}px)`;
            }
            id = requestAnimationFrame(loop);
        }
        loop();

        return () => {
            cancelAnimationFrame(id);
            clouds.forEach(c => c.el.remove());
        };
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }} />;
}

/* ========= MAIN ========= */
const AnimatedBackground = memo(function AnimatedBackground() {
    const { theme } = useTheme();
    return (
        <div className="animated-bg-container">
            {theme === 'dark' ? <Stars /> : <Clouds />}
        </div>
    );
});

export default AnimatedBackground;
