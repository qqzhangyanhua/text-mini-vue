import { effect } from "../reactivity/effect";
import { isObject } from "../reactivity/shared/index";
import { ShapeFlags } from "../shared/sharedFlags";
import { createComponentInstance, setComponentInstance } from "./component";

export function render( vnode, container) {
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
      if (shapeFlags & ShapeFlags.ELEMENT) {
        processElement(n1, n2, container, parentComponent);
      } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(n1, n2, container, parentComponent);
      }
      break;
  }
}

function processComponent(n1, vnode: any, container: any, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}
function mountComponent(
  initialVNode: any,
  container: any,
  parentComponent: any
) {
  const instance = createComponentInstance(initialVNode, parentComponent);
  setComponentInstance(instance);
  setupRenderEffect(instance, container, initialVNode);
}

function setupRenderEffect(instance: any, container: any, initialVNode: any) {
  effect(() => {
    if (!instance.isMounted) {
      const { proxy } = instance;
      console.log("初始化===", proxy);

      const subTree = (instance.subTree = instance.render.call(proxy));
      patch(null, subTree, container, instance);
      initialVNode.el = subTree.el;
      instance.isMounted = true;
    } else {
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
function processElement(n1, n2: any, container: any, parentComponent) {
  if (!n1) {
    // 初始化
    mountElement(n2, container, parentComponent);
  } else {
    // 更新
    patchElement(n1, n2, container, parentComponent);
  }
}
function patchElement(n1, n2, container, parentComponent) {
  console.log("patchElement")
}
function mountElement(vnode: any, container: any, parentComponent) {
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, props, shapeFlags } = vnode;
  if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlags & ShapeFlags.ARROW_CHILDREN) {
    mountChild(children, el, parentComponent);
  }

  for (const key in props) {
    const value = props[key];
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  container.appendChild(el);
}
function mountChild(vnode: any, container: any, parentComponent) {
  console.log("mountChild", vnode);
  if (Array.isArray(vnode)) {
    vnode.forEach((el) => {
      patch(null, el, container, parentComponent);
    });
  }
}
function processFragment(n1, vnode: any, container: any, parentComponent) {
  mountChild(vnode, container, parentComponent);
}
function processText(n1, vnode: any, container: any) {
  //  只渲染文字
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}

export function createRender(options) {}
