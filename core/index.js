import {
    effectWatcher
} from './reactivity/index'
export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const context = rootComponent.setup()
            effectWatcher(() => {
                const element = rootComponent.render(context)
                rootContainer.appendChild(element)
            })

        }
    }
}