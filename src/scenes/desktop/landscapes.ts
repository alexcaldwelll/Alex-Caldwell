import seattleRoad from "../../assets/road/seattle-scene-road.webp";
import seattleTrees from "../../assets/road/seattle-scene-trees.webp";
import seattleLake from "../../assets/road/seattle-scene-lake.webp";
import seattleNeedle from "../../assets/road/seattle-scene-needle.webp";
import seattleField from "../../assets/road/seattle-scene-field.webp";
import charlestonRoad from "../../assets/road/charleston-scene-road.webp";
import charlestonPalms from "../../assets/road/charleston-scene-palms.webp";
import charlestonOcean from "../../assets/road/charleston-scene-ocean.webp";
import charlestonBridge from "../../assets/road/charleston-scene-bridge.webp";
import charlestonCivic from "../../assets/road/charleston-scene-civic.webp";
import charlestonField from "../../assets/road/charleston-scene-field.webp";
import dcRoad from "../../assets/road/dc-scene-road.webp";
import dcMonument from "../../assets/road/dc-scene-monument.webp";
import dcField from "../../assets/road/dc-scene-field.webp";
import dcChurch from "../../assets/road/dc-scene-church.webp";
import dcClinic from "../../assets/road/dc-scene-clinic.webp";
import nashvilleRoad from "../../assets/road/nashville-scene-road.webp";
import nashvilleCampus from "../../assets/road/nashville-scene-campus.webp";
import nashvilleBroadway from "../../assets/road/nashville-scene-broadway.webp";
import dcChurchOnly from "../../assets/road/dc-scene-church-only.webp";

export type Landscape = {
  vanishing: readonly [number, number];
  roadCenter: number;
  frames: readonly (readonly [string, string, (readonly [number, number, number])?])[];
  finishAtEdge?: boolean;
  survivor?: string;
};

export const LANDSCAPES = {
    seattle: {
      vanishing: [.578,.455], roadCenter: .569,
      frames: [
        [seattleRoad, "An open road stretches ahead."],
        [seattleTrees, "Dense Pacific Northwest evergreens grow beside the road.", [.05,.56,.71]],
        [seattleLake, "Lake Washington, boats and the floating bridge appear behind the trees.", [.13,.565,.48]],
        [seattleNeedle, "The Space Needle rises above the forest.", [.22,.32,.24]],
        [seattleField, "A floodlit middle-school soccer game appears farther up on the right.", [.65,.99,.60]],
      ],
    },
    charleston: {
      vanishing: [.557,.493], roadCenter: .557,
      frames: [
        [charlestonRoad, "A quiet Lowcountry road stretches ahead."],
        [charlestonPalms, "Palmettos grow out of the roadside dune grass.", [.04,.35,.47]],
        [charlestonOcean, "Blue-green ocean and surf open up beyond the palmettos.", [.10,.55,.55]],
        [charlestonBridge, "The Arthur Ravenel Jr. Bridge rises in the distance.", [.20,.60,.39]],
        [charlestonCivic, "A white Honda Civic appears on the road.", [.55,.66,.63]],
        [charlestonField, "A grass soccer field with coaches and ECNL tents appears on the right.", [.64,.99,.58]],
      ],
    },
    dc: {
      vanishing: [.511,.488], roadCenter: .518,
      frames: [
        [dcRoad, "The road into Washington, DC."],
        [dcMonument, "The Washington Monument and Capitol appear among cherry blossoms.", [.06,.55,.37]],
        [dcField, "The GW mark appears at midfield on the turf soccer field.", [.55,.99,.59]],
        [dcChurch, "St. Patrick’s Church rises beyond the field.", [.75,.94,.35]],
        [dcClinic, "The field gives way to a physical therapy room. A GW player balances on one foot while a clinician takes notes.", [.58,.98,.65]],
      ],
      survivor: dcChurchOnly,
    },
    nashville: {
      vanishing: [.515,.577], roadCenter: .517, finishAtEdge: true,
      frames: [
        [nashvilleRoad, "The road into Nashville."],
        [nashvilleCampus, "Vanderbilt’s brick clock tower and campus appear among mature trees.", [.04,.53,.43]],
        [nashvilleBroadway, "On the right, Broadway’s storefronts shift from finished color to unfinished graphite.", [.56,.86,.61]],
      ],
    },
  } as const satisfies Record<string, Landscape>;
