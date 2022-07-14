import { reactive } from "../reactive";

describe('reactive',()=>{
    it('should create',()=>{
        const original ={foo: 'bar'};
        const observed = reactive(original) as any;
        expect(observed).not.toBe(original);
        expect(observed.foo).toBe("bar");
    })
})