import { createRender } from "../runtime-core/render";
function createElement(type) {
  return document.createElement(type);
}
function patchProp(el, key, value) {
  const isOn = (key) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, value);
  } else {
    el.setAttribute(key, value);
  }
}
function insert(el, parent) {
    parent.appendChild(el);
}

const renderer = createRender({
  createElement,
  patchProp,
  insert,
});
