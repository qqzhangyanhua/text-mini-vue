import {
    h,
    createTextVnode
} from '../../lib/guide.esm.js'
import {
    Foo
} from './foo.js'
export const APP = {
    render() {
        window.self = this;
        const app = h('div', {
            id: 'app'
        }, 'app')
        const foo = h(Foo, {}, {
            footer: () => [h('p', {}, 'slots111'), createTextVnode('你好呀text节点')],
            header: ({
                age
            }) => h('p', {}, 'slots222' + age)
        })
        // const foo = h(Foo, {}, h('p', {}, 'slots111')) 

        return h('div', {}, [app, foo])
    },
    setup() {
        return {
            name: 'world12345666'
        }
    }
}