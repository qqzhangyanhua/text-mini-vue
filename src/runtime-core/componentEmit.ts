import { camelize, toHandlerKey } from "../shared/sharedFlags";

export function emit(instance, event,...args: any[]): void {
  console.log("event====", event);
  const { props } = instance;
  // TPP
  // 先去写一个特定的行为再去写一个通用的行为

  const handlersName = toHandlerKey(camelize(event));
  const handlers = props[handlersName];
  handlers && handlers(...args);
}
