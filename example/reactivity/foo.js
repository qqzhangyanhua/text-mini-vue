
import {
    h
} from '../../lib/guide.esm.js'
export const Foo = {
    setup(props) {
        console.log('props', props);
    },
    render() {
        return h('div', {
            id: 'foo'
        }, "foo" + this.count);
    }
}