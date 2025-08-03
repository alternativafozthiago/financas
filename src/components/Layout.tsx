import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  Users, 
  TrendingUp, 
  FileText, 
  LogOut,
  Menu
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { signOut } = useAuth()

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'contacts', label: 'Contatos', icon: Users },
    { id: 'transactions', label: 'Transações', icon: TrendingUp },
    { id: 'reports', label: 'Relatórios', icon: FileText },
  ]

  const getPageTitle = () => {
    const page = navigation.find(nav => nav.id === currentPage)
    return page?.label || 'Dashboard'
  }

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">F</div>
          <h1>Finanças</h1>
        </div>
        
        <nav>
          <ul>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <a
                    href="#"
                    className={currentPage === item.id ? 'active' : ''}
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(item.id)
                    }}
                  >
                    <Icon />
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        
        <button onClick={signOut} className="logout-button">
          <LogOut />
          Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h2>{getPageTitle()}</h2>
        </header>
        
        <div className="page-content">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <ul>
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <a
                  href="#"
                  className={currentPage === item.id ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(item.id)
                  }}
                >
                  <Icon />
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}