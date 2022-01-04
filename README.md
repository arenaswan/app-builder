<p align="center">
  <a href="https://www.steedos.cn">
    <img alt="Steedos" src="https://steedos.github.io/assets/logo.png" width="80" />
  </a>
</p>
<h1 align="center">
  华炎魔方前端控件
</h1>

<p align="center">
<a href="https://github.com/steedos/steedos-platform/">华炎魔方</a>
<a href="https://www.steedos.cn/"> · 文档</a>
<a href="https://github.com/steedos/app-builder/issues"> · 报告错误</a>
<a href="https://community.steedos.cn/"> · 社区</a>
</p>

<p align="center">

华炎魔方是Salesforce低代码平台的开源替代方案，华炎魔方将低代码技术与企业业务场景结合，助力企业在最短时间内开发数字化解决方案，包括数据建模、权限控制、流程审批、统计分析、应用集成，并可以编写“高代码”实现高级业务逻辑。

<h3 align="center">
 🤖 🎨 🚀
</h3>

## 源码目录索引

[Storybook](.storybook)：实现展示 [Storybook](https://storybook.js.org/) 示例。
[Github/Workflows](apps/charts-design)：基于 [redash](https://github.com/getredash/redash) 的部分源码，实现了华炎魔方 [仪表盘](https://steedos.cn/docs/developer/dashboard) 的设计器。
[NPM Packages](packages)： 华炎魔方各种React组件包源码，其内每个子文件夹都是一个标准的NPM包。

## 运行

### 配置华炎魔方服务地址

假设我们需要连接到的华炎魔方服务地址为`http://localhost:5000`。

请在根目录创建一个`.env.local`文件，输入以下内容把华炎魔方服务地址配置为环境变量。

```shell
REACT_APP_API_URL=http://localhost:5000
```

### 安装依赖包

请打开命令行窗口并在根目录执行以下命令来安装项目依赖包。

```shell
yarn
```

### 运行项目

请在根目录执行以下命令来运行项目。

```shell
yarn start
```

等待几分钟，当服务成功跑起来后会自动打开浏览器访问服务地址： <http://localhost:6006/>。

我们可以在浏览器中看到跑起来的是一个 [Storybook](https://storybook.js.org/) 服务。
