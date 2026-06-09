# OAuth2.0 学习项目

## 项目简介

这是一个帮助你快速理解 OAuth2.0 的实践项目。包含三个独立服务，你可以亲手体验完整的授权流程。

## 技术栈

- **授权服务器**: Spring Boot 3.3.9 + Spring Authorization Server 1.3.3
- **资源服务器**: Spring Boot 3.3.9 + Spring Security OAuth2 Resource Server
- **前端**: React 18 + TypeScript + Vite + TailwindCSS
- **JDK**: 17
- **Token 格式**: JWT（RS256 签名）

## 项目结构

```
oauth2-learning/
├── oauth2-auth-server/       # 授权服务器（端口 9000）—— 负责颁发 Token
├── oauth2-resource-server/   # 资源服务器（端口 8090）—— 保护 API 资源
├── oauth2-frontend/          # React 前端（端口 5173）—— 可视化体验授权流程
└── README.md
```

## 快速开始

### 1. 启动授权服务器

```bash
cd oauth2-learning/oauth2-auth-server
JAVA_HOME=/opt/homebrew/Cellar/openjdk/25.0.2/libexec/openjdk.jdk/Contents/Home \
mvn spring-boot:run -s /opt/homebrew/Cellar/maven/3.9.14/libexec/conf/settings-yunahao.xml
```

启动后访问 http://localhost:9000/login 可以看到登录页面。

### 2. 启动资源服务器

```bash
cd oauth2-learning/oauth2-resource-server
JAVA_HOME=/opt/homebrew/Cellar/openjdk/25.0.2/libexec/openjdk.jdk/Contents/Home \
mvn spring-boot:run -s /opt/homebrew/Cellar/maven/3.9.14/libexec/conf/settings-yunahao.xml
```

### 3. 启动前端

```bash
cd oauth2-learning/oauth2-frontend
npm install
npm run dev
```

访问 http://localhost:5173 开始体验。

## 测试账号

| 角色   | 用户名   | 密码      |
|--------|---------|-----------|
| 普通用户 | zhangsan | 123456   |
| 管理员  | admin   | admin123  |

## OAuth2.0 四种授权模式

### 模式一：授权码模式（Authorization Code）—— 生产首选

最安全、最常用的模式。Token 不会暴露给浏览器。

```
浏览器                授权服务器(9000)         资源服务器(8090)
  │                       │                       │
  │── GET /authorize ────>│                       │
  │<── 登录页面 ──────────│                       │
  │── 提交用户名密码 ────>│                       │
  │<── 授权确认页面 ──────│                       │
  │── 同意授权 ──────────>│                       │
  │<── 302 重定向(带code) │                       │
  │                       │                       │
  │── POST /token ───────>│                       │
  │   (code + secret)     │                       │
  │<── access_token ──────│                       │
  │                       │                       │
  │── GET /api/user ─────────────────────────────>│
  │   (Bearer token)      │                       │
  │<── 用户数据 ─────────────────────────────────│
```

**关键端点：**
- 授权端点: `GET /oauth2/authorize?response_type=code&client_id=web-app&scope=openid+read+write&redirect_uri=...`
- Token 端点: `POST /oauth2/token` (grant_type=authorization_code)

### 模式二：客户端模式（Client Credentials）—— 机器对机器

没有用户参与，纯服务间认证。

```
客户端                授权服务器(9000)         资源服务器(8090)
  │                       │                       │
  │── POST /token ───────>│                       │
  │   grant_type=         │                       │
  │   client_credentials  │                       │
  │<── access_token ──────│                       │
  │                       │                       │
  │── GET /api/orders ───────────────────────────>│
  │<── JSON 数据 ────────────────────────────────│
```

**关键端点：**
- Token 端点: `POST /oauth2/token` (grant_type=client_credentials)

### 模式三：密码模式（Password）—— 已不推荐

用户直接把账号密码给客户端。新版 Spring Authorization Server 默认不支持，
本项目中已通过自定义配置支持，仅作学习用途。

### 模式四：简化模式（Implicit）—— 已废弃

Token 直接暴露在浏览器 URL 中，不安全。OAuth 2.1 已正式移除此模式。
新版 Spring Authorization Server 不再支持。

## 注册的客户端信息

| 客户端 ID    | 密码            | 支持的模式          | 用途          |
|-------------|----------------|--------------------|--------------|
| web-app     | secret         | authorization_code | Web 应用授权码模式 |
| server-app  | server-secret  | client_credentials | 机器对机器认证     |

## 核心 API 端点

| 端点                   | 方法   | 需 Token | 需 Scope | 说明          |
|-----------------------|-------|---------|---------|--------------|
| /api/public/hello     | GET   | 否      | -       | 公开接口        |
| /api/user/info        | GET   | 是      | -       | 用户信息（任意 scope）|
| /api/user/profile     | GET   | 是      | read    | 用户资料        |
| /api/orders           | GET   | 是      | read    | 订单列表        |
| /api/orders           | POST  | 是      | write   | 创建订单        |

## curl 测试命令

### 客户端模式获取 Token

```bash
curl -X POST http://localhost:9000/oauth2/token \
  -H "Authorization: Basic $(echo -n 'server-app:server-secret' | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&scope=read+write"
```

### 用 Token 访问资源

```bash
curl http://localhost:8090/api/user/info \
  -H "Authorization: Bearer <上面拿到的access_token>"
```

### 用 Token 查看订单

```bash
curl http://localhost:8090/api/orders \
  -H "Authorization: Bearer <access_token>"
```

## 核心概念速查

### JWT (JSON Web Token)
Token 的一种格式，自包含（里面就有用户信息），不需要每次都查数据库。
格式：`header.payload.signature`（三段 Base64 编码的字符串）。

### scope vs role
- **scope**: OAuth2 概念，表示"token 被授权了什么"，如 `read write`
- **role**: 应用概念，表示"用户是什么角色"，如 `USER ADMIN`

### JWKS (JSON Web Key Set)
授权服务器暴露的公钥端点 (`/oauth2/jwks`)，资源服务器用它来验证 JWT 签名。

### 为什么用 RSA 非对称加密？
- 授权服务器持有私钥 → 签发 token
- 资源服务器持有公钥 → 验证 token
- 公钥可以公开给所有人，私钥只有授权服务器知道
- 资源服务器不需要跟授权服务器通信就能验证 token
