import { useState, useEffect } from 'react'
import { supabase, Contact } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchContacts = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos')
    } finally {
      setLoading(false)
    }
  }

  const createContact = async (contactData: Omit<Contact, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{ ...contactData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      
      setContacts(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar contato'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, ...data } : contact
      ))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar contato'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const deleteContact = async (id: string) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setContacts(prev => prev.filter(contact => contact.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar contato'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [user])

  return {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts
  }
}