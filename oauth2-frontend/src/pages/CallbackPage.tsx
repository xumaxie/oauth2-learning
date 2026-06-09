import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const AUTH_SERVER = 'http://localhost:9000'

/**
 * 授权码回调页面
 *
 * 授权服务器在用户同意授权后，会重定向到这个页面，URL 中带着授权码（code）。
 * 例如：http://127.0.0.1:5173/callback?code=xxx&state=xxx
 *
 * 这个页面的工作：
 * 1. 从 URL 参数中取出 code
 * 2. 用 code 向授权服务器换取 access_token + refresh_token
 * 3. 展示结果，并提供"刷新 Token"功能
 */
export default function CallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [tokenResponse, setTokenResponse] = useState<any>(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [refreshLog, setRefreshLog] = useState<string[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [expired, setExpired] = useState(false)

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  // 用授权码换取 token
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
  }, [code])

  // 倒计时：access_token 30秒过期
  useEffect(() => {
    if (!tokenResponse) return
    const expires = tokenResponse.expires_in || 30
    setCountdown(expires)
    setExpired(false)

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null
        if (prev <= 1) {
          setExpired(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [tokenResponse])

  // 刷新 Token
  const refreshToken = async () => {
    if (!tokenResponse?.refresh_token) {
      setError('没有 refresh_token，无法刷新')
      return
    }
    setRefreshing(true)
    setError('')
    try {
      const credentials = btoa('web-app:secret')
      const response = await fetch(`${AUTH_SERVER}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenResponse.refresh_token,
        }),
      })
      const data = await response.json()
      if (data.error) {
        setError(`刷新失败: ${data.error} - ${data.error_description || ''}`)
        return
      }
      const now = new Date().toLocaleTimeString()
      setRefreshLog(prev => [...prev, `[${now}] 刷新成功！拿到新的 access_token 和 refresh_token`])
      setTokenResponse(data)
    } catch (err: any) {
      setError(`刷新失败: ${err.message}`)
    } finally {
      setRefreshing(false)
    }
  }

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

        {/* 收到的 code */}
        {code && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-blue-800 mb-2">收到的授权码（code）</h4>
            <code className="text-sm text-blue-600 break-all">{code}</code>
            {state && <div className="mt-2 text-sm text-blue-700"><strong>state:</strong> {state}</div>}
            <p className="text-xs text-blue-600 mt-2">
              注意：code 只能用一次，有效期很短。刷新页面会报错。
            </p>
          </div>
        )}

        {/* Token 展示 */}
        {tokenResponse && (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-green-800 mb-2">Token 获取成功！</h4>
            <div className="bg-white rounded p-3 text-xs font-mono space-y-2 max-h-40 overflow-auto">
              <div>
                <strong>access_token:</strong>
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
            {error}
          </div>
        )}
      </div>

      {/* ====== Refresh Token 演示 ====== */}
      {tokenResponse && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Refresh Token 刷新演示</h3>
          <p className="text-sm text-gray-500 mb-4">
            Access Token 有效期只有 30 秒（为了方便演示）。过期后用 Refresh Token 换一个新的。
          </p>

          {/* 倒计时 */}
          <div className={`rounded-lg p-4 mb-4 ${expired ? 'bg-red-50' : 'bg-indigo-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-700">Access Token 状态：</span>
                {expired ? (
                  <span className="text-red-600 font-bold">已过期</span>
                ) : (
                  <span className="text-indigo-600 font-bold">
                    剩余 {countdown} 秒
                  </span>
                )}
              </div>
              <div className={`text-3xl font-mono font-bold ${expired ? 'text-red-500' : 'text-indigo-500'}`}>
                {countdown}s
              </div>
            </div>
            {/* 进度条 */}
            {!expired && countdown !== null && (
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-500 rounded-full h-2 transition-all duration-1000"
                  style={{ width: `${((countdown || 0) / 30) * 100}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* 流程说明 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-2">
            <div className="font-bold text-gray-700 mb-2">Refresh Token 工作原理：</div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">1</span>
              Access Token 过期了（30秒到了）
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">2</span>
              客户端拿着 refresh_token 发 POST 请求到 /oauth2/token
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <code className="text-xs bg-gray-200 px-1 rounded">grant_type=refresh_token&refresh_token=xxx</code>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">3</span>
              授权服务器返回新的 access_token（用户无感知，不用重新登录）
            </div>
          </div>

          {/* 刷新按钮 */}
          <button
            onClick={refreshToken}
            disabled={refreshing}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              expired
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-indigo-500 hover:bg-indigo-600'
            } disabled:opacity-50`}
          >
            {refreshing ? '刷新中...' : expired ? '🔄 Token 已过期，点击用 Refresh Token 刷新' : '🔄 手动刷新 Token（不用等过期也能刷新）'}
          </button>

          {/* 刷新日志 */}
          {refreshLog.length > 0 && (
            <div className="mt-4 bg-green-50 rounded-lg p-4">
              <div className="font-bold text-green-800 mb-2">刷新记录：</div>
              {refreshLog.map((log, i) => (
                <div key={i} className="text-sm text-green-700">{log}</div>
              ))}
              <p className="text-xs text-green-600 mt-2">
                每次刷新都会拿到新的 access_token 和 refresh_token（轮转机制，旧的 refresh_token 会失效）
              </p>
            </div>
          )}

          {/* 为什么需要 refresh_token */}
          <div className="mt-4 bg-amber-50 rounded-lg p-4">
            <div className="font-bold text-amber-800 mb-2">💡 为什么需要 Refresh Token？</div>
            <div className="text-sm text-amber-700 space-y-1">
              <p>• Access Token 有效期很短（30秒~1小时），因为万一泄露，影响时间有限</p>
              <p>• Refresh Token 有效期很长（7天~30天），但只能用来换新的 Access Token，不能访问资源</p>
              <p>• 用户只需登录一次，之后 Refresh Token 在后台自动续期，用户完全无感</p>
              <p>• 如果 Refresh Token 被盗，服务器可以直接撤销，强制用户重新登录</p>
            </div>
          </div>
        </div>
      )}

      {/* 导航按钮 — 都用新标签页打开，本页保留 token 和倒计时信息 */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            window.open(`http://localhost:5173/resource-api?token=${encodeURIComponent(tokenResponse?.access_token || '')}`, '_blank')
          }}
          className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
        >
          🧪 去测试接口（新标签页，自动填入 Token）
        </button>
        <button
          onClick={() => window.open('http://localhost:5173/', '_blank')}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          🏠 返回首页（新标签页）
        </button>
      </div>
    </div>
  )
}
