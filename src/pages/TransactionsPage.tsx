import React, { useState } from 'react'
import { Plus, Edit, Trash2, Settings } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useContacts } from '../hooks/useContacts'
import { TransactionModal } from '../components/TransactionModal'
import { Transaction } from '../supabaseClient'

export function TransactionsPage() {
  const { transactions, loading, error, createTransaction, updateTransaction, deleteTransaction, togglePaidStatus } = useTransactions()
  const { contacts } = useContacts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'paid' | 'pending'>('all')
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    description: true,
    amount: true,
    date: true,
    due_date: true,
    type: true,
    status: true,
    contact: true,
    actions: true
  })

  const filteredTransactions = transactions.filter(transaction => {
    switch (filter) {
      case 'income':
        return transaction.type === 'income'
      case 'expense':
        return transaction.type === 'expense'
      case 'paid':
        return transaction.is_paid
      case 'pending':
        return !transaction.is_paid
      default:
        return true
    }
  })

  const handleSave = async (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'contact'>) => {
    if (editingTransaction) {
      return await updateTransaction(editingTransaction.id, transactionData)
    } else {
      return await createTransaction(transactionData)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleDelete = async (transaction: Transaction) => {
    if (confirm(`Tem certeza que deseja excluir a transação "${transaction.description}"?`)) {
      await deleteTransaction(transaction.id)
    }
  }

  const handleTogglePaid = async (transaction: Transaction) => {
    await togglePaidStatus(transaction.id, !transaction.is_paid)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTransaction(undefined)
  }

  const getStatusBadge = (transaction: Transaction) => {
    if (transaction.is_paid) {
      return <span className="status-badge status-paid">Pago</span>
    }
    
    const today = new Date()
    const dueDate = new Date(transaction.due_date)
    
    if (dueDate < today) {
      return <span className="status-badge status-overdue">Vencido</span>
    }
    
    return <span className="status-badge status-open">Pendente</span>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return <div>Carregando transações...</div>
  }

  if (error) {
    return <div className="error-message">Erro: {error}</div>
  }

  return (
    <>
      <div className="page-header">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button 
            className={filter === 'income' ? 'active' : ''}
            onClick={() => setFilter('income')}
          >
            Receitas
          </button>
          <button 
            className={filter === 'expense' ? 'active' : ''}
            onClick={() => setFilter('expense')}
          >
            Despesas
          </button>
          <button 
            className={filter === 'paid' ? 'active' : ''}
            onClick={() => setFilter('paid')}
          >
            Pagas
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pendentes
          </button>
        </div>

        <div className="column-selector-container">
          <button 
            className="column-selector-button"
            onClick={() => setShowColumnSelector(!showColumnSelector)}
          >
            <Settings />
            Colunas
          </button>
          
          {showColumnSelector && (
            <div className="column-selector-dropdown">
              {Object.entries(visibleColumns).map(([key, visible]) => (
                <div 
                  key={key}
                  className="column-selector-item"
                  onClick={() => setVisibleColumns(prev => ({ ...prev, [key]: !visible }))}
                >
                  <input type="checkbox" checked={visible} readOnly />
                  {key === 'description' && 'Descrição'}
                  {key === 'amount' && 'Valor'}
                  {key === 'date' && 'Data'}
                  {key === 'due_date' && 'Vencimento'}
                  {key === 'type' && 'Tipo'}
                  {key === 'status' && 'Status'}
                  {key === 'contact' && 'Contato'}
                  {key === 'actions' && 'Ações'}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="empty-state">
          {filter === 'all' 
            ? 'Nenhuma transação cadastrada. Clique no botão + para adicionar a primeira.'
            : 'Nenhuma transação encontrada para este filtro.'
          }
        </p>
      ) : (
        <div className="table-container">
          <table className="financial-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    className="status-checkbox"
                    title="Marcar/Desmarcar todos"
                  />
                </th>
                {visibleColumns.description && <th>Descrição</th>}
                {visibleColumns.amount && <th>Valor</th>}
                {visibleColumns.date && <th>Data</th>}
                {visibleColumns.due_date && <th>Vencimento</th>}
                {visibleColumns.type && <th>Tipo</th>}
                {visibleColumns.status && <th>Status</th>}
                {visibleColumns.contact && <th>Contato</th>}
                {visibleColumns.actions && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <tr 
                  key={transaction.id} 
                  className={`transaction-row ${transaction.is_paid ? 'paid' : ''}`}
                >
                  <td>
                    <input 
                      type="checkbox" 
                      className="status-checkbox"
                      checked={transaction.is_paid}
                      onChange={() => handleTogglePaid(transaction)}
                    />
                  </td>
                  {visibleColumns.description && (
                    <td>{transaction.description}</td>
                  )}
                  {visibleColumns.amount && (
                    <td className={`amount ${transaction.type}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                  )}
                  {visibleColumns.date && (
                    <td>{formatDate(transaction.date)}</td>
                  )}
                  {visibleColumns.due_date && (
                    <td>{formatDate(transaction.due_date)}</td>
                  )}
                  {visibleColumns.type && (
                    <td>{transaction.type === 'income' ? 'Receita' : 'Despesa'}</td>
                  )}
                  {visibleColumns.status && (
                    <td>{getStatusBadge(transaction)}</td>
                  )}
                  {visibleColumns.contact && (
                    <td>{transaction.contact?.name || '-'}</td>
                  )}
                  {visibleColumns.actions && (
                    <td>
                      <div className="item-actions">
                        <button 
                          className="action-button"
                          onClick={() => handleEdit(transaction)}
                          title="Editar"
                        >
                          <Edit />
                        </button>
                        <button 
                          className="action-button"
                          onClick={() => handleDelete(transaction)}
                          title="Excluir"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button 
        className="fab"
        onClick={() => setIsModalOpen(true)}
        title="Adicionar Transação"
      >
        <Plus />
      </button>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        transaction={editingTransaction}
        contacts={contacts}
      />
    </>
  )
}