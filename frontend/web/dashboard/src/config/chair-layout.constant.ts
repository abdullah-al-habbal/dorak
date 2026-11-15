import { ChairShape } from "@/enums/chair-shape.enum";
import type { ChairLayoutPayload } from "@/interfaces/chairs/chair-payload.interface";

/** Floor-plan placement for a chair created from the dashboard; the mobile layout editor refines it. */
export const DEFAULT_CHAIR_LAYOUT: ChairLayoutPayload = {
  position_x: 0,
  position_y: 0,
  width: 60,
  height: 60,
  rotation: 0,
  shape: ChairShape.Rectangle,
};

export const CHAIR_PER_PAGE = 20;
export const CHAIR_MAX_LABEL = 120;
export const CHAIR_MAX_SEARCH = 100;
