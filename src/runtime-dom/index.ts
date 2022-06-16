import { createRender } from "../runtime-core/render";
function createElement(type) {
  return document.createElement(type);
}
function patchProp(el, key, prevValue,nextValue) {
  const isOn = (key) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextValue);
  } else {
    el.setAttribute(key, nextValue);
  }
}
export function hostPatchProp(el, key, prevValue, nextValue) {
  const isOn = (key) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextValue);
  } else {
    el.setAttribute(key, nextValue);
  }
}
function insert(el, parent) {
    parent.appendChild(el);
}

const renderer = createRender({
  createElement,
  patchProp,
  insert,
  hostPatchProp,
});
