import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginForm } from './components/LoginForm'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { ContactsPage } from './pages/ContactsPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { ReportsPage } from './pages/ReportsPage'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')

  if (loading) {
    return (
      <div className="login-container">
        <div>Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'contacts':
        return <ContactsPage />
      case 'transactions':
        return <TransactionsPage />
      case 'reports':
        return <ReportsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App