import openingPoster from '../assets/scenes/opening.webp';
import { StaticJourney } from '../scenes/mobile/StaticJourney';

export function HomePage() {
  return (
    <>
      <div className="story-opening" aria-label="Alexandra’s story begins">
        <img src={openingPoster} alt="An oversized yellow pencil with a pink eraser on an open cream page" width="1672" height="941" fetchPriority="high" />
      </div>
      <StaticJourney />
    </>
  );
}
