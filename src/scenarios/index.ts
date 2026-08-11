import type { Scenario } from '../types';
import shopease from './shopease.json';
import healthform from './healthform.json';
import metricboard from './metricboard.json';
import travelblog from './travelblog.json';

export const allScenarios: Scenario[] = [
  shopease as Scenario,
  healthform as Scenario,
  metricboard as Scenario,
  travelblog as Scenario,
];

export function getScenario(id: string): Scenario | undefined {
  return allScenarios.find((s) => s.id === id);
}
