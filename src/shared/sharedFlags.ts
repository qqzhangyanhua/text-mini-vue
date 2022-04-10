
export const  enum ShapeFlags {
    ELEMENT = 1, //01
    STATEFUL_COMPONENT = 1 << 1, //10
    TEXT_CHILDREN = 1 << 2, //100
    ARROW_CHILDREN = 1 << 3, //1000
}
export  const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);