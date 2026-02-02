import React, { useEffect, useRef, useState } from 'react';
import { BonkRequest } from '../types';
import { VTSClient } from '../vts/client';
import { VTSState } from '../vts/types';

const Overlay: React.FC = () => {
  const [vtsStatus, setVtsStatus] = useState<VTSState>("Disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const vtsClientRef = useRef<VTSClient | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // VTube Studio Connection
  useEffect(() => {
    // Initialize VTS Client
    const vts = new VTSClient(8001, (state) => {
        setVtsStatus(state);
    });
    
    vts.connect();
    vtsClientRef.current = vts;

    return () => {
        vts.disconnect();
    };
  }, []);

  // Bonk Server Connection (From Main Process)
  useEffect(() => {
    // Connect to internal thrower server
    const connectBonkServer = () => {
        const ws = new WebSocket('ws://localhost:8080');
        
        ws.onopen = () => console.log("Connected to Bonk Server");
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as BonkRequest;
            if (data.type) {
                triggerBonk(data);
            }
          } catch(e) { console.error(e) }
        };

        ws.onclose = () => {
             setTimeout(connectBonkServer, 3000);
        };
        
        wsRef.current = ws;
    };

    connectBonkServer();
    return () => wsRef.current?.close();
  }, []);

  const triggerBonk = (data: BonkRequest) => {
    if (!containerRef.current) return;

    const count = data.type === 'barrage' ? (data.config.barrageCount || 10) : 1;
    
    for(let i=0; i<count; i++) {
        setTimeout(() => {
            spawnItem(data);
        }, i * (data.config.barrageFrequency * 1000));
    }
  };

  const spawnItem = (data: BonkRequest) => {
    if (!containerRef.current) return;

    const el = document.createElement('img');
    const item = data.items[Math.floor(Math.random() * data.items.length)];
    
    // Resolve Image Path
    // If it starts with http, use as is. otherwise assume it's in public folder relative path
    const isRemote = item.image.startsWith('http');
    el.src = isRemote ? item.image : item.image; // Vite/Electron serves public folder at root in dev
    
    el.style.position = 'absolute';
    el.style.width = '100px'; 
    el.style.height = '100px';
    el.style.objectFit = 'contain'; // Keep aspect ratio
    
    // Logic to determine start position
    const startX = data.config.physicsReverse ? window.innerWidth + 100 : -100;
    // Randomize start height slightly
    const startY = window.innerHeight - 100 - (Math.random() * 200); 
    
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    
    // Physics properties
    el.style.transition = `
        left ${data.config.throwDuration}s linear,
        top ${data.config.throwDuration}s cubic-bezier(0.1, 0.6, 0.4, 1),
        transform ${data.config.throwDuration}s linear
    `;
    
    containerRef.current.appendChild(el);

    // Trigger animation
    requestAnimationFrame(() => {
        const targetX = window.innerWidth / 2 + (Math.random() * 100 - 50);
        const targetY = window.innerHeight / 2 + (Math.random() * 100 - 50);
        
        // Overshoot slightly for impact effect
        el.style.left = `${targetX}px`;
        el.style.top = `${targetY}px`;
        const rotation = 360 * (data.config.spinSpeedMin + Math.random() * (data.config.spinSpeedMax - data.config.spinSpeedMin));
        el.style.transform = `rotate(${rotation}deg) scale(${item.scale})`;

        // Second Phase: Bounce off (Simulated via timeout change)
        setTimeout(() => {
             // Change transition for the fall
             el.style.transition = `top 0.5s cubic-bezier(0.5, 0, 1, 1), left 0.5s linear`;
             
             // Gravity / Bounce logic
             const bounceDir = Math.random() > 0.5 ? 1 : -1;
             
             el.style.top = `${window.innerHeight + 200}px`; // Fall down
             el.style.left = `${targetX + (Math.random() * 300 * bounceDir)}px`; // Scatter
        }, data.config.throwDuration * 1000 * 0.85); 
    });

    // Cleanup
    setTimeout(() => {
        if(el.parentElement) el.parentElement.removeChild(el);
    }, (data.config.throwDuration * 1000) + 2000);
  };

  const getStatusColor = (s: VTSState) => {
      switch(s) {
          case 'Authenticated': return 'text-kick-green';
          case 'Error': return 'text-red-500';
          case 'Connecting': return 'text-yellow-500';
          default: return 'text-gray-500';
      }
  };

  return (
    <div ref={containerRef} className="w-screen h-screen overflow-hidden pointer-events-none relative">
      <div className={`absolute top-2 left-2 text-xs font-mono font-bold ${getStatusColor(vtsStatus)} opacity-75 bg-black/50 p-1 rounded`}>
        <i className={`fa-solid ${vtsStatus === 'Authenticated' ? 'fa-link' : 'fa-link-slash'} mr-2`}></i>
        VTube Studio: {vtsStatus}
      </div>
    </div>
  );
};

export default Overlay;