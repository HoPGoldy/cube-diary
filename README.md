## cube-diary

![](https://img.shields.io/npm/v/cube-diary)

一个简单扁平的桌面 / 移动端记事本。基于 react / koa2 / sqlite / typescript / antd。

<details>
    <summary style="cursor:pointer">查看桌面端截图</summary>
    <a href="https://imgse.com/i/p9gfefJ"><img src="https://s1.ax1x.com/2023/05/15/p9gfefJ.png" alt="p9gfefJ.png"></a>
    <a href="https://imgse.com/i/p9gfTNF"><img src="https://s1.ax1x.com/2023/05/15/p9gfTNF.png" alt="p9gfTNF.png"></a>
    <a href="https://imgse.com/i/p9gfoAU"><img src="https://s1.ax1x.com/2023/05/15/p9gfoAU.png" alt="p9gfoAU.png"></a>
</details>

<details>
    <summary style="cursor:pointer">查看移动端截图</summary>
    <div style="display: flex; align-items: center;">
        <a href="https://imgse.com/i/p9ghgUO"><img src="https://s1.ax1x.com/2023/05/15/p9ghgUO.png" alt="p9ghgUO.png"></a>
        <a href="https://imgse.com/i/p9ghcVK"><img src="https://s1.ax1x.com/2023/05/15/p9ghcVK.png" alt="p9ghcVK.png"></a>
        <a href="https://imgse.com/i/p9ghyb6"><img src="https://s1.ax1x.com/2023/05/15/p9ghyb6.png" alt="p9ghyb6.png"></a>
    </div>
</details>

## 特性

- 🚫 无广告、无收费、完全开源，自己的数据自己掌握
- 🚀 极其简单的部署，仅需两行命令
- 📝 支持 MarkDown 语法，支持实时预览、自动保存
- 🔗 支持笔记内图片、文件上传
- 📱 桌面端 / 移动端全站响应式设计
- 🎯 支持关键字、标签搜索
- 🧩 支持笔记嵌套、管理、收藏、颜色标记
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