import { useState, useEffect } from 'react'
import { supabase, Transaction } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchTransactions = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          contact:contacts(*)
        `)
        .eq('user_id', user.id)
        .order('due_date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'contact'>) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transactionData, user_id: user.id }])
        .select(`
          *,
          contact:contacts(*)
        `)
        .single()

      if (error) throw error
      
      setTransactions(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar transação'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          contact:contacts(*)
        `)
        .single()

      if (error) throw error

      setTransactions(prev => prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...data } : transaction
      ))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar transação'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setTransactions(prev => prev.filter(transaction => transaction.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar transação'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const togglePaidStatus = async (id: string, isPaid: boolean) => {
    const updates: Partial<Transaction> = {
      is_paid: isPaid,
      paid_date: isPaid ? new Date().toISOString().split('T')[0] : null
    }
    
    return updateTransaction(id, updates)
  }

  useEffect(() => {
    fetchTransactions()
  }, [user])

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    togglePaidStatus,
    refetch: fetchTransactions
  }
}