const extend = Object.assign;
function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

// 依赖收集
const targetMap = new Map();
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

function createComponentInstance(vnode) {
    const component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slot: {},
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
    currentInstance = instance;
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        }); //props在子组件不去改变
        currentInstance = null;
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

function render(vnode, container) {
    patch(vnode, container);
    console.log("render==", vnode, container);
}
function patch(vnode, container) {
    // 处理组件
    // 先判断是不是element
    // fragment只渲染children
    const { type, shapeFlags } = vnode;
    switch (type) {
        case "Fragment":
            processFragment(vnode, container);
            break;
        case "Text":
            processText(vnode, container);
            break;
        default:
            if (shapeFlags & 1 /* ELEMENT */) {
                processElement(vnode, container);
            }
            else if (shapeFlags & 2 /* STATEFUL_COMPONENT */) {
                processComponent(vnode, container);
            }
            break;
    }
    console.log("vnode===", vnode.type);
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setComponentInstance(instance);
    setupRenderEffect(instance, container, initialVNode);
}
function setupRenderEffect(instance, container, initialVNode) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    initialVNode.el = subTree.el;
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, props, shapeFlags } = vnode;
    if (shapeFlags & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlags & 8 /* ARROW_CHILDREN */) {
        mountChild(children, el);
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
function mountChild(vnode, container) {
    console.log("mountChild", vnode);
    if (Array.isArray(vnode)) {
        vnode.forEach((el) => {
            patch(el, container);
        });
    }
}
function processFragment(vnode, container) {
    mountChild(vnode, container);
}
function processText(vnode, container) {
    //  只渲染文字
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
}

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

export { createApp, createTextVnode, getCurrentInstance, h, renderSlot };
