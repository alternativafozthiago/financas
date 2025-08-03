import React, { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'

export function ReportsPage() {
  const { transactions, loading } = useTransactions()
  const [reportType, setReportType] = useState<'payable' | 'receivable'>('payable')

  if (loading) {
    return <div>Carregando relatórios...</div>
  }

  const payableTransactions = transactions.filter(t => 
    t.type === 'expense' && !t.is_paid
  ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const receivableTransactions = transactions.filter(t => 
    t.type === 'income' && !t.is_paid
  ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const currentTransactions = reportType === 'payable' ? payableTransactions : receivableTransactions

  const totalAmount = currentTransactions.reduce((sum, t) => sum + t.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (transaction: any) => {
    const today = new Date()
    const dueDate = new Date(transaction.due_date)
    
    if (dueDate < today) {
      return <span className="status-badge status-overdue">Vencido</span>
    }
    
    return <span className="status-badge status-open">Pendente</span>
  }

  return (
    <>
      <div className="page-header">
        <div className="filter-buttons">
          <button 
            className={reportType === 'payable' ? 'active' : ''}
            onClick={() => setReportType('payable')}
          >
            Contas a Pagar
          </button>
          <button 
            className={reportType === 'receivable' ? 'active' : ''}
            onClick={() => setReportType('receivable')}
          >
            Contas a Receber
          </button>
        </div>
      </div>

      <div className="card">
        <h3>
          {reportType === 'payable' ? 'Contas a Pagar' : 'Contas a Receber'}
          <span style={{ fontWeight: 'normal', marginLeft: '1rem' }}>
            Total: {formatCurrency(totalAmount)}
          </span>
        </h3>

        {currentTransactions.length === 0 ? (
          <p className="empty-state">
            Nenhuma {reportType === 'payable' ? 'conta a pagar' : 'conta a receber'} pendente.
          </p>
        ) : (
          <div className="table-container">
            <table className="financial-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Contato</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{transaction.description}</td>
                    <td className={`amount ${transaction.type}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td>{formatDate(transaction.due_date)}</td>
                    <td>{transaction.contact?.name || '-'}</td>
                    <td>{getStatusBadge(transaction)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}