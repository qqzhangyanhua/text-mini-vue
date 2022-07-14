
let activeEffect
class ReactiveEffect{
    public _fn:any
    constructor(fn:Function) {
        this._fn=fn
    }
    run(){
        activeEffect = this;
       return this._fn()
    }
}
export function effect(fn){
   const _effect = new ReactiveEffect(fn);
   _effect.run();
   return _effect.run.bind(_effect);
}
const targetMap = new Map();
export function track(target,key){
    let depsMap = targetMap.get(target);
    if(!depsMap){
        depsMap = new Map();
        targetMap.set(target,depsMap);
    }
    let dep = depsMap.get(key);
    if(!dep){
        dep = new Set();
        depsMap.set(target,key)
    }
    dep.add(activeEffect);
    // const dep =new Set()
}
export function trigger(target,key){
    let depsMap = targetMap.get(target);
     let dep = depsMap.get(key);
     for (const effect of dep){
         effect.run()
     }

}