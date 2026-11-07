import openingPoster from "../../assets/scenes/opening.webp";

export function OpeningPoster() {
  return (
    <img
      src={openingPoster}
      alt="An oversized yellow pencil with a pink eraser on an open cream page"
      width="1672"
      height="941"
      fetchPriority="high"
    />
  );
}
