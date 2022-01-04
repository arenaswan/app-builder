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

## 技术框架

华炎魔方前端使用 React 开发表单、列表视图控件，并基于 [Meteor](https://www.meteor.com/) 实现完整界面。

- [Ant Design ProForm](https://procomponents.ant.design/components/form): 基于 ProForm 开发表单控件，根据自定义对象动态创建表单、操作业务数据。
- [Salesforce Lightning Design System](https://www.lightningdesignsystem.com/): Salesforce 开源的企业软件设计标准和样式库。[React 控件库](https://react.lightningdesignsystem.com/)
- [Tailwind CSS](https://tailwindcss.com/): 直接用class表述样式，而无需编写和维护css文件。
- [AG Grid](https://www.ag-grid.com/): 因为ProTable功能太弱，我们选择 AG Grid 构建列表视图控件。
- [Redash](https://github.com/getredash/redash): 引入Redash部分前端源码，开发查询设计器、图表设计器、仪表盘设计器。
- [Mobx React Lite](https://github.com/mobxjs/mobx-react-lite)：基于Mobx React Lite实现华炎魔方的React Store。

## 源码目录索引

- [Storybook](.storybook)：实现展示 [Storybook](https://storybook.js.org/) 示例。
- [Apps/Charts-Design](apps/charts-design)：基于 [redash](https://github.com/getredash/redash) 的部分源码，实现了华炎魔方 [仪表盘](https://steedos.cn/docs/developer/dashboard) 的设计器。
- [NPM Packages](packages)： 华炎魔方各种React组件包源码，其内每个子文件夹都是一个标准的NPM包。

组件源码在 [NPM Packages](packages) 文件夹内的各个NPM包中，要修改源码调式可以参考以下教程 [运行Storybook](#运行Storybook) 或 [运行WebApp]((#运行WebApp)) 来调式源码。

## 运行Storybook

在项目根目录按以下步骤指示可以运行一个 [Storybook](https://storybook.js.org/) 服务。

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

接下来执行以下命令来运行项目。

```shell
yarn start
```

等待几分钟，当服务成功跑起来后会自动打开浏览器访问服务地址： <http://localhost:6006/>。

## 运行WebApp

按以下步骤指示可以运行源码在`packages/react-webapp`目录中的React Web APP，这是一个包括登录界面在内的可独立运行的连接华炎魔方平台的React应用。

### 配置WebApp连接的服务地址

假设我们需要连接到的华炎魔方服务地址为`http://localhost:5000`。

请在`packages/react-webapp`中创建一个`.env.local`文件，输入以下内容把华炎魔方服务地址配置为环境变量。

```shell
REACT_APP_API_URL=http://localhost:5000
```

### 安装相关依赖包

请打开命令行窗口并在根目录分别执行以下命令来安装项目依赖包。

```shell
yarn
cd packages/react-webapp
yarn
```

### 运行React WebApp

接下来执行以下命令来运行React WebApp。

```shell
yarn start
```

等待几分钟，当服务成功跑起来后会自动打开浏览器访问服务地址： <http://localhost:3000/>。
