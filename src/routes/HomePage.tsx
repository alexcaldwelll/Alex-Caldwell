import { DesktopStory } from '../scenes/desktop/DesktopStory';
import { StaticJourney } from '../scenes/mobile/StaticJourney';

export function HomePage() {
  return (
    <>
      <h1 className="sr-only">Alexandra’s story</h1>
      <DesktopStory progress={0} />
      <StaticJourney />
    </>
  );
}
