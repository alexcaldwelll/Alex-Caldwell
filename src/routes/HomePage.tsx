import { DesktopStory } from '../scenes/desktop/DesktopStory';
import { StaticJourney } from '../scenes/mobile/StaticJourney';

export function HomePage() {
  return (
    <>
      <DesktopStory progress={0} />
      <StaticJourney />
    </>
  );
}
