import type { Ear } from "./tryon";

export type SampleModel = {
  src: string;
  /** Natural image size in pixels. */
  w: number;
  h: number;
  alt: string;
  credit?: string;
  /**
   * Ear lobes in image pixels. Measured once with the face model
   * (earsFromLandmarks in lib/tryon.ts) so the sample shows instantly without
   * downloading the model. Leave it out after swapping the photo and the
   * try-on will detect the ears at runtime instead.
   */
  ears?: Ear[];
};

/** Default try-on model (photo used with the model's permission). */
export const PHOTO_MODEL: SampleModel = {
  src: "/try-on/model.jpg",
  w: 415,
  h: 739,
  alt: "Sample model",
  credit: "Model photo used with permission",
  ears: [
    // Her right ear is turned away from the camera in this pose, so it stays hidden.
    { side: "left", x: 139.9, y: 226.9, faceH: 179.7, roll: 0.093, visible: 0 },
    { side: "right", x: 293, y: 240.9, faceH: 179.7, roll: 0.093, visible: 1 },
  ],
};

/** Illustrated fallback, used if the photo fails to load. */
export const ILLUSTRATED_MODEL: SampleModel = {
  src: "/try-on/sample-model.svg",
  w: 900,
  h: 1000,
  alt: "Illustrated sample model",
  ears: [
    { side: "left", x: 290, y: 548, faceH: 400, roll: 0, visible: 1 },
    { side: "right", x: 610, y: 548, faceH: 400, roll: 0, visible: 1 },
  ],
};
