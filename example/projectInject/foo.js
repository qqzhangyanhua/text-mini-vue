import {
    h,
    inject
  
} from '../../lib/guide.esm.js'
export const Foo = {
    setup(props) {
        const foo = inject('foo')
        const bar = inject('bar')
        console.log('inject==========',foo, bar)
        return {
            name:foo,
            bar:bar,
            name1:123
        }
    },
    render() {
        console.log('fooooooo',bar)
        return h('div', {
            id: 'foo'
        }, `inject:foo${name}`);
    }
}