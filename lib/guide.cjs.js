'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

function createComponentInstance(vnode) {
    const component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
    };
    return component;
}
function setComponentInstance(instance) {
    // initProps
    // initSlots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({}, {
        get(target, key) {
            if (key in instance.setupState) {
                return instance.setupState[key];
            }
        },
    });
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
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

function render(vnode, container) {
    patch(vnode, container);
    console.log("render==", vnode, container);
}
function patch(vnode, container) {
    // 处理组件
    // 先判断是不是element
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
    console.log("vnode===", vnode.type);
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setComponentInstance(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    console.log("subTree====", proxy);
    patch(subTree, container);
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const { children, props } = vnode;
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChild(children, el);
    }
    for (const key in props) {
        const value = props[key];
        el.setAttribute(key, value);
    }
    container.appendChild(el);
}
function mountChild(vnode, container) {
    console.log('mountChild', vnode);
    vnode.forEach((el) => {
        patch(el, container);
    });
}

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
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

exports.createApp = createApp;
exports.h = h;
