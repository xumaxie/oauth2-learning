import { Routes, Route, NavLink } from 'react-router-dom'
import AuthorizationCodeFlow from './pages/AuthorizationCodeFlow'
import ClientCredentialsFlow from './pages/ClientCredentialsFlow'
import ResourceApiDemo from './pages/ResourceApiDemo'
import CallbackPage from './pages/CallbackPage'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            🔐 OAuth2.0 学习平台
          </h1>
          <div className="flex gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              授权码模式
            </NavLink>
            <NavLink
              to="/client-credentials"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              客户端模式
            </NavLink>
            <NavLink
              to="/resource-api"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              资源接口测试
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<AuthorizationCodeFlow />} />
          <Route path="/client-credentials" element={<ClientCredentialsFlow />} />
          <Route path="/resource-api" element={<ResourceApiDemo />} />
          <Route path="/callback" element={<CallbackPage />} />
        </Routes>
      </main>
    </div>
  )
}
