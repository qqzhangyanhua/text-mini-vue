import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";
import { extend, isObject } from "./shared";
const set = createSetter();
const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadOnly: boolean = false, shallow: boolean = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly;
    } else if (key === ReactiveFlags.IS_READ_ONLY) {
      return isReadOnly;
    }

    const res = Reflect.get(target, key);
    if (shallow) {
      // 如果是shallow就不需要深层次的观察
      return res;
    }
    //   看看是不是object
    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reactive(res);
    }
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
  get,
  set,
};
export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    // readonly的时候不允许set
    console.warn(`Attempting to mutate readonly value ${`${target}[${key}]`}`);
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
