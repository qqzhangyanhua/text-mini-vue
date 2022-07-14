
import { track, trigger } from "./effect";

export const reactive=(raw)=>{
    return new Proxy(raw,{
        get(target,key){
            const res = Reflect.get(target,key);
            track(target,key)
            // 依賴收集
            return res
        },
        set(target,key,value){
            const res = Reflect.set(target,key,value);
            trigger(target,key)
            return res
        }
    })
}