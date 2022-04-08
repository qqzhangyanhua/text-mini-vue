export function createComponentInstance(vnode) {
  const component = {
      vnode: vnode,
      type: vnode.type,
  };
  return component;
}
export function setComponentInstance(instance) {
  // initProps
  // initSlots
  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
  const Component = instance.type;
  const { setup } = Component;
  if (setup) {
    const setupResult = setup();
    handelSrtupResult(setupResult, instance);
  }
}

function handelSrtupResult(setupResult: any, instance: any) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
    const Component = instance.type
    if (Component.render) {
        instance.render = Component.render
    }
}

