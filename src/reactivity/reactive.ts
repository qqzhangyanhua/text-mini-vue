import { mutableHandlers, readonlyHandlers } from "./bseHandlers";


export function reactive(raw) {
  return new Proxy(raw, mutableHandlers);
}

export function readonly(raw) {
  return new Proxy(raw, readonlyHandlers);
}
export function isReactive(value) {}
