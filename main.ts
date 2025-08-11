// 打开 Deno KV（全局只需打开一次）
const kv = await Deno.openKv();
// 使用一个固定的 key 来存储目标 URL
const TARGET_KEY = ["targetUrl"];
const SESSION_KEY = ["session"];

// 从环境变量获取密码配置
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "";
const REQUIRE_AUTH = ADMIN_PASSWORD !== "";

// 生成简单的会话 token
function generateSessionToken(): string {
  return crypto.randomUUID();
}

// 验证会话
async function isValidSession(sessionToken: string): Promise<boolean> {
  if (!REQUIRE_AUTH) return true;
  
  const result = await kv.get([...SESSION_KEY, sessionToken]);
  return result.value !== null;
}

// 创建会话
async function createSession(): Promise<string> {
  const token = generateSessionToken();
  await kv.set([...SESSION_KEY, token], true, { expireIn: 24 * 60 * 60 * 1000 }); // 24小时过期
  return token;
}

// 获取会话 token 从 cookie
function getSessionFromCookie(req: Request): string | null {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

// 生成 HTML 页面
function generateHTML(targetUrl?: string, error?: string, success?: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deno Proxy - 代理服务</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            width: 100%;
            max-width: 500px;
            backdrop-filter: blur(10px);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 48px;
            margin-bottom: 10px;
        }
        
        h1 {
            color: #333;
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .subtitle {
            color: #666;
            font-size: 16px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        
        input[type="url"], input[type="password"] {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #f8f9fa;
        }
        
        input[type="url"]:focus, input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 25px;
        }
        
        button {
            flex: 1;
            padding: 15px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-secondary {
            background: #f8f9fa;
            color: #333;
            border: 2px solid #e1e5e9;
        }
        
        .btn-secondary:hover {
            background: #e9ecef;
            transform: translateY(-1px);
        }
        
        .alert {
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .alert-error {
            background: #fee;
            color: #c33;
            border: 1px solid #fcc;
        }
        
        .alert-success {
            background: #efe;
            color: #363;
            border: 1px solid #cfc;
        }
        
        .current-target {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }
        
        .current-target h3 {
            color: #333;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .current-target p {
            color: #666;
            word-break: break-all;
            font-family: monospace;
            background: white;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #e1e5e9;
        }
        
        .features {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid #e1e5e9;
        }
        
        .feature-list {
            list-style: none;
            padding: 0;
        }
        
        .feature-list li {
            padding: 8px 0;
            color: #666;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .feature-list li::before {
            content: "✓";
            color: #667eea;
            font-weight: bold;
            width: 20px;
            height: 20px;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 30px 20px;
                margin: 10px;
            }
            
            .button-group {
                flex-direction: column;
            }
            
            h1 {
                font-size: 24px;
            }
        }
        
        .proxy-frame {
            width: 100%;
            height: 80vh;
            border: none;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            margin-top: 20px;
        }
        
        .frame-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 20px;
            width: 95vw;
            max-width: 1200px;
            height: 90vh;
        }
        
        .frame-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .frame-url {
            font-family: monospace;
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 8px;
            color: #666;
            font-size: 14px;
            flex: 1;
            margin-right: 15px;
            word-break: break-all;
        }
        
        .close-btn {
            background: #ff4757;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }
        
        .close-btn:hover {
            background: #ff3742;
        }
    </style>
</head>
<body>
    <div class="container" id="mainContainer">
        <div class="header">
            <div class="logo">🌐</div>
            <h1>Deno Proxy</h1>
            <p class="subtitle">安全、快速的代理服务</p>
        </div>
        
        ${error ? `<div class="alert alert-error">${error}</div>` : ''}
        ${success ? `<div class="alert alert-success">${success}</div>` : ''}
        
        ${targetUrl ? `
        <div class="current-target">
            <h3>当前代理目标</h3>
            <p>${targetUrl}</p>
        </div>
        ` : ''}
        
        <form method="POST" action="/">
            <div class="form-group">
                <label for="targetUrl">目标网址</label>
                <input 
                    type="url" 
                    id="targetUrl" 
                    name="targetUrl" 
                    placeholder="https://example.com" 
                    value="${targetUrl || ''}"
                    required
                >
            </div>
            
            <div class="button-group">
                <button type="submit" name="action" value="set" class="btn-primary">
                    🔗 设置代理
                </button>
                <button type="submit" name="action" value="visit" class="btn-secondary">
                    🚀 访问网站
                </button>
            </div>
        </form>
        
        <div class="features">
            <ul class="feature-list">
                <li>支持所有 HTTP/HTTPS 网站</li>
                <li>保持原始网站功能</li>
                <li>安全的密码保护</li>
                <li>响应式设计，支持移动端</li>
            </ul>
        </div>
    </div>
    
    <script>
        // 处理访问网站的逻辑
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.querySelector('form');
            const container = document.getElementById('mainContainer');
            
            form.addEventListener('submit', function(e) {
                const action = e.submitter.value;
                if (action === 'visit') {
                    e.preventDefault();
                    const targetUrl = document.getElementById('targetUrl').value;
                    if (targetUrl) {
                        // 先设置代理目标
                        fetch('/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: 'action=set&targetUrl=' + encodeURIComponent(targetUrl)
                        }).then(() => {
                            // 然后显示代理页面
                            showProxyFrame(targetUrl);
                        });
                    }
                }
            });
        });
        
        function showProxyFrame(targetUrl) {
            const container = document.getElementById('mainContainer');
            container.className = 'frame-container';
            container.innerHTML = \`
                <div class="frame-header">
                    <div class="frame-url">\${targetUrl}</div>
                    <button class="close-btn" onclick="location.reload()">关闭</button>
                </div>
                <iframe src="/proxy/" class="proxy-frame" sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"></iframe>
            \`;
        }
    </script>
</body>
</html>
  `;
}

// 生成登录页面
function generateLoginHTML(error?: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deno Proxy - 登录</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .login-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        .logo {
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        h1 {
            color: #333;
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        
        input[type="password"] {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #f8f9fa;
        }
        
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        button {
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin-top: 10px;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .alert-error {
            background: #fee;
            color: #c33;
            border: 1px solid #fcc;
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">🔐</div>
        <h1>访问验证</h1>
        
        ${error ? `<div class="alert-error">${error}</div>` : ''}
        
        <form method="POST" action="/login">
            <div class="form-group">
                <label for="password">请输入访问密码</label>
                <input type="password" id="password" name="password" required autofocus>
            </div>
            <button type="submit">🚀 进入代理服务</button>
        </form>
    </div>
</body>
</html>
  `;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const sessionToken = getSessionFromCookie(req);

  // 处理登录请求
  if (url.pathname === "/login" && req.method === "POST") {
    const formData = await req.formData();
    const password = formData.get("password") as string;
    
    if (password === ADMIN_PASSWORD) {
      const token = await createSession();
      const headers = new Headers({
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie": `session=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
        "Location": "/"
      });
      return new Response(null, { status: 302, headers });
    } else {
      return new Response(generateLoginHTML("密码错误，请重试"), {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
  }

  // 检查是否需要登录
  if (REQUIRE_AUTH && !await isValidSession(sessionToken)) {
    if (url.pathname === "/login") {
      return new Response(generateLoginHTML(), {
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }
    const headers = new Headers({
      "Location": "/login"
    });
    return new Response(null, { status: 302, headers });
  }

  // 处理主页面的 POST 请求（设置代理目标）
  if (url.pathname === "/" && req.method === "POST") {
    const formData = await req.formData();
    const targetUrl = formData.get("targetUrl") as string;
    const action = formData.get("action") as string;
    
    if (targetUrl) {
      try {
        new URL(targetUrl);
        await kv.set(TARGET_KEY, targetUrl);
        
        if (action === "set") {
          return new Response(generateHTML(targetUrl, undefined, "代理目标已成功设置！"), {
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }
      } catch {
        return new Response(generateHTML(undefined, "无效的 URL 格式，请检查后重试"), {
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }
    }
  }

  // 处理主页面
  if (url.pathname === "/") {
    const result = await kv.get(TARGET_KEY);
    const currentTarget = result.value as string | null;
    
    return new Response(generateHTML(currentTarget), {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  // 处理代理请求
  if (url.pathname.startsWith("/proxy")) {
    const result = await kv.get(TARGET_KEY);
    if (!result.value) {
      return new Response("未设置代理目标 URL，请先在主页设置目标网址。", { 
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
    
    const baseUrl = result.value as string;
    const proxyPath = url.pathname.slice("/proxy".length);
    
    let finalUrl: string;
    try {
      finalUrl = new URL(proxyPath + url.search, baseUrl).toString();
    } catch {
      return new Response("构造目标 URL 出错。", { 
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // 构造代理请求
    const proxyHeaders = new Headers();
    for (const [key, value] of req.headers.entries()) {
      // 过滤掉一些不需要转发的头部
      if (!["host", "cookie"].includes(key.toLowerCase())) {
        proxyHeaders.set(key, value);
      }
    }

    const proxyRequest = new Request(finalUrl, {
      method: req.method,
      headers: proxyHeaders,
      body: req.body,
    });

    try {
      const targetResponse = await fetch(proxyRequest);
      const body = await targetResponse.arrayBuffer();

      const responseHeaders = new Headers();
      for (const [key, value] of targetResponse.headers.entries()) {
        // 处理一些特殊的响应头
        if (!["set-cookie", "content-security-policy"].includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      }

      // 如果是 HTML 内容，可以进行一些处理来确保链接正确工作
      const contentType = targetResponse.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        let html = new TextDecoder().decode(body);
        // 简单的链接重写，将相对链接转换为代理链接
        html = html.replace(/(href|src)="\/([^"]*?)"/g, `$1="/proxy/$2"`);
        html = html.replace(/(href|src)='\/([^']*?)'/g, `$1='/proxy/$2'`);
        
        return new Response(html, {
          status: targetResponse.status,
          headers: responseHeaders,
        });
      }

      return new Response(body, {
        status: targetResponse.status,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(`请求目标 URL 时发生错误：${err}`, {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  }

  // 处理旧的 setUrl 参数（向后兼容）
  if (url.searchParams.has("setUrl")) {
    const newTargetUrl = url.searchParams.get("setUrl")!;
    try {
      new URL(newTargetUrl);
      await kv.set(TARGET_KEY, newTargetUrl);
      return new Response(`代理目标 URL 已更新为：${newTargetUrl}`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    } catch {
      return new Response("无效的 URL，请检查格式。", { 
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  }

  // 404 处理
  return new Response("页面未找到", { 
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
});