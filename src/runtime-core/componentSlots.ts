import { ShapeFlags } from "../shared/sharedFlags";

export function initSlots(instance, children) {
  // 是否是数组，如果不是就给包裹一层
  // instance.slots = Array.isArray(children) ? children : [children];
  const { vnode } = instance;
  if (vnode.shapeFlags & ShapeFlags.SLOT_CHILDREN) {
    const slot = {};
    for (let key in children) {
      const value = children[key];
      slot[key] = (props) => normalizeSlotsValue(value(props));
    }
    instance.slots = slot;
  }
}
function normalizeSlotsValue(value) {
  return Array.isArray(value) ? value : [value];
}
