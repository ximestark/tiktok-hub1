import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are not configured. Using fallback mode.")
}

// Crear cliente solo si las variables están disponibles
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      content_items: {
        Row: {
          id: string
          title: string
          description: string
          script: string | null
          status: "idea" | "script-ready" | "recorded" | "published"
          recording_date: string | null
          publish_date: string | null
          platform: "tiktok" | "reels" | "both"
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          script?: string | null
          status?: "idea" | "script-ready" | "recorded" | "published"
          recording_date?: string | null
          publish_date?: string | null
          platform?: "tiktok" | "reels" | "both"
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          script?: string | null
          status?: "idea" | "script-ready" | "recorded" | "published"
          recording_date?: string | null
          publish_date?: string | null
          platform?: "tiktok" | "reels" | "both"
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
