import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./bseHandlers";
import { isObject } from "./shared";
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive__",
  IS_READ_ONLY = "__v_isReadonly__",
}

export function reactive(raw) {
  return new Proxy(raw, mutableHandlers);
}

export function readonly(raw) {
  return new Proxy(raw, readonlyHandlers);
}
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}
export function isReadOnly(value) {
  return !!value[ReactiveFlags.IS_READ_ONLY];
}

export function shallowReadonly(raw) {
  if (!isObject(raw)) {
    console.warn(`target ${raw} 必须是一个对象`);
    return raw;
  }
  return new Proxy(raw, shallowReadonlyHandlers);
}
