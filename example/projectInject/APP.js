import {
    h,
    provide
} from '../../lib/guide.esm.js'
import {
    Foo
} from './foo.js'
export const APP = {
    render() {
        window.self = this;

        return h('div', {
                id: 'app111',
                class: 'name',
            },
            [h('div', {
                id: 'red'
            }, '测试emit功能'), h(Foo, {
                onAdd(a, v) {
                    console.log('我是APP组件的onAdd事件', a, v);
                },
                onAddFoo(a, v) {
                    console.log('我是APP组件的onAddFoo事件', a, v);
                }
            })]
        );
    },
    setup() {
        provide('foo', 'foo111')
        provide('bar', 'bar2222')
        return {
            name: 'world12345666'
        }
    }
}