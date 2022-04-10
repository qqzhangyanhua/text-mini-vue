import {
    createApp
} from '../../lib/guide.esm.js'
import {
    APP
} from './APP.js'
const rootContainer=document.getElementById('app')
createApp(APP).mount(rootContainer)