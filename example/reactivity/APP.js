import {
    h
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
                onClick: () => {
                    console.log('onclick');
                }
            },
            [h('div', {
                id: 'red'
            }, 'red'), h(Foo,{count:1})]
            // 'hello world' + this.name
            // [h('p', {
            //     id: "red",
            //     class:['mo','text']
            // }, '子组件1'), h('p', {
            //     id: "blue"
            // }, '子组件2')]
        );
    },
    setup() {
        return {
            name: 'world12345666'
        }
    }
}