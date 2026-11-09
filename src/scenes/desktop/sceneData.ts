import seattle from "../../assets/scenes/seattle.webp";
import charleston from "../../assets/scenes/charleston.webp";
import dc from "../../assets/scenes/dc.webp";
import nashville from "../../assets/scenes/nashville.webp";
import future from "../../assets/scenes/future.webp";

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
    posterWidth: 1536,
    posterHeight: 1024,
    landmarks: [
      "evergreen trees",
      "Space Needle",
      "lake",
      "high-dive platform",
      "Mount Rainier",
    ],
    imageDescription:
      "An interpretive Seattle memory scene with evergreens, the Space Needle, a lake and Mount Rainier.",
  },
  {
    id: "charleston",
    title: "Charleston",
    progressStart: 0.2,
    progressEnd: 0.4,
    faithVisible: false,
    poster: charleston,
    posterWidth: 1672,
    posterHeight: 941,
    landmarks: [
      "palm trees",
      "ocean",
      "soccer",
      "team travel",
      "Florida tournament",
      "college coaches",
    ],
    imageDescription:
      "An interpretive coastal Charleston scene connecting palm trees, ocean, soccer and travel.",
  },
  {
    id: "dc",
    title: "Washington, DC",
    progressStart: 0.4,
    progressEnd: 0.6,
    faithVisible: true,
    poster: dc,
    posterWidth: 1672,
    posterHeight: 941,
    landmarks: [
      "George Washington University soccer field",
      "Washington Monument",
      "soccer fork",
      "ball on old route",
      "St. Patrick’s Church",
    ],
    imageDescription:
      "An interpretive Washington, DC scene: the road branches away from soccer toward St. Patrick’s Church and a small golden light.",
  },
  {
    id: "nashville",
    title: "Nashville",
    progressStart: 0.6,
    progressEnd: 0.8,
    faithVisible: true,
    poster: nashville,
    posterWidth: 1568,
    posterHeight: 1003,
    landmarks: [
      "Vanderbilt University",
      "running",
      "food",
      "music",
      "Church of the Immaculate Conception",
    ],
    imageDescription:
      "An interpretive Nashville scene bringing together Vanderbilt, running, food, music and church, accompanied by golden light.",
  },
  {
    id: "future",
    title: "The unfinished future",
    progressStart: 0.8,
    progressEnd: 1,
    faithVisible: true,
    poster: future,
    posterWidth: 1672,
    posterHeight: 941,
    landmarks: ["open page", "partial graphite sketches", "golden light"],
    imageDescription:
      "A pencil continues into an open page with partially drawn possibilities and a continuing golden light.",
  },
];
