import {
    h
} from '../../lib/guide.esm.js'
export const Foo = {
    setup(props, {
        emit
    }) {
        console.log('props', props);
        const emitAdd = () => {
            console.log('我是emitAdd事件');
            emit('Add', 1, 2)
            emit('add-foo', 3, 4)
        }
        return {
            emitAdd
        }
    },
    render() {
        const btn = h('button', {
            onClick: this.emitAdd
        }, 'emitAdd')
        const foo = h('p', {}, '我是foo组件')
        return h('div', {
            id: 'foo'
        }, [btn, foo]);
    }
}