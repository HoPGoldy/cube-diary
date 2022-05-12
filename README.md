## cube-diary

一个简单扁平的移动端在线日记本。基于 nextjs / typescript / vant。

## 特性

- 🚫 无广告、无收费、不托管，自己的数据自己掌握
- 📮 自定义 JSON 导入导出
- 📦 可靠的备份功能：定时备份、导入备份、回滚备份
- 🎨 支持图片上传
- 📖 支持 Markdown 编辑
- 👓 支持正序 / 倒序搜索
- 🔨 支持多用户密码登陆及自定义配置
- 🌙 黑夜模式

<div style="display: flex;">
    <img src="https://s1.ax1x.com/2022/05/11/OdpYdg.gif" width="200" title="预览"/>
    <img src="https://s1.ax1x.com/2022/05/11/OdptoQ.gif" width="200" title="图片上传"/>
    <img src="https://s1.ax1x.com/2022/05/11/Odp8L8.gif" width="200" title="导入导出备份"/>
</div>

## 部署

*请确保已安装了 node 16+*

```bash
# 安装依赖
yarn install
# 打包项目
yarn build
```

打包完成后 **将根目录下的 .config.example.json 重命名为 .config.json**，然后修改其中的 `user.username` 和 `user.password`（password 默认应为 6 位）。

修改完成后启动服务即可：

```bash
yarn start
```

服务将默认开启在端口 3000 上，可以通过 `yarn start --port=3549` 修改端口。

## 多用户 & 自定义应用配置

可以通过修改 .config.json 来自定义应用配置。

在 `user` 中创建多个用户后重启服务即可：

```js
{
    "user": [{
        "username": "user1",
        "password": "123456"
    }, {
        "username": "user2",
        "password": "654321"
    }]
}
```

输入密码即可登陆对应的用户，注意，用户数据是和 `user.username` 绑定的，所以可以修改密码，但是不要修改用户名。

在 .config.json 也可以对应用进行自定义，例如可以通过 `appTitle` 来修改应用标题、使用 `passwordLength` 来修改登陆密码长度：

```js
{
    "user": [/** ... */],
    // 修改登录页标题
    "appTitle": "我的日记",
    // 将密码长度修改为 8 位
    "passwordLength": 8
}
```

更详细的配置项见 [types\appConfig.ts](https://github.com/HoPGoldy/cube-diary/blob/master/types/appConfig.ts#L6)。

## 数据迁移

所有数据均保存在应用目录下的 `.storage` 文件夹里，所以直接将其打包然后复制到其他地方即可。

## 贡献

本项目系本人自用开发，如果你觉得有些功能不够完善，欢迎 PR / issue。
## 许可

本项目源码基于 GPL v3 许可开源，[点此](https://github.com/HoPGoldy/cube-diary/blob/master/LICENSE) 查看更多信息。