export function createComponentInstance(vnode) {
  const component = {
    vnode: vnode,
    type: vnode.type,
    setupState: {},
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
  instance.proxy = new Proxy(
    {},
    {
      get(target, key) {
        if (key in instance.setupState) {
          return instance.setupState[key];
        }
      },
    }
  );
  const { setup } = Component;
  if (setup) {
    const setupResult = setup();
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
