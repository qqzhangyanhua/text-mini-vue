import { effect } from "../reactivity/effect";
import { isObject } from "../reactivity/shared/index";
import { hostPatchProp } from "../runtime-dom";
import { ShapeFlags } from "../shared/sharedFlags";
import { createComponentInstance, setComponentInstance } from "./component";

export function render(vnode, container) {
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
  console.log("patchElement");
  const oldProps = n1.props || {};
  const newProps = n2.props || {};
  const el = (n2.el = n1.el);
  patchChildren(n1,n2)
  patchProp(el,oldProps, newProps);
}
function patchChildren(n1, n2) {
  const {shapeFlag} = n2.shapeFlag;
  const {prevShapeFlag} = n1.shapeFlag;
  if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
     if(prevShapeFlag & ShapeFlags.ARROW_CHILDREN){
      //  把老的清空
      unMountChildren(n1.children)
     }
  }


}
function unMountChildren(children){
    for(let i =0;i< children.length;i++){
      const el=children[i].el;
      // hostRemove(el);
    }
}
function patchProp(el,oldProps, newProps) {
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
  for (const key in oldProps) {
    // 如果不在新的props就需要删除当前熟悉
    if(!(key in newProps)){
      hostPatchProp(el, key, oldProps[key], null);

    }
  }
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
