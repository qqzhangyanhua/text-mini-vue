import { ShapeFlags } from "../shared/sharedFlags";

export function createVnode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlags: getShapeFlags(type),
    el: null,
  };
  // children 位运算符
  if (typeof children === "string") {
    vnode.shapeFlags|= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
      vnode.shapeFlags|= ShapeFlags.ARROW_CHILDREN;
  }
  return vnode;
}

function getShapeFlags(type: any) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
