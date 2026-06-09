import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * 授权码模式的回调页面
 *
 * 授权服务器在用户登录同意后，会重定向到这里：
 * http://localhost:5173/callback?code=xxx&state=xxx
 *
 * 这个页面负责：
 * 1. 从 URL 参数中提取 code
 * 2. 把 code 存到 localStorage（让 AuthorizationCodeFlow 组件读取）
 * 3. 跳回授权码模式页面去换 token
 */
export default function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    if (error) {
      localStorage.setItem('oauth_error', error)
      navigate('/authorization-code')
      return
    }

    if (code) {
      localStorage.setItem('oauth_code', code)
      navigate('/authorization-code')
    }
  }, [navigate])

  return (
    <div className="card">
      <h2>处理授权回调中...</h2>
      <p>正在从 URL 中提取授权码，请稍等。</p>
    </div>
  )
}
