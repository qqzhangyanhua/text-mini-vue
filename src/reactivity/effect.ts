
let activeEffect
class ReactiveEffect{
    public _fn:any
    constructor(fn:Function,public scheduler?) {
        this._fn=fn
    }
    run(){
        activeEffect = this;
       return this._fn()
    }
}
export function effect(fn,options:any={}){
   const _effect = new ReactiveEffect(fn, options.scheduler);
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
    console.log('depsMap===',depsMap)
    let dep = depsMap.get(key);
    console.log("dep===", dep);
    
    if(!dep){
        dep = new Set();
        depsMap.set(key,dep)
    }
    dep.add(activeEffect);
    // const dep =new Set()
}
export function trigger(target,key){
    let depsMap = targetMap.get(target);
     let dep = depsMap.get(key);
     for (const effect of dep){
         console.log('effect',effect)
         if(effect.scheduler){
             effect.scheduler()
         }else{
         effect.run();
             
         }
     }

}