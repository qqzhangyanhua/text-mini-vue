import { track, trigger } from "./effect";

function createGetter(isReadOnly: boolean = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);
    if (!isReadOnly) {
      track(target, key);
    }
    return res;
  };
}
function createSetter() {
  return function get(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}
export const mutableHandlers = {
  get: createGetter(),
  set: createSetter(),
};
export const readonlyHandlers = {
  get: createGetter(true),
  set(target, key, value) {
    // readonly的时候不允许set
    return true;
  },
};