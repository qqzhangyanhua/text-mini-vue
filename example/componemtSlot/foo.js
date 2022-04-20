import {
    h,
    renderSlot
} from '../../lib/guide.esm.js'
export const Foo = {
    setup() {},
    render() {
        console.log('slots', this.$slots)
        const foo = h('p', {}, 'p元素foo')
        //  renderSlot(this.$slots, "footer")
        return h('div', {}, [renderSlot(this.$slots, "header",{age:18}), foo,])

    }
}