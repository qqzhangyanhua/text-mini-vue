let currentEffect = null;
class Dep {
    constructor(val) {
        this.effects = new Set();
        this._val = val;
    }
    get value() {
        this.depend()
        return this._val;
    }
    set value(newValue) {
        this._val = newValue;
        this.notices()
    }
    // 1收集依赖
    depend() {
        console.log('收集依赖', currentEffect)
        if (currentEffect) {

            this.effects.add(currentEffect)
        }
    }
    // 触发依赖
    notices() {
        console.log('触发了===notices', this.effects.size)
        // c触发一下我们之前收集到的依赖
        this.effects.forEach(effect => {
            effect();
        })
    }

}
const dep = new Dep(123)

function effectWatch(effect) {
    // 收集依赖

    currentEffect = effect
    effect()
    // dep.depend()
    currentEffect = null
}
let b;
// effectWatch(() => {

//     b = dep.value + 10
//       console.log('hello',b)
// })
// dep.value = 11
// dep.notices()


const targetMap = new Map()

// 收集依赖
function getDep(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap)
    }
    let deps = depsMap.get(key);
    if (!deps) {
        deps = new Dep();
        depsMap.set(key, deps)
    }
    return deps;
}

function reactive(raw) {
    return new Proxy(raw, {
        get(target, key) {
            const deps = getDep(target, key);
            console.log('key===', key)
            //    依赖收集
            deps.depend()
            return Reflect.get(target, key)
        },
        set(target, key, value) {
            // 触发依赖
            const deps = getDep(target, key);
            console.log('set===', deps)
            const result = Reflect.set(target, key, value)
            deps.notices();
            return result;
        }
    })
}
const user = reactive({
    age: 12
})
let double;
effectWatch(() => {
    console.log('effectWatch=====')
    double = user.age * 2
    console.log('double', double)
})
user.age = 14