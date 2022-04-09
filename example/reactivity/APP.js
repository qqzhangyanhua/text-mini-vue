import {
    h
} from '../../lib/guide.esm.js'
export const APP = {
    render() {
        return h('div', {
                id: 'app111',
                class: 'name'
            },
            // 'hello world' + this.name
            [h('p', {
                id: "red"
            }, '子组件1'), h('p', {
                id: "blue"
            }, '子组件2')]
        );
    },
    setup() {
        return {
            name: 'world'
        }
    }
}