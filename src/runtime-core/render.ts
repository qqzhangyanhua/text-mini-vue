import { isObject } from "../reactivity/shared/index";
import { createComponentInstance, setComponentInstance } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
  console.log("render==", vnode, container);
}
function patch(vnode, container) {
  // 处理组件
  // 先判断是不是element
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
  console.log("vnode===", vnode.type);
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}
function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode);
  setComponentInstance(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: any, container: any) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy);
  console.log("subTree====", proxy);
  patch(subTree, container);
}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}
function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);
  const { children, props } = vnode;
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) { 
   mountChild(children, el);
  }
  for (const key in props) {
    const value = props[key];
    el.setAttribute(key, value);
  }

  container.appendChild(el);
}
function mountChild(vnode: any, container: any) {
  console.log('mountChild',vnode)
   vnode.forEach((el) => {
     patch(el, container);
   });
}
