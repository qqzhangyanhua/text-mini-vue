import {
    h,
    getCurrentInstance,
    ref
} from '../../lib/guide.esm.js'
export const Foo = {
    setup(props, {
        emit
    }) {
        const instance = getCurrentInstance()
        console.log('instanceFoo------', instance)
        const emitAdd = () => {
            console.log('我是emitAdd事件');
            // emit('Add', 1, 2)
            // emit('add-foo', 3, 4)
            count.value++
        }
        const count=ref(11)
        return {
            count,
            emitAdd
        }
    },
    render() {
        const btn = h('button', {
            onClick: this.emitAdd
        }, 'emitAdd')
        const foo = h('p', {}, '我是foo组件'+this.count.value)
        return h('div', {
            id: 'foo'
        }, [btn, foo]);
    }
}