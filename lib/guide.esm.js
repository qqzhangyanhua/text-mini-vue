const extend = Object.assign;
function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}
function hasChange(val, newValue) {
    return !Object.is(val, newValue);
}

let activeEffect;
let shouldTrick;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrick = true;
        // 收集依赖
        activeEffect = this;
        const result = this._fn();
        shouldTrick = false;
        return result;
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
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}
// 依赖收集
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
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
    trackEffect(dep);
}
function trackEffect(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return activeEffect !== undefined && shouldTrick;
}
function effect(fn, options = {}) {
    // 上来就要调用fn
    const scheduler = options.scheduler; //获取
    const _effect = new ReactiveEffect(fn, scheduler);
    extend(_effect, options); //挂载所有options的值
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let deps = depsMap.get(key);
    triggerEffect(deps);
}
function triggerEffect(deps) {
    for (const effect of deps) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

function hostPatchProp(el, key, prevValue, nextValue) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextValue);
    }
    else {
        el.setAttribute(key, nextValue);
    }
}

const set = createSetter();
const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadOnly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive__" /* IS_REACTIVE */) {
            return !isReadOnly;
        }
        else if (key === "__v_isReadonly__" /* IS_READ_ONLY */) {
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
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        // readonly的时候不允许set
        console.warn(`Attempting to mutate readonly value ${`${target}[${key}]`}`);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(raw) {
    return new Proxy(raw, mutableHandlers);
}
function readonly(raw) {
    return new Proxy(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} 必须是一个对象`);
        return raw;
    }
    return new Proxy(raw, shallowReadonlyHandlers);
}

const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? `on${capitalize(str)}` : "";
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};

const publicProxyMaps = {
    $el: (instance) => instance.vnode.el,
    $slots: (instance) => instance.slots,
};
const publicInstanceProxyHandler = {
    get({ _: instance }, key) {
        if (key in instance.setupState) {
            return instance.setupState[key];
        }
        const { props } = instance;
        if (hasOwn(instance.setupState, key)) {
            return instance.setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicProxyMaps[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function emit(instance, event, ...args) {
    console.log("event====", event);
    const { props } = instance;
    // TPP
    // 先去写一个特定的行为再去写一个通用的行为
    const handlersName = toHandlerKey(camelize(event));
    const handlers = props[handlersName];
    handlers && handlers(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

function initSlots(instance, children) {
    // 是否是数组，如果不是就给包裹一层
    // instance.slots = Array.isArray(children) ? children : [children];
    const { vnode } = instance;
    if (vnode.shapeFlags & 16 /* SLOT_CHILDREN */) {
        const slot = {};
        for (let key in children) {
            const value = children[key];
            slot[key] = (props) => normalizeSlotsValue(value(props));
        }
        instance.slots = slot;
    }
}
function normalizeSlotsValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    console.log("调试====", parent);
    const component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        provides: parent ? parent.provides : {},
        parent,
        slot: {},
        isMounted: false,
        subTree: {},
        emit: () => { },
    };
    component.emit = emit.bind(null, component); //拿到instance
    return component;
}
function setComponentInstance(instance) {
    // initProps
    // initSlots
    initSlots(instance, instance.vnode.children);
    initProps(instance, instance.vnode.props);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    setCurrentInstance(instance);
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        }); //props在子组件不去改变
        setCurrentInstance(null);
        handelSetupResult(setupResult, instance);
    }
}
function handelSetupResult(setupResult, instance) {
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function render(vnode, container) {
    patch(null, vnode, container, null);
    console.log("render==", vnode, container);
}
function patch(n1, n2, container, parentComponent) {
    // 处理组件
    // 先判断是不是element
    // fragment只渲染children
    const { type, shapeFlags } = n2;
    switch (type) {
        case "Fragment":
            processFragment(n1, n2, container, parentComponent);
            break;
        case "Text":
            processText(n1, n2, container);
            break;
        default:
            if (shapeFlags & 1 /* ELEMENT */) {
                processElement(n1, n2, container, parentComponent);
            }
            else if (shapeFlags & 2 /* STATEFUL_COMPONENT */) {
                processComponent(n1, n2, container, parentComponent);
            }
            break;
    }
}
function processComponent(n1, vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}
function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);
    setComponentInstance(instance);
    setupRenderEffect(instance, container, initialVNode);
}
function setupRenderEffect(instance, container, initialVNode) {
    effect(() => {
        if (!instance.isMounted) {
            const { proxy } = instance;
            console.log("初始化===", proxy);
            const subTree = (instance.subTree = instance.render.call(proxy));
            patch(null, subTree, container, instance);
            initialVNode.el = subTree.el;
            instance.isMounted = true;
        }
        else {
            console.log("update");
            const { proxy } = instance;
            const subTree = instance.render.call(proxy);
            const prevSubTree = instance.subTree;
            instance.subTree = subTree;
            patch(prevSubTree, subTree, container, instance);
            //  更新
        }
    });
}
function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
        // 初始化
        mountElement(n2, container, parentComponent);
    }
    else {
        // 更新
        patchElement(n1, n2);
    }
}
function patchElement(n1, n2, container, parentComponent) {
    console.log("patchElement");
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    const el = (n2.el = n1.el);
    patchProp(el, oldProps, newProps);
}
function patchProp(el, oldProps, newProps) {
    // 遍历新的props
    for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        console.log("111", prevProp, nextProp);
        // 如果props不想等就准备更新
        if (prevProp !== nextProp) {
            hostPatchProp(el, key, prevProp, nextProp);
        }
    }
}
function mountElement(vnode, container, parentComponent) {
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, props, shapeFlags } = vnode;
    if (shapeFlags & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlags & 8 /* ARROW_CHILDREN */) {
        mountChild(children, el, parentComponent);
    }
    for (const key in props) {
        const value = props[key];
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, value);
        }
        else {
            el.setAttribute(key, value);
        }
    }
    container.appendChild(el);
}
function mountChild(vnode, container, parentComponent) {
    console.log("mountChild", vnode);
    if (Array.isArray(vnode)) {
        vnode.forEach((el) => {
            patch(null, el, container, parentComponent);
        });
    }
}
function processFragment(n1, vnode, container, parentComponent) {
    mountChild(vnode, container, parentComponent);
}
function processText(n1, vnode, container) {
    //  只渲染文字
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
}
function createRender(options) { }

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlags: getShapeFlags(type),
        el: null,
    };
    // children 位运算符
    if (typeof children === "string") {
        vnode.shapeFlags |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlags |= 8 /* ARROW_CHILDREN */;
    }
    // 组件 slot
    if (vnode.shapeFlags & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlags |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVnode(text) {
    return createVnode('Text', {}, text);
}
function getShapeFlags(type) {
    return typeof type === "string"
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换成虚拟节点
            // 所有节点都基于虚拟节点
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlot(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVnode("Fragment", {}, slot(props));
        }
    }
}

// 存
function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        console.log("存provides====", currentInstance);
        const parentProviders = currentInstance.parent && currentInstance.parent.provides;
        if (provides === parentProviders) {
            provides = currentInstance.provides = Object.create(parentProviders);
        }
        provides[key] = value;
    }
}
// 取
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    console.log("inject=====parentProviders", currentInstance);
    if (currentInstance) {
        const { parent } = currentInstance;
        const parentProviders = parent.provides;
        if (key in parentProviders) {
            return parentProviders[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

class RefImpl {
    constructor(value) {
        this._v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        //   判断对象是不是对象
        this.dep = new Set();
    }
    set value(newValue) {
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
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}

export { createApp, createRender, createTextVnode, getCurrentInstance, h, inject, provide, ref, renderSlot };
