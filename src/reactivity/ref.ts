import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";
import { hasChange, isObject } from "./shared";

class RefImpl {
  private _value: any;
  public dep;
  public _v_isRef: boolean = true;
  private _rawValue: any;
  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
    //   判断对象是不是对象
    this.dep = new Set();
  }
  set value(newValue: any) {
    //   对比的时候
    if (hasChange(newValue, this._rawValue)) {
      this._value = convert(newValue);
      this._rawValue = newValue;
      triggerEffect(this.dep);
    }
  }
  get value() {
    if (isTracking()) {
      trackEffect(this.dep);
    }

    return this._value;
  }
}
function convert(value: any) {
  return isObject(value) ? reactive(value) : value;
}
export function ref(value) {
  return new RefImpl(value);
}
export function isRef(ref) {
  // 如果有值就一定是ref
  return !!ref._v_isRef;
}
export function unRef(ref) {
   return isRef(ref) ? ref.value : ref;
}
export function proxyRefs() {}
