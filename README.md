# OAuth2.0 学习项目 — 从零到上手

> 零基础友好。读完这篇文档，你会明白 OAuth2.0 是什么、为什么需要它、怎么用它。
> 然后启动项目，亲手跑一遍，彻底搞懂。

---

## 一、OAuth2.0 是什么？

### 用一个生活中的例子理解

你去照相馆拍照，照相馆需要你出示身份证。你有两个选择：

- **笨办法**：把身份证原件交给照相馆（风险：丢了、被复印、信息泄露）
- **聪明办法**：去派出所开一张"临时证明"，上面写着"兹证明某某某，身份证号 xxx，仅供照相馆使用，有效期 1 天"。照相馆只需要看这张纸就够了。

OAuth2.0 就是这个"聪明办法"在网络世界的实现。

**用户不想把密码给第三方应用，但又需要让第三方应用访问自己的数据。** OAuth2.0 就是解决这个问题的标准协议。

### 三个角色

任何 OAuth2.0 场景中，一定有三个角色：

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   用户       │     │  授权服务器   │     │  资源服务器   │
│  (Resource   │     │(Authorization│     │ (Resource    │
│   Owner)     │     │   Server)    │     │  Server)     │
│             │     │             │     │             │
│ 数据的主人    │     │ 负责验证身份   │     │ 存放数据的    │
│ 比如：你     │     │ 负责颁发令牌   │     │ 提供API的服务  │
│             │     │ 比如：微信     │     │ 比如：微信相册  │
└─────────────┘     └─────────────┘     └─────────────┘
         ▲                  ▲                   ▲
         │                  │                   │
         └──────────────────┼───────────────────┘
                            │
                    ┌─────────────┐
                    │   客户端     │
                    │  (Client)    │
                    │             │
                    │ 想访问用户数据 │
                    │ 的第三方应用   │
                    │ 比如：某个App │
                    └─────────────┘
```

用"微信登录"举例：

| 角色 | 对应 |
|------|------|
| 用户 | 你（扫码的人） |
| 授权服务器 | 微信开放平台（验证你的身份，颁发 token） |
| 资源服务器 | 微信的用户信息接口（返回昵称、头像等） |
| 客户端 | 你在登录的第三方网站（比如掘金、CSDN） |

### Token（令牌）是什么？

Token 就是一个字符串，相当于"临时通行证"。

```
eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ6aGFuZ3NhbiIsInNjb3BlIjoicmVhZCB3cml0ZSIsImV4cCI6MTcw...
```

它有三个特点：
- **有时效**：到期自动失效（比如 1 小时）
- **有范围**：只允许做指定的事（比如只有"读"权限，不能"写"）
- **可撤销**：用户随时可以取消授权

---

## 二、为什么需要 OAuth2.0？

### 没有 OAuth2.0 的世界

假设你要做一个"用微信头像当自己网站头像"的功能，没有 OAuth2.0，你只能：

> "请输入你的微信账号和密码，我帮你获取头像。"

用户会怎么想？——"你疯了吧？我把微信密码给你，你偷我钱怎么办？"

### 有了 OAuth2.0

> "点击'微信登录'，跳到微信页面，你自己在微信上确认'允许获取头像'。我的网站永远不会知道你的微信密码。"

| 对比 | 直接给密码 | OAuth2.0 |
|------|----------|----------|
| 密码是否暴露 | 是，密码给第三方了 | 否，第三方永远拿不到密码 |
| 权限控制 | 全部权限，无法限制 | 只授权指定范围（scope） |
| 可撤销 | 改密码（影响所有应用） | 单独撤销某个应用的授权 |
| 有效期 | 永久（除非改密码） | 自动过期 |

### 现实中哪些地方在用？

几乎所有的"第三方登录"都是 OAuth2.0：

- "使用微信登录"
- "使用 GitHub 登录"
- "使用 Google 账号登录"
- "使用 Apple 登录"
- 微信小程序获取用户信息
- 支付宝支付（OAuth2.0 授权支付）
- 企业内部系统之间的单点登录（SSO）

---

## 三、四种授权模式

OAuth2.0 定义了四种获取 token 的方式（Grant Type），适用于不同场景。

### 模式一：授权码模式（Authorization Code）

> 最重要。生产环境 95% 都用这种。

**一句话理解**：先给一个一次性"授权码"，再用授权码换"令牌"。令牌永远不会出现在浏览器地址栏里。

```
用户                第三方网站(客户端)        授权服务器             资源服务器
 │                       │                      │                      │
 │── 点击"微信登录" ────>│                      │                      │
 │                       │── 跳转到微信 ────────>│                      │
 │<──────────────────────│──────────────────────│                      │
 │                       │        微信登录页面     │                      │
 │── 输入密码+扫码 ──────>│──────────────────────>│                      │
 │                       │                      │                      │
 │                       │        授权确认页面     │                      │
 │<──────────────────────│──────────────────────│                      │
 │── 点击"同意" ─────────>│──────────────────────>│                      │
 │                       │                      │                      │
 │                       │<── 回调，带着 code ───│                      │
 │                       │    (code=abc123)      │                      │
 │                       │                      │                      │
 │                       │── 用 code 换 token ──>│                      │
 │                       │    (code + 密钥)      │                      │
 │                       │<── 返回 token ────────│                      │
 │                       │                      │                      │
 │                       │── 用 token 获取数据 ──────────────────────>  │
 │                       │<── 返回用户数据 ───────────────────────────  │
```

**为什么安全？**
- token 只在后端服务器之间传递，浏览器里看不到
- code 只能用一次，有效期几分钟
- 即使 code 被截获，没有 client_secret 也换不到 token

**适用场景**：有后端的 Web 应用、第三方登录（微信登录、GitHub 登录）

---

### 模式二：客户端模式（Client Credentials）

> 没有"用户"参与，纯机器对机器。

**一句话理解**：用应用自己的账号密码（client_id + client_secret）直接换 token，不涉及任何用户。

```
后端服务A              授权服务器             后端服务B(资源服务器)
     │                      │                      │
     │── POST /token ──────>│                      │
     │  client_id=xxx       │                      │
     │  client_secret=yyy   │                      │
     │<── 返回 token ────────│                      │
     │                      │                      │
     │── GET /api/data ───────────────────────────>│
     │  Bearer token        │                      │
     │<── 返回数据 ────────────────────────────────│
```

**适用场景**：微服务之间调用、定时任务访问 API、CI/CD 管道

---

### 模式三：密码模式（Resource Owner Password Credentials）

> **已不推荐使用。** 了解一下就行。

**一句话理解**：用户直接把账号密码给客户端，客户端拿着去换 token。

```
用户                  客户端                 授权服务器
 │                      │                      │
 │── 输入用户名密码 ────>│                      │
 │                      │── POST /token ──────>│
 │                      │  username=zhangsan   │
 │                      │  password=123456     │
 │                      │  client_id=xxx       │
 │                      │<── 返回 token ────────│
```

**为什么不推荐？** 密码直接暴露给客户端了。除非客户端是自家开发的且高度信任，否则不要用。
新版 Spring Authorization Server 默认已不支持此模式。

---

### 模式四：简化模式（Implicit）

> **已废弃。** OAuth 2.1 正式移除了这种模式。

**一句话理解**：直接在浏览器地址栏的 `#` 后面返回 token。

```
用户                客户端(JS前端)           授权服务器
 │                      │                      │
 │── 点击登录 ──────────>│── 跳转授权 ──────────>│
 │                      │<── 重定向到 callback#token=xxx
 │                      │   (token 直接在URL中)  │
```

**为什么废弃？** Token 直接出现在浏览器地址栏，容易被截获。现在推荐用授权码模式 + PKCE 代替。

---

### 四种模式对比总结

| 模式 | 用户参与 | Token 经过后端 | 安全性 | 生产推荐 | 本项目演示 |
|------|---------|--------------|--------|---------|-----------|
| 授权码模式 | 是 | 是 | 最高 | ★★★★★ | ✅ |
| 客户端模式 | 否 | 是 | 高 | ★★★★ | ✅ |
| 密码模式 | 是 | 否 | 低 | ★☆☆☆☆ | - |
| 简化模式 | 是 | 否 | 低 | 已废弃 | - |

---

## 四、核心概念速查

在开始动手之前，你需要认识几个关键词：

### Access Token（访问令牌）

就是那个让你能访问资源的字符串。拿到它，就等于拿到了"通行证"。

```
格式（JWT）：header.payload.signature
示例：eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ6aGFuZ3NhbiJ9.abc123signature
```

三段分别是：
- **header**：算法信息（用什么方式签名）
- **payload**：数据（用户名、权限、过期时间等）
- **signature**：签名（防止被篡改）

你可以去 https://jwt.io 把 token 粘贴进去，就能看到里面装了什么。

### Refresh Token（刷新令牌）

Access Token 过期后，用 Refresh Token 换一个新的，不用让用户重新登录。
有效期更长（比如 7 天），但只能用来换新的 Access Token，不能用来访问资源。

#### 为什么需要它？——一句话讲透

没有 Refresh Token 的世界：

```
每次 Access Token 过期
  → 必须重新走一遍授权码流程
  → 跳到授权服务器 → 用户输入密码 → 点同意 → 拿 code → 换 token
  → 用户：？？？我刚登录过啊，怎么又让我登？
```

有了 Refresh Token：

```
Access Token 过期
  → 后端拿着 refresh_token 直接 POST /oauth2/token 就能拿到新的 access_token
  → 纯机器对机器的服务间调用，用户完全无感知
  → 用户：啥都没发生，继续用
```

**Refresh Token 的本质就是：把"用户参与"的那一步（登录 + 授权）的成果持久化下来。**
用户登录一次，换来一个 refresh_token，只要它没过期，就再也不用麻烦用户了。

#### 完整生命周期

```
                          时间线
                            │
  用户第一次登录 ───────────>│
                            │
  授权服务器返回：            │
   ├─ access_token (30秒)   │  ← 很短，因为万一泄露影响有限
   └─ refresh_token (7天)   │  ← 很长，这就是"用户登录一次的成果"
                            │
        ... 过了 30 秒 ...   │
                            │
  access_token 过期了        │
  但用户完全不知道！因为：    │
                            │
  后端自动做这件事：          │  ← 纯服务间调用，不需要用户参与
  POST /oauth2/token        │
   grant_type=refresh_token │
   refresh_token=xxx        │
                            │
  授权服务器返回：            │
   ├─ 新的 access_token     │  ← 又能用 30 秒了
   └─ 新的 refresh_token    │  ← 旧的作废（轮转机制）
                            │
        ... 又过 30 秒 ...   │
                            │
  后端又自动刷新 ...          │  ← 如此循环，用户永远无感
                            │
        ... 过了 7 天 ...    │
                            │
  refresh_token 也过期了     │  ← "登录成果"过期了
  → 这时才需要用户重新登录    │  → 又回到第一步
```

#### 对比：有没有 Refresh Token 的区别

| 场景 | 没有 Refresh Token | 有 Refresh Token |
|------|-------------------|-----------------|
| access_token 过期了 | 用户被踢下线，重新走授权码流程 | 后端静默刷新，用户无感知 |
| 用户体验 | 频繁要求重新登录 | 7天内免登录 |
| 是否需要用户参与 | 每次都要 | 只要 refresh_token 有效就不要 |
| 安全性 | access_token 设长一点（少登录但泄露风险大） | access_token 可以设很短（30秒都行） |

**正是因为有了 Refresh Token，Access Token 才敢设这么短（30秒）。**
即使 Access Token 被盗，30 秒后就失效了。而没有 Refresh Token 的话，你只能把 Access Token 设很长（比如 7 天），一旦泄露后果严重。

#### 两个 Token 的区别

| | Access Token | Refresh Token |
|--|-------------|---------------|
| 用途 | 访问资源（放在请求头里） | 换新的 Access Token |
| 有效期 | 很短（30秒 ~ 1小时） | 很长（7天 ~ 30天） |
| 能访问资源吗 | 能 | 不能 |
| 谁在用 | 每次请求资源服务器都带上 | 只在刷新时发给授权服务器 |
| 泄露了怎么办 | 等它过期（很快） | 服务器端撤销，强制重新登录 |
| 谁持有 | 前端/客户端 | 后端保存（不要暴露给前端 JS） |

#### 轮转机制（Refresh Token Rotation）

本项目开启了轮转机制（`reuseRefreshTokens = false`），意思是：
- 每次用 refresh_token 刷新时，授权服务器会返回一个全新的 refresh_token
- 旧的 refresh_token 立刻作废
- 如果有人偷了你的旧 refresh_token 想用，会发现已经失效，服务器也能检测到异常

```
刷新前：refresh_token = AAAA
  ↓ 调用刷新接口
刷新后：refresh_token = BBBB（新的）  AAAA 立即作废
  ↓ 下次刷新
刷新后：refresh_token = CCCC（新的）  BBBB 立即作废
```

#### 在本项目中体验

1. 打开前端 http://localhost:5173 ，走一遍授权码模式
2. 回调页面会显示 access_token、refresh_token 和 30 秒倒计时
3. 等 30 秒后 token 过期，点击"刷新 Token"按钮
4. 观察：用 refresh_token 换到了全新的 access_token，页面倒计时重新开始
5. 可以反复刷新，不需要重新登录

#### 用 curl 测试刷新

先用授权码模式拿到 token（包含 refresh_token），然后：

```bash
# 用 refresh_token 换新的 access_token
curl -X POST http://localhost:9000/oauth2/token \
  -H "Authorization: Basic $(echo -n 'web-app:secret' | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=你的refresh_token"
```

返回：
```json
{
  "access_token": "新的JWT...",
  "refresh_token": "新的refresh_token（旧的已作废）",
  "token_type": "Bearer",
  "expires_in": 30
}
```

注意：旧的 refresh_token 会立即失效（轮转机制），只能用最新的那个。

### Scope（权限范围）

Token 的权限清单。就像门禁卡，有些卡只能进大门，有些卡还能进机房。

```
scope = "read write"  →  可以读取数据，也可以写入数据
scope = "read"        →  只能读取数据
```

### Client ID / Client Secret

每个接入 OAuth2.0 的应用都需要先注册，注册后获得：
- **Client ID**：应用的身份标识（公开的）
- **Client Secret**：应用的密钥（必须保密，只在后端使用）

### JWT vs 普通 Token

| 特性 | 普通 Token（UUID） | JWT |
|------|-------------------|-----|
| 内容 | 随机字符串，没有含义 | 包含用户信息和签名 |
| 验证方式 | 每次都要查数据库 | 用公钥就能验证，不用查库 |
| 性能 | 每次请求都要查库 | 不用查库，性能好 |
| 大小 | 短（几十字符） | 长（几百字符） |
| 本项目使用 | - | ✅ |

### JWKS（JSON Web Key Set）

授权服务器暴露的一个公开接口（`/oauth2/jwks`），里面是 RSA 公钥。
资源服务器从这里拿公钥来验证 JWT 签名。

这就是为什么资源服务器不需要每次都去问授权服务器"这个 token 是不是你发的"——
用公钥自己就能验证。

---

## 五、上手运行

### 环境要求

- JDK 17+
- Maven 3.6+
- Node.js 18+

### 第一步：启动授权服务器（端口 9000）

```bash
cd oauth2-learning/oauth2-auth-server
JAVA_HOME=/opt/homebrew/Cellar/openjdk/25.0.2/libexec/openjdk.jdk/Contents/Home \
mvn spring-boot:run -s /opt/homebrew/Cellar/maven/3.9.14/libexec/conf/settings-yunahao.xml
```

启动成功后访问 http://localhost:9000/login 应该能看到登录页面。

### 第二步：启动资源服务器（端口 8090）

```bash
cd oauth2-learning/oauth2-resource-server
JAVA_HOME=/opt/homebrew/Cellar/openjdk/25.0.2/libexec/openjdk.jdk/Contents/Home \
mvn spring-boot:run -s /opt/homebrew/Cellar/maven/3.9.14/libexec/conf/settings-yunahao.xml
```

### 第三步：启动前端（端口 5173）

```bash
cd oauth2-learning/oauth2-frontend
npm install
npm run dev
```

### 第四步：开始体验

打开 http://localhost:5173 ，你会看到三个页面：

1. **授权码模式** — 点"开始授权"，跳到授权服务器登录，同意授权，拿到 token
2. **客户端模式** — 点一下就拿到 token，体验机器对机器的认证
3. **资源接口测试** — 把 token 粘贴进去，测试各种 API 的权限控制

---

## 六、测试账号

### 用户账号（用于授权码模式登录）

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 普通用户 | zhangsan | 123456 |
| 管理员 | admin | admin123 |

### 客户端信息（已注册的应用）

| 客户端 ID | 密码 | 支持的模式 | 说明 |
|-----------|------|-----------|------|
| web-app | secret | authorization_code, refresh_token | Web 应用 |
| server-app | server-secret | client_credentials | 后端服务 |

---

## 七、用 curl 手动测试

不想启动前端？用命令行一样可以体验完整流程。

### 客户端模式（最简单，先试这个）

第一步，获取 token：

```bash
curl -X POST http://localhost:9000/oauth2/token \
  -H "Authorization: Basic $(echo -n 'server-app:server-secret' | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&scope=read+write"
```

你会收到类似这样的响应：

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3599
}
```

第二步，用 token 访问资源服务器：

```bash
curl http://localhost:8090/api/orders \
  -H "Authorization: Bearer 上一步拿到的access_token"
```

### 授权码模式（用浏览器配合 curl）

第一步，在浏览器打开这个 URL 并登录（zhangsan / 123456）：

```
http://localhost:9000/oauth2/authorize?response_type=code&client_id=web-app&scope=openid+read+write&redirect_uri=http://127.0.0.1:5173/callback&state=test
```

登录并同意授权后，浏览器会跳转到：

```
http://127.0.0.1:5173/callback?code=xxxxxx&state=test
```

从地址栏复制 `code` 的值。

第二步，用 code 换 token：

```bash
curl -X POST http://localhost:9000/oauth2/token \
  -H "Authorization: Basic $(echo -n 'web-app:secret' | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=刚才复制的code&redirect_uri=http://127.0.0.1:5173/callback"
```

第三步，用 token 访问资源：

```bash
curl http://localhost:8090/api/user/info \
  -H "Authorization: Bearer 上一步拿到的access_token"
```

### 公开接口（不需要 token）

```bash
curl http://localhost:8090/api/public/hello
```

### 常见错误

| HTTP 状态码 | 含义 | 原因 |
|------------|------|------|
| 401 | 未认证 | 没带 token，或 token 过期/无效 |
| 403 | 无权限 | token 有效，但 scope 不够 |
| 400 | 请求错误 | grant_type 错误、code 已使用等 |

---

## 八、API 端点一览

### 授权服务器（localhost:9000）

| 端点 | 说明 |
|------|------|
| GET /oauth2/authorize | 授权端点，用户登录并授权 |
| POST /oauth2/token | Token 端点，用 code 换 token |
| GET /oauth2/jwks | 公钥端点，资源服务器用来验证 JWT |

### 资源服务器（localhost:8090）

| 端点 | 方法 | 需要 Token | 需要的 Scope | 说明 |
|------|------|-----------|-------------|------|
| /api/public/hello | GET | 否 | - | 公开接口 |
| /api/user/info | GET | 是 | 任意 | 用户信息 |
| /api/user/profile | GET | 是 | read | 用户详细资料 |
| /api/orders | GET | 是 | read | 订单列表 |
| /api/orders | POST | 是 | write | 创建订单 |

---

## 九、项目结构

```
oauth2-learning/
├── oauth2-auth-server/              # 授权服务器（端口 9000）
│   ├── pom.xml
│   └── src/main/java/com/oauth2/auth/
│       ├── AuthServerApplication.java        # 启动类
│       ├── config/
│       │   └── AuthorizationServerConfig.java  # 🔑 核心配置（所有 Bean 都在这）
│       └── controller/
│           ├── ConsentController.java          # 授权确认页控制器
│           └── LoginController.java            # 登录页控制器
│   └── src/main/resources/templates/
│       ├── login.html                          # 登录页面
│       └── consent.html                        # 授权确认页面
│
├── oauth2-resource-server/          # 资源服务器（端口 8090）
│   ├── pom.xml
│   └── src/main/java/com/oauth2/resource/
│       ├── ResourceServerApplication.java     # 启动类
│       ├── config/
│       │   └── ResourceServerConfig.java        # JWT 验证配置
│       └── controller/
│           ├── UserController.java              # 用户接口
│           └── OrderController.java             # 订单接口（scope 控制演示）
│
├── oauth2-frontend/                 # React 前端（端口 5173）
│   └── src/pages/
│       ├── AuthorizationCodeFlow.tsx           # 授权码模式演示
│       ├── ClientCredentialsFlow.tsx           # 客户端模式演示
│       ├── ResourceApiDemo.tsx                 # API 测试工具
│       └── CallbackPage.tsx                    # 授权码回调页
│
└── README.md                        # 本文档
```

---

## 十、关键代码在哪看？

刚上手不用每个文件都看，按这个顺序阅读最高效：

| 顺序 | 文件 | 你能学到什么 |
|------|------|-------------|
| 1 | AuthorizationServerConfig.java | 怎么注册客户端、配置授权模式、签发 JWT |
| 2 | ResourceServerConfig.java | 怎么验证 JWT、配置 scope 权限 |
| 3 | UserController.java | 怎么从 JWT 中取用户信息、怎么用 @PreAuthorize 控制权限 |
| 4 | OrderController.java | scope 控制的实际应用（read vs write） |
| 5 | AuthorizationCodeFlow.tsx | 前端如何发起授权、处理回调、换 token |
| 6 | ClientCredentialsFlow.tsx | 前端如何用 client_credentials 获取 token |

---

## 十一、延伸阅读

- [RFC 6749 — OAuth2.0 官方规范](https://datatracker.ietf.org/doc/html/rfc6749)
- [Spring Authorization Server 官方文档](https://docs.spring.io/spring-authorization-server/reference/)
- [JWT.io — 在线解析 JWT](https://jwt.io)
- [OAuth 2.0 Simplified（英文书）](https://oauth2simplified.com/)
