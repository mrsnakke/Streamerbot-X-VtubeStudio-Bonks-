import { BonkConfig, BonkItem } from './types';

export const DEFAULT_CONFIG: BonkConfig = {
  barrageCount: 20,
  barrageFrequency: 0.1,
  throwDuration: 1.0,
  returnSpeed: 0.3,
  throwAngleMin: -45,
  throwAngleMax: 45,
  spinSpeedMin: 5,
  spinSpeedMax: 15,
  physicsGravity: 1.0,
  physicsHorizontal: 1.0,
  physicsVertical: 1.0,
  physicsReverse: false,
  portThrower: 8080,
  portVTubeStudio: 8001,
  ipVTubeStudio: "localhost"
};

// Items now point to local resources in the public/img folder
// Ensure you have a file named 'test.png' in public/img/ or change this
export const DEFAULT_ITEMS: BonkItem[] = [
  { image: "img/test.png", weight: 1, scale: 1, volume: 1, pixel: false }
];

export const VTS_PLUGIN_INFO = {
    pluginName: "KickBonk",
    pluginDeveloper: "KickBonkDev",
    pluginIcon: null
};