

### 初始化项目
解决jest报错 yarn add jest @types/jest --dev

jest 报错需要安装babel并且创建babel.js
yarn add --dev babel-jest @babel/core @babel/preset-env
yarn add --dev @babel/preset-typescript   //支持typescript

```base 测试
import { add } from "../index";
it("init", () => {
  expect(add(1, 2)).toBe(3);
});