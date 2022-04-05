import { extend } from "./shared";

class ReactiveEffect {
  private _fn: any;
  private deps = [];
  private active: boolean = true;
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
  stop() {
    if (this.active) {
      clearUpEffect(this);
      this.onStop && this.onStop();
      this.active = false;
    }
  }
}
function clearUpEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}
// 依赖收集
const targetMap = new Map();
export function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  if (!activeEffect) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}
let activeEffect;
export function effect(fn, options: any = {}) {
  // 上来就要调用fn
  const scheduler = options.scheduler;  //获取
  const _effect = new ReactiveEffect(fn, scheduler);
  extend(_effect, options); //挂载所有options的值
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
 
export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let deps = depsMap.get(key);
  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
export function stop(runner) {
  runner.effect.stop();
}
