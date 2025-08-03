import React, { useState, useEffect } from 'react'
import { X, Building2, User } from 'lucide-react'
import { Contact } from '../supabaseClient'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (contact: Omit<Contact, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>
  contact?: Contact
}

export function ContactModal({ isOpen, onClose, onSave, contact }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'empresa' as 'empresa' | 'cliente',
    email: '',
    recurringCharge: {
      isActive: false,
      amount: 0,
      launchDay: 1,
      dueDay: 10
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        type: contact.type,
        email: contact.email || '',
        recurringCharge: contact.recurring_charge || {
          isActive: false,
          amount: 0,
          launchDay: 1,
          dueDay: 10
        }
      })
    } else {
      setFormData({
        name: '',
        type: 'empresa',
        email: '',
        recurringCharge: {
          isActive: false,
          amount: 0,
          launchDay: 1,
          dueDay: 10
        }
      })
    }
    setError('')
  }, [contact, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const contactData = {
        name: formData.name,
        type: formData.type,
        email: formData.email || null,
        recurring_charge: formData.recurringCharge.isActive ? formData.recurringCharge : null
      }

      const { error } = await onSave(contactData)
      
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
          <h3>{contact ? 'Editar Contato' : 'Novo Contato'}</h3>
          <button onClick={onClose} className="close-button">
            <X />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <fieldset className="contact-type-fieldset">
            <legend>Tipo de Contato</legend>
            <div className="contact-type-selector">
              <button
                type="button"
                className={`contact-type-button ${formData.type === 'empresa' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'empresa' }))}
              >
                <Building2 />
                Empresa
              </button>
              <button
                type="button"
                className={`contact-type-button ${formData.type === 'cliente' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'cliente' }))}
              >
                <User />
                Cliente
              </button>
            </div>
          </fieldset>

          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (opcional)</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="recurring-form-section">
            <div className="recurring-toggle">
              <label htmlFor="recurring">Cobrança Recorrente</label>
              <input
                id="recurring"
                type="checkbox"
                checked={formData.recurringCharge.isActive}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  recurringCharge: { ...prev.recurringCharge, isActive: e.target.checked }
                }))}
                disabled={loading}
              />
            </div>

            {formData.recurringCharge.isActive && (
              <div className="recurring-fields">
                <div className="form-group">
                  <label htmlFor="amount">Valor (R$)</label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.recurringCharge.amount}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurringCharge: { ...prev.recurringCharge, amount: parseFloat(e.target.value) || 0 }
                    }))}
                    required={formData.recurringCharge.isActive}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="launchDay">Dia de Lançamento</label>
                  <input
                    id="launchDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.recurringCharge.launchDay}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurringCharge: { ...prev.recurringCharge, launchDay: parseInt(e.target.value) || 1 }
                    }))}
                    required={formData.recurringCharge.isActive}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dueDay">Dia de Vencimento</label>
                  <input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.recurringCharge.dueDay}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurringCharge: { ...prev.recurringCharge, dueDay: parseInt(e.target.value) || 10 }
                    }))}
                    required={formData.recurringCharge.isActive}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="form-button" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  )
}