import React, { useState } from 'react'
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react'
import { useContacts } from '../hooks/useContacts'
import { ContactModal } from '../components/ContactModal'
import { Contact } from '../supabaseClient'

export function ContactsPage() {
  const { contacts, loading, error, createContact, updateContact, deleteContact } = useContacts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | undefined>()
  const [filter, setFilter] = useState<'all' | 'empresa' | 'cliente'>('all')

  const filteredContacts = contacts.filter(contact => 
    filter === 'all' || contact.type === filter
  )

  const handleSave = async (contactData: Omit<Contact, 'id' | 'user_id' | 'created_at'>) => {
    if (editingContact) {
      return await updateContact(editingContact.id, contactData)
    } else {
      return await createContact(contactData)
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setIsModalOpen(true)
  }

  const handleDelete = async (contact: Contact) => {
    if (confirm(`Tem certeza que deseja excluir o contato "${contact.name}"?`)) {
      await deleteContact(contact.id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingContact(undefined)
  }

  if (loading) {
    return <div>Carregando contatos...</div>
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
            Todos
          </button>
          <button 
            className={filter === 'empresa' ? 'active' : ''}
            onClick={() => setFilter('empresa')}
          >
            Empresas
          </button>
          <button 
            className={filter === 'cliente' ? 'active' : ''}
            onClick={() => setFilter('cliente')}
          >
            Clientes
          </button>
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <p className="empty-state">
          {filter === 'all' 
            ? 'Nenhum contato cadastrado. Clique no botão + para adicionar o primeiro.'
            : `Nenhum ${filter} cadastrado.`
          }
        </p>
      ) : (
        <div className="card">
          <div className="data-list">
            {filteredContacts.map(contact => (
              <div key={contact.id} className="data-item">
                <div className="item-content">
                  <h4>{contact.name}</h4>
                  <p>
                    {contact.type === 'empresa' ? 'Empresa' : 'Cliente'}
                    {contact.email && ` • ${contact.email}`}
                  </p>
                  {contact.recurring_charge?.isActive && (
                    <div className="recurring-tag">
                      <RefreshCw />
                      R$ {contact.recurring_charge.amount.toFixed(2)} - 
                      Venc: dia {contact.recurring_charge.dueDay}
                    </div>
                  )}
                </div>
                <div className="item-actions">
                  <button 
                    className="action-button"
                    onClick={() => handleEdit(contact)}
                    title="Editar"
                  >
                    <Edit />
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => handleDelete(contact)}
                    title="Excluir"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        className="fab"
        onClick={() => setIsModalOpen(true)}
        title="Adicionar Contato"
      >
        <Plus />
      </button>

      <ContactModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        contact={editingContact}
      />
    </>
  )
}