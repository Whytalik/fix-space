import { pointerWithin, closestCenter, type CollisionDetection } from "@dnd-kit/core";

export const contentEditorCollision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  if (hits.length > 0) return hits;
  return closestCenter(args);
};
