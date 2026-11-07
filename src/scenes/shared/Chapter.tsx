import type { StoryChapter } from '../desktop/sceneData';

export function Chapter({ chapter }: { chapter: StoryChapter }) {
  return (
    <section className="story-chapter" aria-labelledby={`chapter-${chapter.id}`} data-faith-visible={chapter.faithVisible}>
      <div className="chapter-caption">
        <h2 id={`chapter-${chapter.id}`}>{chapter.title}</h2>
        <p>{chapter.context}</p>
      </div>
      <img className="chapter-poster" src={chapter.poster} alt={chapter.imageDescription} loading="lazy" decoding="async" width={chapter.posterWidth} height={chapter.posterHeight} />
    </section>
  );
}
