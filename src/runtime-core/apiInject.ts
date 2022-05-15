import { getCurrentInstance } from "./component";

// 存
export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();

  if (currentInstance) {
    let { provides } = currentInstance;
    console.log("存provides====", currentInstance);
    const parentProviders =
      currentInstance.parent && currentInstance.parent.provides;
    if (provides === parentProviders) {
      provides = currentInstance.provides = Object.create(parentProviders);
    }
    provides[key] = value;
  }
}
// 取
export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstance();
  console.log("inject=====parentProviders", currentInstance);
  if (currentInstance) {
    const { parent } = currentInstance;
    const parentProviders = parent.provides;
    if (key in parentProviders) {
      return parentProviders[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
