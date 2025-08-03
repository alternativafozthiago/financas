import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Contact {
  id: string
  user_id: string
  created_at: string
  name: string
  type: 'empresa' | 'cliente'
  email?: string
  recurring_charge?: {
    isActive: boolean
    amount: number
    launchDay: number
    dueDay: number
  }
}

export interface Transaction {
  id: string
  user_id: string
  created_at: string
  description: string
  amount: number
  date: string
  due_date: string
  type: 'income' | 'expense'
  is_paid: boolean
  paid_date?: string
  is_recurring: boolean
  contact_id?: string
  contact?: Contact
}