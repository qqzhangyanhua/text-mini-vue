export const enum ShapeFlags {
  ELEMENT = 1, //01
  STATEFUL_COMPONENT = 1 << 1, //10
  TEXT_CHILDREN = 1 << 2, //100
  ARROW_CHILDREN = 1 << 3, //1000
  SLOT_CHILDREN = 1 << 4, //
}
export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
export const toHandlerKey = (str: string) => {
  return str ? `on${capitalize(str)}` : "";
};
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};
