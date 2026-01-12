import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de datos para la base de datos
export type Database = {
  public: {
    Tables: {
      itinerario: {
        Row: {
          id: string
          fecha: string
          titulo: string
          descripcion: string
          hora: string
          ubicacion: string
          completado: boolean
          created_at: string
        }
        Insert: {
          id?: string
          fecha: string
          titulo: string
          descripcion?: string
          hora?: string
          ubicacion?: string
          completado?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          fecha?: string
          titulo?: string
          descripcion?: string
          hora?: string
          ubicacion?: string
          completado?: boolean
          created_at?: string
        }
      }
      gastos: {
        Row: {
          id: string
          categoria: string
          monto: number
          descripcion: string
          fecha: string
          tipo: string
          created_at: string
        }
        Insert: {
          id?: string
          categoria: string
          monto: number
          descripcion: string
          fecha: string
          tipo?: string
          created_at?: string
        }
        Update: {
          id?: string
          categoria?: string
          monto?: number
          descripcion?: string
          fecha?: string
          tipo?: string
          created_at?: string
        }
      }
      lugares: {
        Row: {
          id: string
          nombre: string
          descripcion: string
          categoria: string
          visitado: boolean
          prioridad: number
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string
          categoria: string
          visitado?: boolean
          prioridad?: number
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string
          categoria?: string
          visitado?: boolean
          prioridad?: number
          created_at?: string
        }
      }
      equipaje: {
        Row: {
          id: string
          item: string
          categoria: string
          empacado: boolean
          created_at: string
        }
        Insert: {
          id?: string
          item: string
          categoria: string
          empacado?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          item?: string
          categoria?: string
          empacado?: boolean
          created_at?: string
        }
      }
    }
  }
}