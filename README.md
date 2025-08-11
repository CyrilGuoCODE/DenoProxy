# 🌐 Deno Proxy

欢迎使用 **Deno Proxy**！🚀  
这是一个功能强大的代理服务应用，使用 **Deno** 构建，提供现代化的 Web UI 界面和安全的密码保护功能。无论您需要通过代理访问网站，还是转发 API 请求，**Deno Proxy** 都能满足您的需求！

## 📦 特性

- **🎨 现代化 UI**: 提供美观、响应式的 Web 界面，支持移动端访问
- **🔐 密码保护**: 支持环境变量配置密码，保护 API 和界面访问
- **🌐 完整代理**: 将以 `/proxy` 开头的请求转发到指定的目标 URL，支持完整的网站代理
- **⚡ 实时访问**: 在界面中直接访问目标网站，所有流量通过代理转发
- **🔗 链接重写**: 自动处理相对链接，确保代理网站正常工作
- **📱 响应式设计**: 完美适配桌面和移动设备
- **🚀 会话管理**: 安全的会话管理，支持自动过期

## 🚀 快速开始

### 1. 克隆项目

通过以下命令克隆仓库并进入项目目录：

```bash
git clone https://github.com/pwh-pwh/DenoProxy.git
cd deno-proxy
```

### 2. 运行代理服务器

确保已安装 **Deno**。如果没有安装，可以从 [deno.land](https://deno.land/) 获取并安装。  

#### 本地开发

然后，使用以下命令运行代理服务器：

```bash
deno run --allow-net --allow-env --unstable-kv main.ts
```

此命令会启动代理服务器并监听 `8000` 端口。

#### 环境变量配置

可选：设置管理员密码来保护服务访问

```bash
export ADMIN_PASSWORD="your-secure-password"
deno run --allow-net --allow-env --unstable-kv main.ts
```

如果不设置 `ADMIN_PASSWORD` 环境变量，服务将无需密码即可访问。

### 3. 部署应用

有两种方式实现部署：

1. **使用 deployctl**：
   ```bash
   deno install -A jsr:@deno/deployctl --global
   deployctl deploy
   ```

2. **通过 Deno Deploy 控制台**：
   - Fork 本项目
   - 进入 [Deno Deploy 控制台](https://dash.deno.com/)
   - 连接 GitHub 仓库进行部署
   - 在环境变量中设置 `ADMIN_PASSWORD`（可选）

### 4. 使用代理服务器

#### 🎨 Web UI 界面

访问 `http://localhost:8000/` 打开现代化的 Web 界面：

1. **设置代理目标**：在输入框中输入要代理的网站 URL
2. **访问网站**：点击"访问网站"按钮直接在界面中浏览目标网站
3. **安全访问**：如果设置了密码，需要先通过身份验证

#### 🔄 API 方式使用

仍然支持传统的 API 方式：

**设置代理目标**：
```bash
curl -X POST http://localhost:8000/ \
  -d "action=set&targetUrl=https://example.com"
```

**通过代理访问**：
```bash
curl http://localhost:8000/proxy/some/path
```

#### 🌍 向后兼容

仍然支持旧的 URL 参数方式：
```bash
http://localhost:8000/?setUrl=https://example.com
```

## 📚 API 参考

### 1. Web UI 界面

- **主页**: `/` - 现代化的代理设置和访问界面
- **登录页**: `/login` - 密码保护的登录界面（仅在设置密码时显示）

### 2. POST `/`

设置代理目标或访问网站：

**参数**：
- `targetUrl`: 目标网站 URL
- `action`: `set`（设置）或 `visit`（访问）

### 3. `/proxy/*` 路径

所有以 `/proxy` 开头的请求都会被转发到设置的目标 URL，支持：
- 完整的 HTML 页面代理
- 静态资源代理（CSS、JS、图片等）
- 相对链接自动重写
- 表单提交和 AJAX 请求

### 4. `?setUrl=TARGET_URL`（向后兼容）

使用此端点来设置或更改代理目标 URL。所有访问 `/proxy` 的请求都会转发到此 URL。

**示例**：
```bash
http://localhost:8000/?setUrl=https://example.com
```

## 🔐 安全特性

### 密码保护

通过设置 `ADMIN_PASSWORD` 环境变量启用密码保护：

```bash
export ADMIN_PASSWORD="your-secure-password"
```

启用后：
- 访问任何页面都需要先登录
- 会话有效期为 24 小时
- 使用 HttpOnly Cookie 存储会话信息
- 自动重定向到登录页面

### 会话管理

- 使用 Deno KV 存储会话信息
- 会话自动过期（24 小时）
- 安全的 UUID 会话令牌
- 支持会话验证和清理

## 📁 项目结构

```
deno-proxy/
├── main.ts          # 代理服务器代码
├── deno.json        # Deno 配置文件
├── README.md         # 这份超棒的文档！
├── LICENSE          # MIT 许可证
└── ...
```

## 🛠️ 使用的技术

- **Deno**: 一个用于 JavaScript 和 TypeScript 的安全运行时。
- **Deno KV**: 用于存储代理目标和会话信息。
- **现代 CSS**: 响应式设计，支持深色模式和动画效果。
- **原生 JavaScript**: 无需额外依赖的前端交互。

## 🔑 权限

服务器需要以下权限：

- **`--allow-net`**: 允许网络访问（用于转发请求）。
- **`--allow-env`**: 允许读取环境变量（用于密码配置）。
- **`--unstable-kv`**: 启用 Deno KV 功能（用于存储数据）。

## 🌟 新功能亮点

### 🎨 现代化 UI
- 渐变背景和圆角设计
- 平滑的悬停动画效果
- 响应式布局，完美适配移动设备
- 直观的表单和按钮设计

### 🔐 安全增强
- 可选的密码保护功能
- 安全的会话管理
- HttpOnly Cookie 防止 XSS 攻击
- 会话自动过期机制

### 🌐 完整代理体验
- 在界面中直接浏览目标网站
- 自动处理相对链接重写
- 支持表单提交和 JavaScript
- 沙盒化的 iframe 环境

### 📱 用户体验
- 一键设置和访问
- 实时错误提示和成功反馈
- 当前代理目标显示
- 功能特性列表展示

## 🤝 贡献

欢迎随时 fork 本仓库、提交问题或 Pull Request。您的贡献是我们不断改进的动力！

## 📜 许可证

本项目使用 [MIT 许可证](LICENSE) 进行授权。

---

## 🖼️ 使用预览

### 1. 主界面
![主界面](https://img.shields.io/badge/UI-现代化界面-brightgreen?style=for-the-badge)

访问主页后，您将看到：
- 🌐 现代化的渐变背景设计
- 📝 简洁的 URL 输入表单
- 🔗 "设置代理" 和 "访问网站" 两个操作按钮
- ✨ 当前代理目标显示区域

### 2. 密码保护（可选）
![密码保护](https://img.shields.io/badge/Security-密码保护-red?style=for-the-badge)

如果设置了 `ADMIN_PASSWORD`：
- 🔐 首次访问显示登录界面
- 🚀 输入正确密码后进入主界面
- ⏰ 会话保持 24 小时有效

### 3. 网站代理
![网站代理](https://img.shields.io/badge/Proxy-完整网站代理-blue?style=for-the-badge)

点击 "访问网站" 后：
- 🖥️ 在 iframe 中显示目标网站
- 🔄 所有请求通过代理服务器转发
- 🔗 自动处理页面内的链接重写
- ❌ 提供关闭按钮返回主界面