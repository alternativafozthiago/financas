import React from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useContacts } from '../hooks/useContacts'

export function DashboardPage() {
  const { transactions, loading: transactionsLoading } = useTransactions()
  const { contacts, loading: contactsLoading } = useContacts()

  if (transactionsLoading || contactsLoading) {
    return <div>Carregando dashboard...</div>
  }

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear
  })

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const pendingTransactions = transactions.filter(t => !t.is_paid)
  const overdueTransactions = transactions.filter(t => {
    const today = new Date()
    const dueDate = new Date(t.due_date)
    return !t.is_paid && dueDate < today
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  return (
    <div className="dashboard-grid">
      <div className="card stat-card">
        <div className="value income">{formatCurrency(totalIncome)}</div>
        <div className="label">Receitas do Mês</div>
      </div>

      <div className="card stat-card">
        <div className="value expense">{formatCurrency(totalExpenses)}</div>
        <div className="label">Despesas do Mês</div>
      </div>

      <div className="card stat-card">
        <div className={`value ${balance >= 0 ? 'positive' : 'negative'}`}>
          {formatCurrency(balance)}
        </div>
        <div className="label">Saldo do Mês</div>
      </div>

      <div className="card stat-card">
        <div className="value">{contacts.length}</div>
        <div className="label">Total de Contatos</div>
      </div>

      <div className="card stat-card">
        <div className="value">{pendingTransactions.length}</div>
        <div className="label">Transações Pendentes</div>
      </div>

      <div className="card stat-card">
        <div className="value negative">{overdueTransactions.length}</div>
        <div className="label">Transações Vencidas</div>
      </div>
    </div>
  )
}