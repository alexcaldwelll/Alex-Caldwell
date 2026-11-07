import { CatmullRomCurve3, Vector3 } from 'three';

export const BRANCH_PROGRESS = 0.48;
export type ProgressRef = Readonly<{ current: number }>;
export type SceneProgressProps = { progress: number; progressRef?: ProgressRef };
export const clampProgress = (progress: number) => Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;

const soccerPoints = [[0, 0, 0], [1.2, 0, -14], [-2.8, 0, -29], [0, 0, -44], [5, 0, -60], [10, 0, -80], [13, 0, -102]] as const;
const soccer = new CatmullRomCurve3(soccerPoints.map(point => new Vector3(...point)), false, 'centripetal');
const fork = soccer.getPoint(BRANCH_PROGRESS);
const branchPoints: readonly (readonly [number, number, number])[] = [[fork.x, 0, fork.z], [fork.x - 1.3, 0, fork.z - 9], [-11, 0, -67], [-13, 0, -83], [-8, 0, -104]];
const branch = new CatmullRomCurve3(branchPoints.map(point => new Vector3(...point)), false, 'centripetal');

/** Both roads remain in the world; the pencil follows the new road automatically. */
export const ROAD_ROUTES = [
  { id: 'soccer', points: soccerPoints, curve: soccer },
  { id: 'new-road', points: branchPoints, curve: branch },
] as const;

export function writeStoryPosition(progress: number, target: Vector3) {
  const p = clampProgress(progress);
  return p <= BRANCH_PROGRESS ? soccer.getPoint(p, target) : branch.getPoint((p - BRANCH_PROGRESS) / (1 - BRANCH_PROGRESS), target);
}

export function sampleStoryRoute(progress: number): [number, number, number] {
  const point = writeStoryPosition(progress, new Vector3());
  return [point.x, point.y, point.z];
}
