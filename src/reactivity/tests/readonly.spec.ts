import { isReadOnly, readonly, isProxy } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    // no set

    const origin = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(origin);
    expect(wrapped).not.toBe(origin);
    expect(wrapped.foo).toBe(1);
    expect(isReadOnly(wrapped)).toBe(true);
    expect(isProxy(wrapped)).toBe(true);
  });
  it("set warning", () => {
    console.warn = jest.fn();
    const user = readonly({ age: 2 });
    user.age = 3;
    expect(console.warn).toBeCalled();
  });
});
