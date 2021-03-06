import { shallowReadonly } from "../reactivity/reactive";
import { publicInstanceProxyHandler } from "./componemtPublicInstance";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode, parent) {
  console.log("调试====", parent);
  const component = {
    vnode: vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    provides:parent?parent.provides: {},
    parent,
    slot: {},
    isMounted:false,
    subTree:{},
    emit: () => {},
  };
  component.emit = emit.bind(null, component) as any; //拿到instance
  return component;
}
export function setComponentInstance(instance) {
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

function handelSetupResult(setupResult: any, instance: any) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}

let currentInstance = null;
export function getCurrentInstance() {
  return currentInstance;
}
export function setCurrentInstance(instance: any) {
  currentInstance = instance;
}
