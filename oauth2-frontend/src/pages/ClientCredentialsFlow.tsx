import { useState } from 'react'

// 通过 Vite 代理 /auth -> localhost:9000，避免 CORS
const AUTH_SERVER = '/auth'

/**
 * 客户端模式（Client Credentials）页面
 *
 * 这种模式没有"用户"的概念，是纯机器对机器的认证。
 */
export default function ClientCredentialsFlow() {
  const [loading, setLoading] = useState(false)
  const [tokenResponse, setTokenResponse] = useState<any>(null)
  const [error, setError] = useState('')
  const [apiResponse, setApiResponse] = useState<any>(null)

  const getToken = async () => {
    setLoading(true)
    setError('')
    setTokenResponse(null)
    setApiResponse(null)

    try {
      const credentials = btoa('server-app:server-secret')

      const response = await fetch(`${AUTH_SERVER}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'read write',
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(`获取 Token 失败: ${data.error} - ${data.error_description || ''}`)
        return
      }

      setTokenResponse(data)
    } catch (err: any) {
      setError(`请求失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const callApi = async (url: string) => {
    if (!tokenResponse?.access_token) return

    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenResponse.access_token}`,
        },
      })
      const data = await res.json()
      setApiResponse({ status: res.status, body: data })
    } catch (err: any) {
      setApiResponse({ error: err.message })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">客户端模式（Client Credentials）</h2>
        <p className="text-gray-600">
          没有用户参与，纯机器对机器的认证。适用于微服务间调用、定时任务等场景。
          只有 access_token，没有 refresh_token（因为没有用户）。
        </p>
      </div>

      {/* 获取 Token */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-700 mb-3">第 1 步：获取 Token</h3>
        <p className="text-sm text-gray-500 mb-4">
          客户端直接用自己的 client_id 和 client_secret 向授权服务器请求 token。
        </p>
        <button
          onClick={getToken}
          disabled={loading}
          className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
        >
          {loading ? '请求中...' : '🔑 获取 Token'}
        </button>
      </div>

      {/* Token 结果 */}
      {tokenResponse && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-700 mb-3">✅ Token 获取成功</h3>
          <pre className="bg-green-50 rounded-lg p-4 text-xs font-mono overflow-auto whitespace-pre-wrap">
            {JSON.stringify(tokenResponse, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* 调用 API */}
      {tokenResponse && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-700 mb-3">第 2 步：使用 Token 调用 API</h3>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => callApi('/api/orders')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
            >
              📦 查询订单
            </button>
            <button
              onClick={() => callApi('/api/user/info')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
            >
              👤 用户信息
            </button>
          </div>
        </div>
      )}

      {/* API 响应 */}
      {apiResponse && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-700 mb-3">API 响应</h3>
          <pre className="bg-gray-50 rounded-lg p-4 text-xs font-mono overflow-auto whitespace-pre-wrap">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}

      {/* 知识点 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-700 mb-3">知识点</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="bg-blue-50 rounded-lg p-4">
            <strong className="text-blue-800">请求参数：</strong>
            <code className="block mt-1 text-blue-700">grant_type=client_credentials&scope=read+write</code>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <strong className="text-green-800">认证方式：</strong>
            <code className="block mt-1 text-green-700">Authorization: Basic base64(client_id:client_secret)</code>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <strong className="text-amber-800">特点：</strong>
            <ul className="mt-1 list-disc list-inside">
              <li>没有用户参与，只有客户端自己的身份</li>
              <li>没有 refresh_token</li>
              <li>适用于微服务间通信</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
