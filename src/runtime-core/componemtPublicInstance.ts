
const publicProxyMaps = {
    $el: (instance) => instance.vnode.el 
}
export const publicInstanceProxyHandler = {
  get({_:instance}, key) {
    if (key in instance.setupState) {
      return instance.setupState[key];
    }
        const publicGetter = publicProxyMaps[key];
        if (publicGetter) {
            return publicGetter(instance)
        }
  },
};
