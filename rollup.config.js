import typescript from '@rollup/plugin-typescript'
export default {
    input: './src/index.ts',
    output: [{
            format: 'cjs',
            file: "lib/guide.cjs.js",
        },
        {
            format: 'es',
            file: "lib/guide.esm.js",
        }
    ],
    plugins: [typescript()]
}