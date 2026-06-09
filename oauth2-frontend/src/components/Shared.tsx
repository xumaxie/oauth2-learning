import { useState } from 'react'

/**
 * 通用工具组件 —— 展示 HTTP 请求/响应信息
 */
export function RequestInfo({ method, url, headers, body }: {
  method: string; url: string; headers?: Record<string, string>; body?: string
}) {
  return (
    <div className="card">
      <h3>HTTP 请求</h3>
      <div className="json-box">
        <span style={{ color: '#38bdf8' }}>{method}</span> {url}
        {headers && (
          <>
            {'\n\nHeaders:\n'}
            {Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n')}
          </>
        )}
        {body && `\n\nBody:\n${body}`}
      </div>
    </div>
  )
}

export function ResponseDisplay({ data, error }: { data?: any; error?: string }) {
  if (error) {
    return (
      <div className="card">
        <h3 style={{ color: '#f87171' }}>响应（错误）</h3>
        <div className="json-box" style={{ color: '#f87171' }}>{error}</div>
      </div>
    )
  }
  if (data) {
    return (
      <div className="card">
        <h3 style={{ color: '#4ade80' }}>响应（成功）</h3>
        <pre className="json-box">{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  }
  return null
}

/**
 * 解析 JWT Token（只是为了在前端展示，不需要密钥）
 * JWT 格式：header.payload.signature（三段 base64 用 . 分隔）
 */
export function decodeJwt(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { error: '不是有效的 JWT 格式' }
    const decode = (s: string) => {
      let str = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
      try { return JSON.parse(str) } catch { return str }
    }
    return {
      header: decode(parts[0]),
      payload: decode(parts[1]),
      signature: parts[2] + '（签名部分，无法在前端解码）',
    }
  } catch (e) {
    return { error: String(e) }
  }
}

/**
 * Token 展示器 —— 显示 token 和解析后的内容
 */
export function TokenDisplay({ token }: { token: string }) {
  const [showDetail, setShowDetail] = useState(false)
  const decoded = decodeJwt(token)

  return (
    <div className="card">
      <h3>Access Token</h3>
      <div className="token-box">{token}</div>
      <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }}
        onClick={() => setShowDetail(!showDetail)}>
        {showDetail ? '隐藏' : '解码'} JWT 详情
      </button>
      {showDetail && !('error' in decoded) && (
        <div style={{ marginTop: '0.5rem' }}>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Header:</p>
          <pre className="json-box">{JSON.stringify(decoded.header, null, 2)}</pre>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Payload（载荷，包含用户信息）:</p>
          <pre className="json-box">{JSON.stringify(decoded.payload, null, 2)}</pre>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Signature:</p>
          <pre className="json-box">{decoded.signature}</pre>
        </div>
      )}
    </div>
  )
}
