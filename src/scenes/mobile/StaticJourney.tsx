import { STORY_CHAPTERS } from '../desktop/sceneData';
import { LANDSCAPES } from '../desktop/landscapes';
import { Chapter } from '../shared/Chapter';
import '../shared/journey.css';

const clinic = LANDSCAPES.dc.frames[4];

export function StaticJourney() {
  return (
    <div className="static-journey">
      {STORY_CHAPTERS.map(chapter => (
        <Chapter key={chapter.id} chapter={chapter}>
          {chapter.id === 'dc' && <img className="chapter-poster" src={clinic[0]} alt={clinic[1]} width="1279" height="853" loading="lazy" decoding="async" />}
        </Chapter>
      ))}
    </div>
  );
}
