import React, { useState } from 'react';
import { DEFAULT_CONFIG, DEFAULT_ITEMS } from '../constants';
import { BonkConfig } from '../types';

type Tab = 'dashboard' | 'settings' | 'items' | 'about';

const ControlPanel: React.FC = () => {
  const [config, setConfig] = useState<BonkConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const handleBonk = (type: 'single' | 'barrage') => {
    // @ts-ignore
    window.ipcRenderer.send('bonk', {
      type,
      config,
      items: DEFAULT_ITEMS
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  return (
    <div className="flex h-screen bg-kick-dark text-gray-200 selection:bg-kick-green selection:text-black font-sans">
      
      {/* Sidebar */}
      <nav className="w-20 lg:w-64 bg-kick-dark border-r border-kick-light flex flex-col justify-between transition-all duration-300">
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-kick-light">
             <div className="w-10 h-10 bg-kick-green rounded flex items-center justify-center text-black font-bold text-2xl shadow-[0_0_15px_rgba(83,252,24,0.4)]">
               <i className="fa-solid fa-k"></i>
             </div>
             <span className="hidden lg:block ml-3 font-bold text-xl tracking-wide">KickBonk</span>
          </div>

          <div className="mt-6 flex flex-col gap-2 px-3">
            <SidebarBtn icon="fa-gauge-high" label="Panel" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarBtn icon="fa-sliders" label="Configuración" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            <SidebarBtn icon="fa-box-open" label="Objetos" active={activeTab === 'items'} onClick={() => setActiveTab('items')} />
          </div>
        </div>

        <div className="mb-6 px-3">
             <SidebarBtn icon="fa-circle-info" label="Acerca de" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0f1114]">
        <header className="h-20 border-b border-kick-light flex items-center px-8 bg-kick-dark sticky top-0 z-10">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                {activeTab === 'dashboard' && 'Panel de Control'}
                {activeTab === 'settings' && 'Configuración Avanzada'}
                {activeTab === 'items' && 'Gestión de Objetos'}
                {activeTab === 'about' && 'Información'}
            </h2>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                    
                    {/* Quick Actions Card */}
                    <div className="bg-kick-gray border border-kick-light rounded-xl p-6 shadow-lg">
                        <h3 className="text-kick-green font-bold text-lg mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-bolt"></i> Pruebas Rápidas
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleBonk('single')} 
                                className="h-24 rounded-lg bg-kick-light hover:bg-white hover:text-black border border-gray-700 hover:border-white transition-all duration-200 flex flex-col items-center justify-center gap-2 group">
                                <i className="fa-solid fa-bullseye text-2xl text-kick-green group-hover:text-black"></i>
                                <span className="font-semibold">Lanzar Uno</span>
                            </button>
                            <button onClick={() => handleBonk('barrage')} 
                                className="h-24 rounded-lg bg-kick-light hover:bg-kick-green hover:text-black border border-gray-700 hover:border-kick-green transition-all duration-200 flex flex-col items-center justify-center gap-2 group">
                                <i className="fa-solid fa-meteor text-2xl text-white group-hover:text-black"></i>
                                <span className="font-semibold">Lanzar Ráfaga</span>
                            </button>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-kick-gray border border-kick-light rounded-xl p-6 shadow-lg flex flex-col justify-between">
                         <div>
                            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-server"></i> Estado del Sistema
                            </h3>
                            <div className="space-y-3">
                                <StatusItem label="Servidor de Lanzamiento" port={config.portThrower} active={true} />
                                <StatusItem label="VTube Studio API" port={config.portVTubeStudio} active={false} pending={true} />
                            </div>
                         </div>
                         <div className="mt-6 text-xs text-gray-500 text-center">
                            Sistema listo para la integración con Kick.
                         </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    {/* Throw Physics */}
                    <div className="bg-kick-gray border border-kick-light rounded-xl overflow-hidden">
                        <div className="bg-kick-light p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-white"><i className="fa-solid fa-wind mr-2 text-kick-green"></i> Físicas de Lanzamiento</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <RangeControl label="Duración (segundos)" name="throwDuration" value={config.throwDuration} min="0.5" max="5.0" step="0.1" onChange={handleChange} />
                            <RangeControl label="Gravedad" name="physicsGravity" value={config.physicsGravity} min="0.1" max="3.0" step="0.1" onChange={handleChange} />
                            <RangeControl label="Velocidad Retorno" name="returnSpeed" value={config.returnSpeed} min="0.1" max="1.0" step="0.1" onChange={handleChange} />
                            
                            <div className="flex items-center justify-between p-3 bg-kick-light rounded-lg">
                                <span className="text-sm">Invertir Gravedad</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="physicsReverse" checked={config.physicsReverse} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kick-green"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Barrage Settings */}
                    <div className="bg-kick-gray border border-kick-light rounded-xl overflow-hidden">
                         <div className="bg-kick-light p-4 border-b border-gray-700">
                            <h3 className="font-bold text-white"><i className="fa-solid fa-layer-group mr-2 text-kick-green"></i> Configuración de Ráfaga</h3>
                        </div>
                        <div className="p-6 space-y-6">
                             <div className="space-y-2">
                                <label className="text-sm text-gray-400">Cantidad de Objetos</label>
                                <input type="number" name="barrageCount" value={config.barrageCount} onChange={handleChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 focus:border-kick-green focus:outline-none transition-colors" />
                             </div>
                             <RangeControl label="Frecuencia (Espaciado)" name="barrageFrequency" value={config.barrageFrequency} min="0.01" max="1.0" step="0.01" onChange={handleChange} />
                        </div>
                    </div>

                    {/* Connection */}
                    <div className="bg-kick-gray border border-kick-light rounded-xl overflow-hidden md:col-span-2">
                        <div className="bg-kick-light p-4 border-b border-gray-700">
                            <h3 className="font-bold text-white"><i className="fa-solid fa-network-wired mr-2 text-kick-green"></i> Conexiones</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Puerto Overlay</label>
                                <input type="number" name="portThrower" value={config.portThrower} onChange={handleChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 focus:border-kick-green focus:outline-none transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Puerto VTube Studio</label>
                                <input type="number" name="portVTubeStudio" value={config.portVTubeStudio} onChange={handleChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 focus:border-kick-green focus:outline-none transition-colors" />
                            </div>
                        </div>
                    </div>
                 </div>
            )}
            
            {activeTab === 'items' && (
                <div className="bg-kick-gray border border-kick-light rounded-xl p-8 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-kick-light rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-folder-open text-3xl text-kick-green"></i>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Gestión de Archivos Locales</h3>
                    <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                        Para añadir imágenes o sonidos personalizados, coloca tus archivos dentro de la carpeta <code className="bg-black px-2 py-1 rounded text-kick-green">public/img</code> o <code className="bg-black px-2 py-1 rounded text-kick-green">public/sound</code> en la raíz del programa.
                    </p>
                    <div className="p-4 bg-black/30 rounded border border-gray-700 inline-block text-left text-sm font-mono text-gray-300">
                        <p><i className="fa-regular fa-file-image mr-2"></i> public/img/cookie.png</p>
                        <p><i className="fa-regular fa-file-audio mr-2"></i> public/sound/bonk.mp3</p>
                    </div>
                </div>
            )}

            {activeTab === 'about' && (
                 <div className="bg-kick-gray border border-kick-light rounded-xl p-8 animate-fade-in">
                    <h3 className="text-2xl font-bold text-white mb-4">KickBonk v2.0</h3>
                    <p className="text-gray-400 mb-4">
                        Una aplicación modular diseñada para streamers de Kick que utilizan VTube Studio. 
                        Permite lanzar objetos a tu modelo Live2D con físicas simuladas.
                    </p>
                    <div className="flex gap-4 mt-6">
                        <a href="#" className="text-kick-green hover:underline"><i className="fa-brands fa-github mr-2"></i> GitHub</a>
                        <a href="#" className="text-kick-green hover:underline"><i className="fa-brands fa-twitter mr-2"></i> Twitter</a>
                    </div>
                 </div>
            )}
        </div>
      </main>
    </div>
  );
};

// Sub-components for cleaner code
const SidebarBtn = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${active ? 'bg-kick-green text-black font-bold' : 'text-gray-400 hover:bg-kick-light hover:text-white'}`}>
        <div className={`w-8 flex justify-center text-lg ${active ? 'text-black' : 'text-gray-500 group-hover:text-kick-green'}`}>
            <i className={`fa-solid ${icon}`}></i>
        </div>
        <span className="hidden lg:block">{label}</span>
    </button>
);

const RangeControl = ({ label, name, value, min, max, step, onChange }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between text-sm">
            <span className="text-gray-300">{label}</span>
            <span className="text-kick-green font-mono">{value}</span>
        </div>
        <input type="range" name={name} value={value} min={min} max={max} step={step} onChange={onChange}
            className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-kick-green" />
    </div>
);

const StatusItem = ({ label, port, active, pending }: any) => (
    <div className="flex justify-between items-center p-3 bg-black/30 rounded border border-gray-800">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-kick-green shadow-[0_0_8px_#53FC18]' : pending ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-xs font-mono text-gray-500">Port: {port}</span>
    </div>
);

export default ControlPanel;