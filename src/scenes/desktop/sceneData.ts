import seattle from "../../assets/road/seattle-scene-field.webp";
import charleston from "../../assets/road/charleston-scene-field.webp";
import dc from "../../assets/road/dc-scene-church.webp";
import nashville from "../../assets/road/nashville-scene-campus.webp";
import future from "../../assets/road/nashville-scene-broadway.webp";

export type StoryChapter = {
  id: "seattle" | "charleston" | "dc" | "nashville" | "future";
  title: string;
  progressStart: number;
  progressEnd: number;
  faithVisible: boolean;
  landmarks: string[];
  poster: string;
  posterWidth: number;
  posterHeight: number;
  imageDescription: string;
};

export const STORY_CHAPTERS: readonly StoryChapter[] = [
  {
    id: "seattle",
    title: "Seattle",
    progressStart: 0,
    progressEnd: 0.2,
    faithVisible: false,
    poster: seattle,
    posterWidth: 1279,
    posterHeight: 853,
    landmarks: [
      "evergreen trees",
      "Space Needle",
      "lake",
      "high-dive platform",
      "Mount Rainier",
    ],
    imageDescription: "Evergreens line the road below the Space Needle and Lake Washington. A floodlit youth soccer game is visible across the road.",
  },
  {
    id: "charleston",
    title: "Charleston",
    progressStart: 0.2,
    progressEnd: 0.4,
    faithVisible: false,
    poster: charleston,
    posterWidth: 1279,
    posterHeight: 853,
    landmarks: [
      "palm trees",
      "ocean",
      "soccer",
      "team travel",
      "Florida tournament",
      "college coaches",
    ],
    imageDescription: "Palmettos, ocean and the Ravenel Bridge flank a road with a white Civic and a grass soccer field.",
  },
  {
    id: "dc",
    title: "Washington, DC",
    progressStart: 0.4,
    progressEnd: 0.6,
    faithVisible: true,
    poster: dc,
    posterWidth: 1279,
    posterHeight: 853,
    landmarks: [
      "George Washington University soccer field",
      "Washington Monument",
      "soccer fork",
      "ball on old route",
      "St. Patrick’s Church",
    ],
    imageDescription: "Cherry blossoms frame the Washington Monument and Capitol. The GW turf field sits in front of St. Patrick’s Church.",
  },
  {
    id: "nashville",
    title: "Nashville",
    progressStart: 0.6,
    progressEnd: 0.8,
    faithVisible: true,
    poster: nashville,
    posterWidth: 1279,
    posterHeight: 853,
    landmarks: [
      "Vanderbilt University",
      "running",
      "food",
      "music",
      "Church of the Immaculate Conception",
    ],
    imageDescription: "Vanderbilt’s brick clock tower and campus stand among mature trees.",
  },
  {
    id: "future",
    title: "The unfinished future",
    progressStart: 0.8,
    progressEnd: 1,
    faithVisible: true,
    poster: future,
    posterWidth: 1279,
    posterHeight: 853,
    landmarks: ["open page", "partial graphite sketches", "golden light"],
    imageDescription: "Broadway storefronts shift from finished color to unfinished graphite.",
  },
];
