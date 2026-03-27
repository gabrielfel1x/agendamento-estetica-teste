export type AppointmentStatus = 'confirmado' | 'pendente' | 'cancelado'
export type UserRole = 'admin' | 'funcionario' | 'cliente'
export type PlanStatus = 'ativo' | 'pendente' | 'cancelado'

export interface Database {
  public: {
    Views: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          phone: string | null
          role: UserRole
          plan: string | null
          plan_status: PlanStatus | null
          subscription_date: string | null
          next_billing_date: string | null
          monthly_value: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          phone?: string | null
          role?: UserRole
          plan?: string | null
          plan_status?: PlanStatus | null
          subscription_date?: string | null
          next_billing_date?: string | null
          monthly_value?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          phone?: string | null
          role?: UserRole
          plan?: string | null
          plan_status?: PlanStatus | null
          subscription_date?: string | null
          next_billing_date?: string | null
          monthly_value?: string | null
          updated_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          since: string
          profile_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          since?: string
          profile_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          phone?: string
          email?: string | null
          since?: string
          profile_id?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          cliente_id: string | null
          patient: string
          phone: string
          procedure: string
          price_num: number
          price: string
          date: string
          time: string
          status: AppointmentStatus
          payment_method: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          patient: string
          phone?: string
          procedure: string
          price_num?: number
          price?: string
          date: string
          time: string
          status?: AppointmentStatus
          payment_method?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          patient?: string
          phone?: string
          procedure?: string
          price_num?: number
          price?: string
          date?: string
          time?: string
          status?: AppointmentStatus
          payment_method?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      procedures_catalog: {
        Row: {
          id: string
          name: string
          price: string
          price_num: number
          active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: string
          price_num: number
          active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          price?: string
          price_num?: number
          active?: boolean
          sort_order?: number
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          slug: string
          name: string
          price: string
          price_num: number
          description: string
          popular: boolean
          active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          price: string
          price_num: number
          description?: string
          popular?: boolean
          active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          name?: string
          price?: string
          price_num?: number
          description?: string
          popular?: boolean
          active?: boolean
          sort_order?: number
          updated_at?: string
        }
      }
      plan_features: {
        Row: {
          id: string
          plan_id: string
          description: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          description: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          plan_id?: string
          description?: string
          sort_order?: number
        }
      }
      clinic_settings: {
        Row: {
          id: string
          active_weekdays: number[]
          start_hour: string
          end_hour: string
          slot_interval: number
          blocked_dates: string[]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          active_weekdays?: number[]
          start_hour?: string
          end_hour?: string
          slot_interval?: number
          blocked_dates?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active_weekdays?: number[]
          start_hour?: string
          end_hour?: string
          slot_interval?: number
          blocked_dates?: string[]
          updated_at?: string
          updated_by?: string | null
        }
      }
    }
    Functions: {
      get_my_role: {
        Args: Record<string, never>
        Returns: string | null
      }
    }
    Enums: {
      appointment_status: AppointmentStatus
    }
  }
}

// Atalhos para os tipos de cada tabela
export type ProfileRow      = Database['public']['Tables']['profiles']['Row']
export type ClienteRow      = Database['public']['Tables']['clientes']['Row']
export type AppointmentRow  = Database['public']['Tables']['appointments']['Row']
export type ProcedureRow    = Database['public']['Tables']['procedures_catalog']['Row']
export type PlanRow         = Database['public']['Tables']['plans']['Row']
export type PlanFeatureRow  = Database['public']['Tables']['plan_features']['Row']
export type ClinicSettings  = Database['public']['Tables']['clinic_settings']['Row']
