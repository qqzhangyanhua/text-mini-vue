import { hasOwn } from "../shared/sharedFlags";

const publicProxyMaps = {
  $el: (instance) => instance.vnode.el,
  $slots:(instance) => instance.slots,
};
export const publicInstanceProxyHandler = {
  get({ _: instance }, key) {
    if (key in instance.setupState) {
      return instance.setupState[key];
    }
    const { props } = instance;
   
    if (hasOwn(instance.setupState, key)) {
      return instance.setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    const publicGetter = publicProxyMaps[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
