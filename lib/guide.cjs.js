'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const publicProxyMaps = {
    $el: (instance) => instance.vnode.el
};
const publicInstanceProxyHandler = {
    get({ _: instance }, key) {
        if (key in instance.setupState) {
            return instance.setupState[key];
        }
        const publicGetter = publicProxyMaps[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

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
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandler);
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
    const { type, shapeFlags } = vnode;
    if (shapeFlags & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlags & 2 /* STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
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
        el.setAttribute(key, value);
    }
    container.appendChild(el);
}
function mountChild(vnode, container) {
    console.log("mountChild", vnode);
    vnode.forEach((el) => {
        patch(el, container);
    });
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
    return vnode;
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

exports.createApp = createApp;
exports.h = h;
