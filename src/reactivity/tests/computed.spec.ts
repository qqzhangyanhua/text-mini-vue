import { computed } from "../computed"
import { reactive } from "../reactive"

// 边写一个测试用例
describe('computed', () => {
    it('computed path', () => { 
        const user = reactive({ age: 11 })
        const age = computed(() => {
            return user.age+1
        })
        expect(age.value).toBe(12)
    })
    it('computed should be lazy', () => {
        const user = reactive({ age: 1 })
        const getter = jest.fn(() => {
            return user.age
        })
        const cValue = computed(getter);
        expect(getter).not.toHaveBeenCalled();
        expect(cValue.value).toBe(1);
        expect(getter).toHaveBeenCalledTimes(1); //调用了多少次
        cValue.value;  //再次触发看是否只调用1次
        expect(getter).toHaveBeenCalledTimes(1);
        user.age = 2;
        expect(cValue.value).toBe(2);

    })
})