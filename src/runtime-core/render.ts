import { isObject } from "../reactivity/shared/index";
import { ShapeFlags } from "../shared/sharedFlags";
import { createComponentInstance, setComponentInstance } from "./component";

export function render(vnode, container) {
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
      if (shapeFlags & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
      } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
      }
      break;
  }

  console.log("vnode===", vnode.type);
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}
function mountComponent(initialVNode: any, container: any) {
  const instance = createComponentInstance(initialVNode);
  setComponentInstance(instance);
  setupRenderEffect(instance, container, initialVNode);
}

function setupRenderEffect(instance: any, container: any, initialVNode: any) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  patch(subTree, container);
  initialVNode.el = subTree.el;
}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, props, shapeFlags } = vnode;
  if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlags & ShapeFlags.ARROW_CHILDREN) {
    mountChild(children, el);
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
function mountChild(vnode: any, container: any) {
  console.log("mountChild", vnode);
  if (Array.isArray(vnode)) {
    vnode.forEach((el) => {
      patch(el, container);
    });
  }
}
function processFragment(vnode: any, container: any) {
  mountChild(vnode, container);
}
function processText(vnode: any, container: any) {
  //  只渲染文字
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}
