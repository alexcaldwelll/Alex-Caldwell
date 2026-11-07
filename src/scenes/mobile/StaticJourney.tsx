import { STORY_CHAPTERS } from '../desktop/sceneData';
import { Chapter } from '../shared/Chapter';
import '../shared/journey.css';

export function StaticJourney() {
  return <div className="static-journey">{STORY_CHAPTERS.map(chapter => <Chapter key={chapter.id} chapter={chapter} />)}</div>;
}
