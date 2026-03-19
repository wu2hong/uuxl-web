# uuxl-cn（uni-app-x）

以 **H5 + 微信小程序** 为主的 uni-app-x 项目，包含资讯、聊天、个人三个业务模块，以及登录/退出能力。

---

## 功能模块

| 模块 | 页面 | 说明 |
|------|------|------|
| 资讯 | `pages/news/list` | 读取后端 API 纯展示，无需登录 |
| 聊天 | `pages/chat/chat` | 标准聊天窗口，支持文字与图片发送，需登录 |
| 个人 | `pages/profile/profile` | 展示个人信息、退出登录，需登录 |
| 首页 | `pages/index/index` | 入口导航，跳转至上述三个模块 |

- **登录**：未登录时点击聊天/个人会弹出登录框，输入用户名密码后调用后端接口，成功后可进入对应页面
- **退出**：个人页底部有「退出登录」，确认后调用后端接口并跳转至资讯页

---

## 项目结构

根目录保留 uni-app-x 标准入口（便于 XBuilder 识别），业务共享代码集中在 `src/`。

```text
uuxl-cn/
├── App.uvue
├── main.uts
├── manifest.json
├── pages.json
├── uni.scss
├── vite.config.ts
├── index.html
│
├── pages/
│   ├── index/index.uvue      # 首页入口
│   ├── news/list.uvue        # 资讯列表
│   ├── chat/chat.uvue        # 聊天
│   └── profile/profile.uvue  # 个人信息
│
├── src/
│   ├── api/                  # 接口封装
│   │   ├── auth.uts          # 登录/退出、token 读写
│   │   ├── news.uts
│   │   ├── chat.uts
│   │   └── user.uts
│   │
│   ├── components/           # 公共组件
│   │   ├── BottomNav.uvue    # 底部导航
│   │   ├── PageHeader.uvue   # 自定义头部（聊天/个人页）
│   │   ├── LoginModal.uvue   # 登录弹窗
│   │   └── ConfirmModal.uvue # 确认弹窗（退出等）
│   │
│   ├── constants/
│   │   ├── storage.uts       # 本地存储 key
│   │   └── route.uts         # 页面路径常量
│   │
│   ├── core/
│   │   ├── config.uts        # 配置、端点、endpointOf()
│   │   ├── http.uts          # 请求封装、重试、resolveHttpError
│   │   ├── storage.uts       # getObject/setObject
│   │   ├── auth-modal.uts    # 登录弹窗全局状态
│   │   ├── chat-storage.uts  # 聊天消息持久化（版本+迁移+上限）
│   │   ├── mock.uts          # Mock 接口实现
│   │   └── mock-bootstrap.uts
│   │
│   ├── styles/
│   │   ├── common.scss       # 全局 token、基础类
│   │   └── tokens-guide.md  # 样式规范
│   │
│   ├── shims/
│   │   ├── vue.ts            # H5 兼容层（内部 Vue 符号）
│   │   └── vue-runtime.d.ts
│   │
│   └── types/
│       └── api.uts           # 接口返回类型
│
├── static/                   # 静态资源
└── scripts/
    └── postinstall.mjs       # 安装后补齐 uni-app-x 运行时
```

---

## 依赖与版本

已统一为一组兼容版本，避免白屏/导出不一致：

- `@dcloudio/vite-plugin-uni`: `3.0.0-5000420260318001`
- `@dcloudio/uni-app`: `3.0.0-5000420260318001`
- `@dcloudio/uni-components`: `3.0.0-5000420260318001`
- `vite`: `5.2.8`
- `vue`: `3.4.21`

---

## 配置说明

### 接口与 Mock

统一在 `src/core/config.uts` 配置：

- `USE_MOCK`: `true/false`（后端未就绪时打开即可体验）
- `BASE_URL`: 后端域名
- `ENDPOINTS.*`: 各接口路径（含 login、logout、newsList、chatSendText、chatSendImage、profile）

Mock 数据在 `src/core/mock.uts`、`src/core/mock-bootstrap.uts`。

### 网络层与认证

网络层在 `src/core/http.uts`：

- 自动读取本地 `token`（`STORAGE_KEYS.token`）并附带 `Authorization`
- URL 拼接统一处理，避免路径斜杠问题
- 请求失败自动重试（网络/超时/5xx，最多 2 次）
- `resolveHttpError(err)` 将错误映射为可展示文案

### 登录与退出

- 登录：`src/api/auth.uts` 的 `login()`，成功后 `setToken()` 写入本地
- 退出：`logout()` 调用后端，成功后 `clearToken()` 并跳转资讯页
- H5 端退出使用 `window.location.replace` 确保跳转生效；非 H5 使用 `uni.reLaunch`

### 聊天会话持久化

`src/core/chat-storage.uts`：

- 消息历史带版本号，支持未来字段迁移
- 最大缓存条数 `MAX_CHAT_MESSAGES`（默认 500）
- 输入草稿 `STORAGE_KEYS.chatDraft`
- 切页返回后自动恢复历史与草稿

### UTS 代码结构规范

- 配置与端点：`config.uts` + `endpointOf()`
- 路由：`constants/route.uts` 的 `ROUTES`，避免路径硬编码
- 网络：`http.uts` 统一封装
- 存储：`storage.uts`、`chat-storage.uts`
- API：`api/*` 仅负责业务接口入参与响应映射

### 样式 token 规范

统一在 `src/styles/common.scss` 维护 token，详见 `src/styles/tokens-guide.md`。

---

## 开发与打包

### 安装依赖

```bash
npm install
```

### 开发调试（Cursor + XBuilder）

- 在 Cursor 中编辑代码，用 XBuilder 运行调试
- 入口文件保持在根目录，XBuilder 可识别

修改 `pages.json` 后若无法跳转：**停止运行并重新运行**（或清理 `unpackage/` 后再运行）。

### 命令行

| 平台 | 开发 | 打包 |
|------|------|------|
| H5 | `npm run dev:h5` | `npm run build:h5` |
| 微信小程序 | `npm run dev:mp-weixin` | `npm run build:mp-weixin` |

### 为什么有 `postinstall`

uni-app-x 的 `vite-plugin-uni` 会解析 `@dcloudio/uni-app/dist-x/uni-app.es.js`，部分版本缺少该文件，`scripts/postinstall.mjs` 做兜底复制。

### 为什么有 `src/shims/vue.ts`

uni-app-x 的 H5 运行时代码会从 `vue` 导入内部符号（如 `injectHook`），Vue 正式导出中不存在，通过 `vite.config.ts` 别名将 `vue` 指向 `src/shims/vue.ts` 做兼容。

---

## 平台差异

- **聊天/个人页**：使用 `navigationStyle: "custom"` 隐藏系统导航栏，自定义 `PageHeader` 展示标题，避免 H5 默认返回按钮导致 URL 变动但页面不刷新的问题
- **退出**：H5 使用 `window.location.replace` 确保跳转；非 H5 使用 `uni.reLaunch`
