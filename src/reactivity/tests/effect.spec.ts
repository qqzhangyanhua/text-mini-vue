import { effect } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it.skip("should", () => {
    const user = reactive({ age: 10 });
      let nextAge;
      effect(() => {
        nextAge = user.age + 1;
      });
      expect(nextAge).toBe(11);
      //   update
      user.age++;
      expect(nextAge).toBe(12);
  });
  it('should effect runner',()=>{
    let foo = 10;
    const runner =effect(() =>{
      foo++
      return 'foo'
    })
    expect(foo).toBe(11);
    const r = runner()

    expect(foo).toBe(12);
    expect(r).toBe("foo")
  })

});
  it("scheduler", () => {
    let dummy;
    let run: any;
    // 通過effect 第二個參數
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // should not run yet
    expect(dummy).toBe(1);
    // manually run
    run();
    // should have run
    expect(dummy).toBe(2);
  });
