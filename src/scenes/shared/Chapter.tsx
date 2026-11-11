import type { ReactNode } from 'react';
import type { StoryChapter } from '../desktop/sceneData';

export function Chapter({ chapter, children }: { chapter: StoryChapter; children?: ReactNode }) {
  return (
    <section className="story-chapter" id={chapter.id} aria-labelledby={`chapter-${chapter.id}`} data-faith-visible={chapter.faithVisible}>
      <div className={chapter.id === 'future' ? 'sr-only' : 'chapter-caption'}>
        <h2 id={`chapter-${chapter.id}`}>{chapter.title}</h2>
      </div>
      <img className="chapter-poster" src={chapter.poster} alt={chapter.imageDescription} loading="lazy" decoding="async" width={chapter.posterWidth} height={chapter.posterHeight} />
      {children}
    </section>
  );
}
