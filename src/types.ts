export interface BonkConfig {
  barrageCount: number;
  barrageFrequency: number;
  throwDuration: number;
  returnSpeed: number;
  throwAngleMin: number;
  throwAngleMax: number;
  spinSpeedMin: number;
  spinSpeedMax: number;
  physicsGravity: number;
  physicsHorizontal: number;
  physicsVertical: number;
  physicsReverse: boolean;
  portThrower: number;
  portVTubeStudio: number;
  ipVTubeStudio: string;
}

export interface BonkItem {
  image: string;
  weight: number;
  scale: number;
  sound?: string;
  volume: number;
  pixel: boolean;
}

export type BonkRequest = {
  type: 'single' | 'barrage';
  count?: number;
  config: BonkConfig;
  items: BonkItem[];
}