# cube-diary

![Docker Image Version](https://img.shields.io/docker/v/hopgoldy/cube-diary)
![Docker Image Size](https://img.shields.io/docker/image-size/hopgoldy/cube-diary)

cube-diary 是基于 nodejs 开发的全栈项目，致力于为个人打造轻量级的 web note 服务。基于 react / fastify / sqlite / typescript 开发。

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

## cube-diary docker 容器使用

- `FRONTEND_BASE_URL` 参数用于指定应用部署到的路径，例如想要部署到 `https://your-domain/my-sso/`，那么该参数就需要配置为 `/my-sso/`。
- `BACKEND_JWT_SECRET` 参数用于指定应用的 jwt 密钥，不配置的话，每次重启应用都会生成一个新的密钥。

```
docker run -d \
  --restart=always \
  -p 9736:3499 \
  -v cube-diary-storage:/app/packages/backend/storage \
  -e FRONTEND_BASE_URL=/cube-diary/ \
  -e BACKEND_JWT_SECRET=V1StGXR8_Z5jdHi6B-myT \
  hopgoldy/cube-diary:0.1.1
```

## 初始化安装

1、安装依赖：

```sh
pnpm install
```

2、初始化后端开发数据库：

```sh
pnpm init:dev
```

## 启动项目

启动后端服务：

```sh
pnpm start:backend
```

启动前端服务：

```sh
pnpm start:frontend
```

然后访问前端服务的地址即可。

## 本地配置

如果需要自定义本地环境变量配置的话，可以进入对应的项目仓库，例如 `packages/frontend` 或者 `packages/backend`，将 `.env` 文件复制一份 `.env.local`，并填写其中参数。

`.env.local` 的配置会覆盖默认的 `.env`。

## 本地 docker 构建

镜像构建：

```sh
# 在根目录下构建即可
docker build -t cube-diary:local .
```

容器启动：

```sh
docker run -p 3001:3499 cube-diary:local
```

## 数据迁移

所有数据均默认保存在应用目录下的 `packages/backend/storage` 文件夹里，所以直接将其打包然后复制到其他地方即可。

## 许可

本项目源码基于 GPL v3 许可开源，[点此](https://github.com/HoPGoldy/cube-diary/blob/master/LICENSE) 查看更多信息。

todo 侧边栏空状态处理
