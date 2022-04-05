import { readonly } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    // no set

    const origin = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(origin);
    expect(wrapped).not.toBe(origin);
    expect(wrapped.foo).toBe(1);
  });
});
 