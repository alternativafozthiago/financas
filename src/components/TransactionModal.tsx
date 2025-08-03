import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Transaction, Contact } from '../supabaseClient'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'contact'>) => Promise<{ error: string | null }>
  transaction?: Transaction
  contacts: Contact[]
}

export function TransactionModal({ isOpen, onClose, onSave, transaction, contacts }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense',
    is_paid: false,
    paid_date: null as string | null,
    is_recurring: false,
    contact_id: null as string | null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        due_date: transaction.due_date,
        type: transaction.type,
        is_paid: transaction.is_paid,
        paid_date: transaction.paid_date,
        is_recurring: transaction.is_recurring,
        contact_id: transaction.contact_id
      })
    } else {
      setFormData({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        type: 'expense',
        is_paid: false,
        paid_date: null,
        is_recurring: false,
        contact_id: null
      })
    }
    setError('')
  }, [transaction, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await onSave(formData)
      
      if (error) {
        setError(error)
      } else {
        onClose()
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{transaction ? 'Editar Transação' : 'Nova Transação'}</h3>
          <button onClick={onClose} className="close-button">
            <X />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
              disabled={loading}
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Valor (R$)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contato (opcional)</label>
            <select
              id="contact"
              value={formData.contact_id || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_id: e.target.value || null }))}
              disabled={loading}
            >
              <option value="">Selecione um contato</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} ({contact.type})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Data</label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Data de Vencimento</label>
            <input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group-checkbox">
            <input
              id="is_paid"
              type="checkbox"
              checked={formData.is_paid}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                is_paid: e.target.checked,
                paid_date: e.target.checked ? new Date().toISOString().split('T')[0] : null
              }))}
              disabled={loading}
            />
            <label htmlFor="is_paid">Já foi pago</label>
          </div>

          <div className="form-group-checkbox">
            <input
              id="is_recurring"
              type="checkbox"
              checked={formData.is_recurring}
              onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
              disabled={loading}
            />
            <label htmlFor="is_recurring">Transação recorrente</label>
          </div>

          <button type="submit" className="form-button" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  )
}