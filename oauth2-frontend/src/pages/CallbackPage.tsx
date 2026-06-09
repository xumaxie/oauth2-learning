import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

// 通过 Vite 代理 /auth -> localhost:9000，避免浏览器 CORS
const AUTH_SERVER = '/auth'

/**
 * 授权码回调页面
 *
 * 授权服务器在用户同意授权后，会重定向到这个页面，URL 中带着授权码（code）。
 * 例如：http://127.0.0.1:5173/callback?code=xxx&state=xxx
 *
 * 这个页面的工作：
 * 1. 从 URL 参数中取出 code
 * 2. 用 code 向授权服务器换取 access_token
 * 3. 展示结果
 */
export default function CallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [tokenResponse, setTokenResponse] = useState<any>(null)
  const [error, setError] = useState('')
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  useEffect(() => {
    if (errorParam) {
      setError(`授权被拒绝: ${errorParam} - ${searchParams.get('error_description') || ''}`)
      setLoading(false)
      return
    }

    if (!code) {
      setError('没有收到授权码（code 参数缺失）')
      setLoading(false)
      return
    }

    const exchangeToken = async () => {
      try {
        const credentials = btoa('web-app:secret')

        const response = await fetch(`${AUTH_SERVER}/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'http://127.0.0.1:5173/callback',
          }),
        })

        const data = await response.json()

        if (data.error) {
          setError(`Token 交换失败: ${data.error} - ${data.error_description || ''}`)
          return
        }

        setTokenResponse(data)
      } catch (err: any) {
        setError(`请求失败: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    exchangeToken()
  }, [code, errorParam])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">授权码回调</h2>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">正在用授权码换取 Token...</p>
          </div>
        )}

        {code && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-blue-800 mb-2">收到的授权码（code）</h4>
            <code className="text-sm text-blue-600 break-all">{code}</code>
            {state && (
              <div className="mt-2 text-sm text-blue-700">
                <strong>state:</strong> {state}
              </div>
            )}
            <p className="text-xs text-blue-600 mt-2">
              注意：这个 code 只能用一次，有效期非常短（通常几分钟）。
              如果刷新页面再次使用会报错。
            </p>
          </div>
        )}

        {tokenResponse && (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-green-800 mb-2">✅ Token 获取成功！</h4>
            <div className="bg-white rounded p-3 text-xs font-mono space-y-2 max-h-60 overflow-auto">
              <div>
                <strong>access_token (JWT):</strong>
                <div className="text-green-600 break-all mt-1">{tokenResponse.access_token}</div>
              </div>
              <div>
                <strong>refresh_token:</strong>
                <div className="text-blue-600 break-all mt-1">{tokenResponse.refresh_token}</div>
              </div>
              <div><strong>token_type:</strong> {tokenResponse.token_type}</div>
              <div><strong>expires_in:</strong> {tokenResponse.expires_in} 秒</div>
              <div><strong>scope:</strong> {tokenResponse.scope}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
            ❌ {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/resource-api')}
            className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
          >
            🧪 去测试接口
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            ← 返回首页
          </button>
        </div>
      </div>
    </div>
  )
}
