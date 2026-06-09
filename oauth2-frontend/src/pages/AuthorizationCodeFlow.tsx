import { useState } from 'react'

const AUTH_SERVER = 'http://localhost:9000'

/**
 * 授权码模式（Authorization Code）页面
 *
 * 这是最重要、最安全的 OAuth2.0 授权模式。
 */
export default function AuthorizationCodeFlow() {
  const [step, setStep] = useState(0)

  const startAuth = () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: 'web-app',
      scope: 'openid read write',
      redirect_uri: 'http://127.0.0.1:5173/callback',
      state: 'random-state-' + Date.now(),
    })
    // 在新标签页打开授权服务器（当前页面不丢失）
    window.open(`${AUTH_SERVER}/oauth2/authorize?${params}`, '_blank')
  }

  const steps = [
    {
      title: '第 1 步：用户访问客户端',
      desc: '用户打开你的网站（前端应用），点击"使用第三方账号登录"按钮。',
    },
    {
      title: '第 2 步：跳转到授权服务器',
      desc: `浏览器打开新标签页，跳转到授权服务器的授权端点：\nGET ${AUTH_SERVER}/oauth2/authorize?response_type=code&client_id=web-app&scope=openid+read+write&redirect_uri=...`,
    },
    {
      title: '第 3 步：用户登录并授权',
      desc: '用户在授权服务器上登录账号，然后确认授权（同意把权限给客户端应用）。',
    },
    {
      title: '第 4 步：授权服务器返回授权码',
      desc: '授权服务器把授权码（code）通过 URL 参数返回到回调页面：\nhttp://127.0.0.1:5173/callback?code=xxx&state=xxx\n回调页面会自动用 code 换取 token。',
    },
    {
      title: '第 5 步：用授权码换取 Token',
      desc: '回调页面自动向授权服务器发送 POST 请求换取 access_token 和 refresh_token。\n注意：这一步是后端对后端的通信（在本项目中为了演示简化由前端完成）。',
    },
    {
      title: '第 6 步：使用 Token 访问资源',
      desc: '拿到 access_token 后，就可以用它来访问资源服务器的 API 了。\n在请求头加上：Authorization: Bearer <token>',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">授权码模式（Authorization Code）</h2>
        <p className="text-gray-600">
          这是最安全、最常用的 OAuth2.0 模式。适用于有后端的 Web 应用。
          Token 不会暴露给浏览器（URL 中只出现一次性的授权码 code）。
        </p>
      </div>

      {/* 流程步骤 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-700 mb-4">流程步骤</h3>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                step === i ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 bg-gray-50'
              }`}
              onClick={() => setStep(i)}
            >
              <div className="font-bold text-gray-800">{s.title}</div>
              {step === i && (
                <pre className="mt-2 text-sm text-gray-600 whitespace-pre-wrap font-sans">{s.desc}</pre>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 开始按钮 */}
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <p className="text-gray-600 mb-4">
          点击下方按钮，体验完整的授权码模式流程。
          会在新标签页打开授权服务器的登录页面，本页面不会被关闭。
        </p>
        <button
          onClick={startAuth}
          className="bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-indigo-600 transition-colors"
        >
          🚀 开始授权码模式
        </button>
      </div>
    </div>
  )
}
