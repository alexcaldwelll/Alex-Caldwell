import openingPoster from "../../assets/road/seattle-scene-road.webp";
import { RoadPencil } from "../shared/RoadPencil";

export function OpeningPoster() {
  return (
    <div className="road-opening">
      <div className="opening-road">
        <img
          src={openingPoster}
          alt="A yellow pencil points along an empty road."
          width="1279"
          height="853"
          fetchPriority="high"
        />
        <RoadPencil className="travel-pencil opening-pencil" />
      </div>
    </div>
  );
}
