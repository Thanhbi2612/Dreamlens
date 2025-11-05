import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import './Layout.css';

const Layout = ({ children }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesOptions = useMemo(
    () => ({
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: 120,
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            area: 800,
          },
        },
        color: {
          value: ['#7C3AED', '#06B6D4', '#EC4899', '#8B5CF6'],
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: { min: 0.1, max: 0.8 },
          animation: {
            enable: true,
            speed: 1,
            sync: false,
          },
        },
        size: {
          value: { min: 1, max: 4 },
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: false,
          straight: false,
          outModes: {
            default: 'out',
          },
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200,
          },
        },
        links: {
          enable: true,
          distance: 150,
          color: '#8B5CF6',
          opacity: 0.2,
          width: 1,
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'repulse',
          },
          onClick: {
            enable: true,
            mode: 'push',
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
          push: {
            quantity: 4,
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  // Generate random positions for stars
  const generateStars = (count) => {
    const stars = [];
    const sizes = ['star-small', 'star-medium', 'star-large'];

    for (let i = 0; i < count; i++) {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const delay = Math.random() * 3;
      const duration = 2 + Math.random() * 3;

      stars.push(
        <div
          key={i}
          className={`star ${size}`}
          style={{
            top: `${top}%`,
            left: `${left}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      );
    }

    return stars;
  };

  return (
    <div className="layout-container">
      {/* Particles Tunnel Effect */}
      {init && (
        <Particles
          id="tsparticles"
          options={particlesOptions}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        />
      )}

      {/* Background gradient effects */}
      <div className="background-effects">
        <div className="gradient-blob gradient-blob-purple"></div>
        <div className="gradient-blob gradient-blob-aqua"></div>
        <div className="gradient-blob gradient-blob-pink"></div>
      </div>

      {/* Stars effect */}
      <div className="stars-container">
        {generateStars(50)}
      </div>

      {/* Main content */}
      <div className="layout-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
