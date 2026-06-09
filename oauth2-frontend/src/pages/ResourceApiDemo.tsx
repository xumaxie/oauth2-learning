import { useState } from 'react'

/**
 * 资源接口测试页面
 *
 * 这里可以手动输入 token 来测试资源服务器的各种接口，
 * 帮助理解 token 如何保护 API 资源。
 */
export default function ResourceApiDemo() {
  const [token, setToken] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const endpoints = [
    { label: '🌐 公开接口（不需要 Token）', url: '/api/public/hello', needToken: false },
    { label: '👤 用户信息（需 Token）', url: '/api/user/info', needToken: true },
    { label: '📋 用户资料（需 read scope）', url: '/api/user/profile', needToken: true },
    { label: '📦 订单列表（需 read scope）', url: '/api/orders', needToken: true },
  ]

  const callEndpoint = async (url: string, needToken: boolean) => {
    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const headers: Record<string, string> = {}
      if (needToken && token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(url, { headers })
      const data = await res.json()

      if (!res.ok) {
        setError(`HTTP ${res.status}: ${JSON.stringify(data)}`)
        setResponse({ status: res.status, headers: Object.fromEntries(res.headers.entries()), body: data })
        return
      }

      setResponse({ status: res.status, body: data })
    } catch (err: any) {
      setError(`请求失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 说明 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">资源接口测试</h2>
        <p className="text-gray-600">
          在这里你可以手动输入 Token，然后测试资源服务器的各种接口。
          观察有 token 和没 token 时接口返回的区别。
        </p>
      </div>

      {/* Token 输入 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-700 mb-3">Access Token</h3>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="把从授权码模式或客户端模式获取的 access_token 粘贴到这里..."
          className="w-full h-24 p-3 border-2 border-gray-200 rounded-lg text-sm font-mono focus:border-indigo-400 focus:outline-none resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 先去"授权码模式"或"客户端模式"页面获取 token，然后粘贴到这里
        </p>
      </div>

      {/* 接口列表 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-700 mb-4">选择接口测试</h3>
        <div className="grid gap-3">
          {endpoints.map((ep) => (
            <button
              key={ep.url}
              onClick={() => callEndpoint(ep.url, ep.needToken)}
              disabled={loading || (ep.needToken && !token)}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              <span className="font-medium text-gray-700">{ep.label}</span>
              <div className="flex items-center gap-2">
                <code className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">GET {ep.url}</code>
                {ep.needToken && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">需 Token</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 创建订单（POST 示例） */}
      {token && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-700 mb-3">POST 创建订单（需 write scope）</h3>
          <button
            onClick={async () => {
              setLoading(true)
              try {
                const res = await fetch('/api/orders', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ product: '新商品', price: 99 }),
                })
                const data = await res.json()
                setResponse({ status: res.status, body: data })
                if (!res.ok) setError(`HTTP ${res.status}: ${JSON.stringify(data)}`)
              } catch (err: any) {
                setError(err.message)
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50"
          >
            📝 POST 创建订单
          </button>
        </div>
      )}

      {/* 响应结果 */}
      {(response || error) && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-700 mb-3">响应结果</h3>

          {response && (
            <>
              <div className="mb-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                  response.status < 300 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  HTTP {response.status}
                </span>
              </div>
              <pre className="bg-gray-50 rounded-lg p-4 text-xs font-mono overflow-auto whitespace-pre-wrap">
                {JSON.stringify(response.body, null, 2)}
              </pre>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* 知识点 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-700 mb-3">知识点：资源服务器如何工作</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="bg-blue-50 rounded-lg p-4">
            <strong className="text-blue-800">请求头格式：</strong>
            <code className="block mt-1 text-blue-700">Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...</code>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <strong className="text-green-800">验证流程：</strong>
            <ol className="mt-1 list-decimal list-inside space-y-1">
              <li>从请求头取出 Bearer token</li>
              <li>用授权服务器的公钥验证 JWT 签名</li>
              <li>检查 token 是否过期</li>
              <li>检查 scope 是否匹配接口要求的权限</li>
              <li>验证通过，放行请求</li>
            </ol>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <strong className="text-amber-800">常见错误码：</strong>
            <ul className="mt-1 space-y-1">
              <li><code>401</code> - 没有 token 或 token 无效/过期</li>
              <li><code>403</code> - token 有效但没有所需权限（scope 不够）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
