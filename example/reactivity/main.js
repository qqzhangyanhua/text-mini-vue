import {
    createApp
} from '../../lib/guid.esm.js'
import {
    APP
} from './APP.js'
const rootContainer=document.getElementById('app')
createApp(APP).mount(rootContainer)