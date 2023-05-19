## cube-diary

![](https://img.shields.io/npm/v/cube-diary)

一个简单扁平的桌面 / 移动端记事本。基于 react / koa2 / sqlite / typescript / antd。

<details>
    <summary style="cursor:pointer">查看桌面端截图</summary>
    <a href="https://imgse.com/i/p9hgbUf"><img src="https://s1.ax1x.com/2023/05/19/p9hgbUf.png" alt="登录"></a>
    <a href="https://imgse.com/i/p9hgX8g"><img src="https://s1.ax1x.com/2023/05/19/p9hgX8g.png" alt="日记列表"></a>
    <a href="https://imgse.com/i/p9hgj2Q"><img src="https://s1.ax1x.com/2023/05/19/p9hgj2Q.png" alt="日记编辑"></a>
    <a href="https://imgse.com/i/p9hgOPS"><img src="https://s1.ax1x.com/2023/05/19/p9hgOPS.png" alt="搜索"></a>
</details>

<details>
    <summary style="cursor:pointer">查看移动端截图</summary>
    <div style="display: flex; align-items: center;">
        <a href="https://imgse.com/i/p9hgTbt"><img src="https://s1.ax1x.com/2023/05/19/p9hgTbt.png" alt="移动端登录"></a>
        <a href="https://imgse.com/i/p9hgHVP"><img src="https://s1.ax1x.com/2023/05/19/p9hgHVP.png" alt="移动端日记列表"></a>
        <a href="https://imgse.com/i/p9hgIKA"><img src="https://s1.ax1x.com/2023/05/19/p9hgIKA.png" alt="移动端日记编辑"></a>
        <a href="https://imgse.com/i/p9hgoDI"><img src="https://s1.ax1x.com/2023/05/19/p9hgoDI.png" alt="移动端搜索"></a>
    </div>
</details>

## 特性

- 🚫 无广告、无收费、完全开源，自己的数据自己掌握
- 🚀 极其简单的部署，仅需两行命令
- 🧩 自定义 JSON 导入导出
- 📝 支持 MarkDown 语法，支持实时预览、自动保存、颜色标记
- 🔗 支持笔记内图片、文件上传
- 📱 桌面端 / 移动端全站响应式设计
- 🎯 支持关键字搜索
- 🤖 支持多用户使用
- 🌙 黑夜模式

## 部署

cube-diary 在开发时就以简单部署为目标，不需要配置数据库，不需要安装任何软件。仅需 node（*16+*）环境即可运行。

```bash
# 安装项目
# linux 下安装失败时请尝试 sudo 并在安装命令后追加 --unsafe-perm=true --allow-root 参数
npm install -g cube-diary

# 启动项目
cube-diary run
```

项目启动后将会在当前目录下生成 `config.json`，可以通过修改该文件来对应用进行简单的自定义。

服务将默认开启在端口 3700 上，可以通过 `cube-diary run --port=3701` 修改端口。

*使用 `-h` 参数查看更多配置*

## 数据迁移

所有数据均默认保存在应用目录下的 `.storage` 文件夹里，所以直接将其打包然后复制到其他地方即可。

## 贡献

本项目系本人自用开发，如果你觉得有些功能不够完善，欢迎 PR / issue。

## 许可

本项目源码基于 GPL v3 许可开源，[点此](https://github.com/HoPGoldy/cube-diary/blob/master/LICENSE) 查看更多信息。