/**
 * 简化模式（Implicit）—— 已废弃，纯概念展示
 *
 * Spring Authorization Server 不再支持此模式，这里只做概念性讲解。
 */
export default function ImplicitFlow() {
  return (
    <div>
      <div className="card">
        <h2>简化模式 (Implicit)</h2>
        <div className="alert alert-warning">
          ⚠️ 此模式在 OAuth 2.1 中已被废弃！推荐使用「授权码模式 + PKCE」替代。
        </div>
        <p>简化模式是授权码模式的"简化版"：省去了用 code 换 token 的步骤，授权服务器直接返回 token。</p>
      </div>

      <div className="card">
        <h3>流程图</h3>
        <pre style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.8', overflow: 'auto' }}>
{`  ┌──────────┐                    ┌──────────────┐
  │   前端   │                    │  授权服务器   │
  │ (Client) │                    │ (Auth :9000)  │
  └────┬─────┘                    └──────┬────────┘
       │                                 │
       │ 1. 跳转到授权服务器                │
       │ response_type=token（注意不是code） │
       │ ───────────────────────────────>│
       │                                 │
       │                  2. 用户登录并授权     │
       │                                 │
       │ 3. 直接重定向回来，URL hash 里带 token│
       │ <────────────────────────────────│
       │                                 │
       │ 4. 前端从 URL hash 中取出 token    │
       │                                 │
  ⚠️ Token 直接暴露在浏览器 URL 中！
  ⚠️ 没有 refresh_token！
  ⚠️ 没有 client_secret 验证！
`}
        </pre>
      </div>

      <div className="card">
        <h3>为什么被废弃？</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <p>1. <strong style={{ color: '#f87171' }}>Token 暴露在 URL 中</strong> —— 浏览器历史记录、Referer 头都可能泄露 token</p>
          <p>2. <strong style={{ color: '#f87171' }}>没有 client_secret 验证</strong> —— 任何人都可以伪造 client_id 获取 token</p>
          <p>3. <strong style={{ color: '#f87171' }}>没有 refresh_token</strong> —— token 过期后用户需要重新授权</p>
          <p>4. <strong style={{ color: '#f87171' }}>无法安全验证 token 归属</strong> —— 没有中间的 code 步骤，token 可能被拦截</p>
        </div>
      </div>

      <div className="card">
        <h3>为什么授权码模式更安全？</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <p>1. <strong style={{ color: '#4ade80' }}>code 是临时的</strong> —— 只能用一次，且需要 client_secret 才能换 token</p>
          <p>2. <strong style={{ color: '#4ade80' }}>client_secret 在后端</strong> —— 不会暴露给浏览器</p>
          <p>3. <strong style={{ color: '#4ade80' }}>支持 refresh_token</strong> —— 不用反复让用户授权</p>
          <p>4. <strong style={{ color: '#4ade80' }}>支持 PKCE</strong> —— 即使没有后端的纯前端应用也安全</p>
        </div>
      </div>

      <div className="card">
        <h3>现在的最佳实践</h3>
        <div className="alert alert-info">
          无论是 Web 应用还是纯前端 SPA，都使用<strong>「授权码模式 + PKCE」</strong>。<br/><br/>
          PKCE (Proof Key for Code Exchange) 在授权码模式基础上加了一层安全：
          前端生成一个随机字符串（code_verifier），用它派生出 code_challenge，
          授权请求带 code_challenge，换 token 时带 code_verifier，
          授权服务器验证两者匹配才发 token。这样即使 code 被截获也无法换 token。
        </div>
      </div>
    </div>
  )
}
