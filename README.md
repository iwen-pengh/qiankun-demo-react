

> ####  走起，来吧少年 


### 1、什么情况下要用微前端使用场景

   微前端这个概念已经出来很长时间了，至于概念，再次不在多余去解释，总体来说，目前微前端任然处于一个白花齐放的状态，
   -   [garfish](https://garfish.top/)：字节系微前端开发框架

-   [Single-Spa](https://www.npmjs.com/package/single-spa)：最早的微前端框架，兼容多种前端技术栈。

-   [Qiankun](https://www.npmjs.com/package/qiankun)：基于Single-Spa，阿里系开源微前端框架。

-   [Icestark](https://www.npmjs.com/package/icestark)：阿里飞冰微前端框架，兼容多种前端技术栈。

-   [Ara Framework](https://www.npmjs.com/package/https://ara-framework.github.io/website/docs/quick-start)：由服务端渲染延伸出的微前端 

本文主要通过qiankun的实践，笔者在开发过程中遇到的问题，做一个分享

### 2、手把手撸个例子

- qiankun相关的文档大部分博主，都用Vue作为基座，咋们这次用React 做一个基座来实现
- 通过 create-react-app 创建三个项目 `main` `react1` `react2`
```js 
npx create-react-app main
npx create-react-app react1
npx create-react-app react2
```
- 主项目入口文件改造，通过registerMicroApps 注册微应用
```js
registerMicroApps(
  [
    {
      name: 'react1', // 微应用包名 和  output.library 对应起来
      entry: '//localhost:10001', // 子应用需要设置的端口
      container: '#warp', // 容器ID
      loader,  // 可选，loading 状态发生变化时会调用的方法
      activeRule: '/react1', // URL激活规则
    },
    {
      name: 'react2', // 微应用包名 和  output.library 对应起来
      entry: '//localhost:10002', // 子应用需要设置的端口
      container: '#warp', // 容器ID
      loader,  // 可选，loading 状态发生变化时会调用的方法
      activeRule: '/react2', // URL激活规则
    },
  ],
  
);
```
- 在合适的时候调用start函数
- 微应用创建好后，需要添加 `config-overrides.js`对webpack的配置做一个修改
```js
const path = require("path");
const { name } = require('./package');

module.exports = {
  webpack: (config) => {
    // 微应用的包名，这里与主应用中注册的微应用名称一致
    config.output.library = `${name}-[name]`;
    // 将你的 library 暴露为所有的模块定义下都可运行的方式
    config.output.libraryTarget = "umd";
    // 按需加载相关，设置为 webpackJsonp_react1 即可
    // 官网的例子里面 config.output.jsonpFunction = `webpackJsonp_${name}`;
    // 发现是 `jsonpFunction` 配置在 webpack5 中换成了 `chunkLoadingGlobal`

    config.output.chunkLoadingGlobal = `webpackJsonp_${name}`;
   

    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },

  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      // 关闭主机检查，使微应用可以被 fetch
      // config.disableHostCheck = true;
      // 配置跨域请求头，解决开发环境的跨域问题
      config.headers = {
        "Access-Control-Allow-Origin": "*",
      };
      // 配置 history 模式
      config.historyApiFallback = true;

      return config;
    };
  },
};
```
- 配置端口后 通过  `react-app-rewired`来启动应用，顺利的跑起来了

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f2671c1042a48b186cb825b87898be6~tplv-k3u1fbpfcp-watermark.image?)

- 在react2子项目里面通过 `loadMicroApp` 加载react1
```js
useEffect(() => {
    const microApps = loadMicroApp({
      name: 'react2',
      entry: '//localhost:10001',
      container: '#containerRef',
      props: { brand: 'qiankun' },
    });
    return () => {
      microApps.unmount();
    }
  }, [])
```

- 这样http://localhost:10000/react2 里面包含了两个微应用（多实例场景）在qiankun1.0的时候其实是不支持的

- [代码地址](https://github.com/iwen-pengh/qiankun-demo-react)

### 3、qiankun在项目开发的时候遇到的问题

- 当我们真正自己去写一个例子的时候，你会发现你对他的Api会熟悉很多，那么在实际开发中会遇到什么问题呢？接下来，我将介绍下，我们在接入qiankun的时候遇到的问题


一： 在实际开发中，我们按照官方文档介绍加入了一个传统的jquery项目
```js
const render = $ => {
  $('#purehtml-container').html('Hello, render with jQuery');
  return Promise.resolve();
};

(global => {
  global['purehtml'] = {
    bootstrap: () => {
      console.log('purehtml bootstrap');
      return Promise.resolve();
    },
    mount: () => {
      console.log('purehtml mount');
      return render($);
    },
    unmount: () => {
      console.log('purehtml unmount');
      return Promise.resolve();
    },
  };
})(window);

```

- 顿时发现一堆问题，项目很多全局变量没有拿到，并且点击`onclick`事件都不生效，当我单独运行这个jquery项目的时候，一切正常

- 当我们查询许多资料后，才发现，其实代码都在沙箱里面执行的，var声明的不再是全局变量，function声明的也是，两个js文件之间的这种变量函数无法互相访问，只有挂在window上才可以互相访问

- 于是乎，我花了大量时间去修改，每个依赖文件的里面声明的全局变量，或者function 将他们挂载在 window上，慢慢的修复了所有问题，此时我发现这个也花我大量时间去修改，之前的老代码，对于大的代码修改还特多

- 当我们接入一个传统jQuery项目的时候，还是要慎重考虑下，因为可能对之前项目侵入比较大，改动比较多(更建议用iframe)

二：子项目加载有些慢卡的场景

- 很多场景下，是因为某些历史遗留问题，导致某个项目非常大，有可能这个项目在公司存在了好几年，但是每个月都有新的开发任务去迭代，这时候我们接入了微前端

- 当我们接入的一个非常大的子项目，qiankun第一次加载的时候，我们发现页面加载速度有点慢，毕竟东西比较多，因为 qiankun内部的`import-html-entry`去加载解析这个子项目的过程

- qiankun 将每个子项目的 js/css 文件内容都记录在全局变量中，如果子项目过多，或者文件体积很大，可能会导致内存占用过多，导致页面卡顿。

三：卸载时清空无用实例

- 开发的过程中，在重复加载应用的时候崩溃过几次，因此卸载的实例；

```js
export async function unmount(props) {
    ReactDOM.unmountComponentAtNode();
    // ... more
}
export async function unmount() { 
    instance.$destroy() 
    instance.$el.innerHTML = ''
    instance = null 
    route = null
    // ... more
}
```
 
### 1、结语
- 感谢各位老铁，点赞加关注


