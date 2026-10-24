import * as THREE from 'three';
import { ConfiguratorState } from '../../types/configurator';
import { generateVaseGeometry } from './parametricVase';
import { generateGearGeometry } from './mechanicalGear';
import { generateSculptureGeometry } from './mobiusSculpture';
import { generateGyroidGeometry } from './gyroidLattice';
import { generateLanternGeometry } from './cyberLantern';
import { generateSuperformula } from './superformula';

/**
 * Builds BufferGeometry based on current state parameters
 */
export function buildGeometry(state: ConfiguratorState): THREE.BufferGeometry {
  switch (state.generatorType) {
    case 'vase':
      return generateVaseGeometry(state.vase);
    case 'gear':
      return generateGearGeometry(state.gear);
    case 'sculpture':
      return generateSculptureGeometry(state.sculpture);
    case 'gyroid':
      return generateGyroidGeometry(state.gyroid);
    case 'lantern':
      return generateLanternGeometry(state.lantern);
    case 'custom':
      return generateSuperformula(state.custom);
    default:
      return generateVaseGeometry(state.vase);
  }
}
