
import {
    h
} from '../../lib/guid.esm.js'
export const APP = {
    render() {
        return h('div','hello world'+this.name);
    },
    setup() {
        return {
            name: 'world'
        }
    }
}