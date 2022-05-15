import {
    h,getCurrentInstance
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
                onAdd(a,v) {
                    console.log('我是APP组件的onAdd事件',a,v);
                },
                onAddFoo(a, v) { 
                    console.log('我是APP组件的onAddFoo事件', a, v);
                }
            })]
        );
    },
    setup() {
        const instance = getCurrentInstance()
        console.log('instanceAPP', instance)
        return {
            name: 'world12345666'
        }
    }
}