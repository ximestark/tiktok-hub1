import { createClient } from "@supabase/supabase-js"

export interface ContentItem {
  id: string
  title: string
  description: string
  script?: string
  status: "idea" | "script-ready" | "recorded" | "published"
  recordingDate?: string
  publishDate?: string
  platform: "tiktok" | "reels" | "both"
  tags: string[]
  createdAt: string
}

const STORAGE_KEY = "content-planner-items"

// Configuración de Supabase (opcional)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Datos de ejemplo iniciales
const initialData: ContentItem[] = [
  {
    id: "1",
    title: "Tutorial de maquillaje natural",
    description: "Mostrar paso a paso un look natural para el día",
    script: "Hola! Hoy les voy a enseñar mi rutina de maquillaje natural...",
    status: "script-ready",
    recordingDate: "2024-01-15",
    publishDate: "2024-01-16",
    platform: "both",
    tags: ["maquillaje", "tutorial", "natural"],
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    title: "Receta de smoothie verde",
    description: "Smoothie saludable con espinacas y frutas",
    status: "idea",
    platform: "reels",
    tags: ["receta", "saludable", "smoothie"],
    createdAt: "2024-01-11",
  },
]

// Funciones de localStorage (siempre funcionan)
const localStorageOps = {
  getItems: (): ContentItem[] => {
    if (typeof window === "undefined") return initialData

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData))
        return initialData
      }
      return JSON.parse(stored)
    } catch (error) {
      console.error("Error loading from localStorage:", error)
      return initialData
    }
  },

  saveItems: (items: ContentItem[]): void => {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  },
}

// Funciones de Supabase (opcionales)
const supabaseOps = {
  async getItems(): Promise<ContentItem[]> {
    if (!supabase) return []

    try {
      const { data, error } = await supabase.from("content_items").select("*").order("created_at", { ascending: false })

      if (error) throw error

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        script: item.script || undefined,
        status: item.status,
        recordingDate: item.recording_date || undefined,
        publishDate: item.publish_date || undefined,
        platform: item.platform,
        tags: JSON.parse(item.tags || "[]"),
        createdAt: item.created_at,
      }))
    } catch (error) {
      console.error("Error loading from Supabase:", error)
      return []
    }
  },

  async saveItem(item: ContentItem): Promise<boolean> {
    if (!supabase) return false

    try {
      const { error } = await supabase.from("content_items").upsert({
        id: item.id,
        title: item.title,
        description: item.description,
        script: item.script || null,
        status: item.status,
        recording_date: item.recordingDate || null,
        publish_date: item.publishDate || null,
        platform: item.platform,
        tags: JSON.stringify(item.tags),
        created_at: item.createdAt,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error saving to Supabase:", error)
      return false
    }
  },

  async deleteItem(id: string): Promise<boolean> {
    if (!supabase) return false

    try {
      const { error } = await supabase.from("content_items").delete().eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error deleting from Supabase:", error)
      return false
    }
  },
}

export const storage = {
  // Obtener items (prioriza Supabase, fallback a localStorage)
  async getItems(): Promise<ContentItem[]> {
    let items: ContentItem[] = []

    // Intentar cargar desde Supabase primero
    if (supabase) {
      items = await supabaseOps.getItems()
      if (items.length > 0) {
        // Si hay datos en Supabase, actualizar localStorage
        localStorageOps.saveItems(items)
        return items
      }
    }

    // Si no hay Supabase o no hay datos, usar localStorage
    items = localStorageOps.getItems()

    // Si hay Supabase pero no tenía datos, sincronizar localStorage a Supabase
    if (supabase && items.length > 0) {
      console.log("Sincronizando datos locales a la nube...")
      for (const item of items) {
        await supabaseOps.saveItem(item)
      }
    }

    return items
  },

  // Agregar item
  async addItem(item: Omit<ContentItem, "id" | "createdAt">): Promise<ContentItem> {
    const newItem: ContentItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }

    // Guardar en localStorage (siempre)
    const items = localStorageOps.getItems()
    const updatedItems = [newItem, ...items]
    localStorageOps.saveItems(updatedItems)

    // Guardar en Supabase (si está disponible)
    if (supabase) {
      await supabaseOps.saveItem(newItem)
    }

    return newItem
  },

  // Actualizar item
  async updateItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem | null> {
    // Actualizar en localStorage
    const items = localStorageOps.getItems()
    const itemIndex = items.findIndex((item) => item.id === id)

    if (itemIndex === -1) return null

    const updatedItem = { ...items[itemIndex], ...updates }
    items[itemIndex] = updatedItem
    localStorageOps.saveItems(items)

    // Actualizar en Supabase (si está disponible)
    if (supabase) {
      await supabaseOps.saveItem(updatedItem)
    }

    return updatedItem
  },

  // Eliminar item
  async deleteItem(id: string): Promise<boolean> {
    // Eliminar de localStorage
    const items = localStorageOps.getItems()
    const filteredItems = items.filter((item) => item.id !== id)

    if (filteredItems.length === items.length) return false

    localStorageOps.saveItems(filteredItems)

    // Eliminar de Supabase (si está disponible)
    if (supabase) {
      await supabaseOps.deleteItem(id)
    }

    return true
  },

  // Verificar si Supabase está configurado
  isCloudEnabled: (): boolean => !!supabase,

  // Forzar sincronización
  async syncToCloud(): Promise<boolean> {
    if (!supabase) return false

    try {
      const localItems = localStorageOps.getItems()
      for (const item of localItems) {
        await supabaseOps.saveItem(item)
      }
      return true
    } catch (error) {
      console.error("Error syncing to cloud:", error)
      return false
    }
  },
}
