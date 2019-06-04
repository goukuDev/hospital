### 如何启动？

```bash
npm i && npm start
```

### 如何编译？

```bash
npm run build
```

### 如何部署？

```bash
npm run publish #目前默认部署到测试环境
```

### 目录结构

```js
|-- app // electron 代码
|-- config
|-- public
|-- scripts // 启动、编译、部署脚本
|-- src
   |-- components // 公共组件
       |-- utils.js // 公共函数，如：api 、fmtDate 等
       |-- myConstants.js // 常量
   |-- hooks // hooks
   |-- images // 公共图片，可以使用 @images/xxx.png 的方式引入
   |-- pages // 页面
   |-- index.js // 项目入口
   |-- router.js // 路由配置
```

### 其他

1. server proxy 配置见 `package.json -> proxy`
