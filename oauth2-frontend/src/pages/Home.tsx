import { Link } from 'react-router-dom'

/**
 * 首页 —— OAuth 2.0 概览 + 四种模式入口
 */
export default function Home() {
  const flows = [
    {
      to: '/authorization-code',
      title: '授权码模式 (Authorization Code)',
      desc: '最常用、最安全的模式。前端跳转到授权服务器登录，拿到 code 后换 token。适合有后端的 Web 应用。',
      badge: '推荐',
      badgeColor: 'badge-green',
    },
    {
      to: '/client-credentials',
      title: '客户端凭证模式 (Client Credentials)',
      desc: '没有"用户"参与，机器对机器直接用 client_id + secret 换 token。适合微服务间调用。',
      badge: '常用',
      badgeColor: 'badge-blue',
    },
    {
      to: '/password',
      title: '密码模式 (Password)',
      desc: '前端直接把用户名密码发给授权服务器换 token。OAuth 2.1 已废弃，了解原理即可。',
      badge: '已废弃',
      badgeColor: 'badge-red',
    },
    {
      to: '/implicit',
      title: '简化模式 (Implicit)',
      desc: '授权码模式的"简化版"，省去了 code 步骤直接返回 token。OAuth 2.1 已废弃。',
      badge: '已废弃',
      badgeColor: 'badge-red',
    },
  ]

  return (
    <div>
      <div className="card">
        <h2>什么是 OAuth 2.0?</h2>
        <p>
          OAuth 2.0 是一个授权框架，让用户可以授权第三方应用访问自己在某个服务上的数据，而不需要把密码告诉第三方。
        </p>
        <p>
          比如：你用微信登录某个 App，或者让一个应用读取你的 GitHub 仓库 —— 背后都是 OAuth 2.0。
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <strong style={{ color: '#38bdf8' }}>四个角色：</strong>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#94a3b8', lineHeight: '2' }}>
              <li>Resource Owner（资源所有者）—— 你，用户</li>
              <li>Client（客户端）—— 第三方应用（前端）</li>
              <li>Authorization Server（授权服务器）—— 发 token 的（:9000）</li>
              <li>Resource Server（资源服务器）—— 保护 API 的（:8090）</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: '#38bdf8' }}>核心概念：</strong>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#94a3b8', lineHeight: '2' }}>
              <li>Access Token —— 访问令牌（相当于通行证）</li>
              <li>Refresh Token —— 刷新令牌（用来换新的 access_token）</li>
              <li>Scope —— 权限范围（read / write / admin）</li>
              <li>Grant Type —— 授权模式（共四种）</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>四种授权模式</h2>
        <p>点击下方卡片开始体验每种授权模式 ↓</p>
        <div className="grid">
          {flows.map((f) => (
            <Link to={f.to} key={f.to} className="home-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3>{f.title}</h3>
                <span className={`badge ${f.badgeColor}`}>{f.badge}</span>
              </div>
              <p>{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>测试账号</h2>
        <p>用户名：<strong style={{ color: '#4ade80' }}>user</strong> / 密码：<strong style={{ color: '#4ade80' }}>password</strong>（普通用户）</p>
        <p>用户名：<strong style={{ color: '#4ade80' }}>admin</strong> / 密码：<strong style={{ color: '#4ade80' }}>admin</strong>（管理员）</p>
      </div>

      <div className="card">
        <h2>快速开始</h2>
        <p>1. 启动授权服务器：<code style={{ color: '#facc15' }}>cd oauth2-auth-server && mvn spring-boot:run</code></p>
        <p>2. 启动资源服务器：<code style={{ color: '#facc15' }}>cd oauth2-resource-server && mvn spring-boot:run</code></p>
        <p>3. 启动前端：<code style={{ color: '#facc15' }}>cd oauth2-frontend && npm run dev</code></p>
        <p>4. 打开 <code style={{ color: '#facc15' }}>http://localhost:5173</code> 开始体验</p>
      </div>
    </div>
  )
}
