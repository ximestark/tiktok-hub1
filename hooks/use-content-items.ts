"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type ContentItem = Database["public"]["Tables"]["content_items"]["Row"]
type ContentItemInsert = Database["public"]["Tables"]["content_items"]["Insert"]
type ContentItemUpdate = Database["public"]["Tables"]["content_items"]["Update"]

// Datos de ejemplo para cuando Supabase no esté configurado
const sampleData: ContentItem[] = [
  {
    id: "sample-1",
    title: "Tutorial de maquillaje natural",
    description: "Mostrar paso a paso un look natural para el día",
    script: "Hola! Hoy les voy a enseñar mi rutina de maquillaje natural...",
    status: "script-ready",
    recording_date: "2024-01-15",
    publish_date: "2024-01-16",
    platform: "both",
    tags: ["maquillaje", "tutorial", "natural"],
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "sample-2",
    title: "Receta de smoothie verde",
    description: "Smoothie saludable con espinacas y frutas",
    script: null,
    status: "idea",
    recording_date: null,
    publish_date: null,
    platform: "reels",
    tags: ["receta", "saludable", "smoothie"],
    created_at: "2024-01-11T00:00:00Z",
    updated_at: "2024-01-11T00:00:00Z",
  },
]

export function useContentItems() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar items al inicializar
  useEffect(() => {
    if (isSupabaseConfigured) {
      loadContentItems()
    } else {
      // Usar datos de ejemplo si Supabase no está configurado
      setContentItems(sampleData)
      setLoading(false)
      setError("Supabase no está configurado. Usando datos de ejemplo.")
    }
  }, [])

  const loadContentItems = async () => {
    if (!supabase) {
      setError("Supabase no está configurado")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.from("content_items").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setContentItems(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error loading content items"
      setError(errorMessage)
      console.error("Error loading content items:", err)
      // Usar datos de ejemplo como fallback
      setContentItems(sampleData)
    } finally {
      setLoading(false)
    }
  }

  const addContentItem = async (item: ContentItemInsert) => {
    if (!supabase) {
      // Modo local sin Supabase
      const newItem: ContentItem = {
        id: `local-${Date.now()}`,
        title: item.title,
        description: item.description,
        script: item.script || null,
        status: item.status || "idea",
        recording_date: item.recording_date || null,
        publish_date: item.publish_date || null,
        platform: item.platform || "both",
        tags: item.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setContentItems((prev) => [newItem, ...prev])
      return newItem
    }

    try {
      setError(null)
      const { data, error } = await supabase.from("content_items").insert([item]).select().single()

      if (error) throw error

      setContentItems((prev) => [data, ...prev])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error adding content item"
      setError(errorMessage)
      console.error("Error adding content item:", err)
      throw err
    }
  }

  const updateContentItem = async (id: string, updates: ContentItemUpdate) => {
    if (!supabase) {
      // Modo local sin Supabase
      setContentItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item)),
      )
      return
    }

    try {
      setError(null)
      const { data, error } = await supabase.from("content_items").update(updates).eq("id", id).select().single()

      if (error) throw error

      setContentItems((prev) => prev.map((item) => (item.id === id ? data : item)))
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error updating content item"
      setError(errorMessage)
      console.error("Error updating content item:", err)
      throw err
    }
  }

  const deleteContentItem = async (id: string) => {
    if (!supabase) {
      // Modo local sin Supabase
      setContentItems((prev) => prev.filter((item) => item.id !== id))
      return
    }

    try {
      setError(null)
      const { error } = await supabase.from("content_items").delete().eq("id", id)

      if (error) throw error

      setContentItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error deleting content item"
      setError(errorMessage)
      console.error("Error deleting content item:", err)
      throw err
    }
  }

  return {
    contentItems,
    loading,
    error,
    addContentItem,
    updateContentItem,
    deleteContentItem,
    refreshItems: loadContentItems,
    isSupabaseConfigured,
  }
}
