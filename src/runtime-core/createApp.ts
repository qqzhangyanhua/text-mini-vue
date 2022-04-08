import { render } from "./render";
import { createVnode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 先转换成虚拟节点
      // 所有节点都基于虚拟节点
      const vnode = createVnode(rootComponent);
      render(vnode, rootContainer);
    },
  };
}
