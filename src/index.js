const {
    reactive,
    effect
} = require('@vue/reactivity');

// 声明一个响应式对象
let a = reactive({
    value:10
});
let b
effect(() => {
    // 上来就会执行1次
    b = a.value + 1000;
    console.log(b);
})
a.value = 20   //effect还会再次执行