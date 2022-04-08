import { createComponentInstance, setComponentInstance } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
  console.log("render==", vnode, container);
}
function patch(vnode, container) {
  // 处理组件
  // 先判断是不是element
  processComponent(vnode, container);
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
  const subTree = instance.render();
  patch(subTree, container);
}
