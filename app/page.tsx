"use client"

import { useState, useEffect } from "react"
import { ContentIdeas } from "@/components/content-ideas"
import { ContentCalendar } from "@/components/content-calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, Video, Upload, Cloud, CloudOff, RefreshCw } from "lucide-react"
import { storage, type ContentItem } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ContentPlannerApp() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Cargar datos al iniciar
  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    try {
      const items = await storage.getItems()
      setContentItems(items)
    } catch (error) {
      console.error("Error loading items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (item: Omit<ContentItem, "id" | "createdAt">) => {
    try {
      const newItem = await storage.addItem(item)
      setContentItems((prev) => [newItem, ...prev])
    } catch (error) {
      console.error("Error adding item:", error)
    }
  }

  const handleUpdateItem = async (id: string, updates: Partial<ContentItem>) => {
    try {
      const updatedItem = await storage.updateItem(id, updates)
      if (updatedItem) {
        setContentItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)))
      }
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const success = await storage.deleteItem(id)
      if (success) {
        setContentItems((prev) => prev.filter((item) => item.id !== id))
      }
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await storage.syncToCloud()
      await loadItems() // Recargar para asegurar sincronización
    } catch (error) {
      console.error("Error syncing:", error)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu contenido...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Content Planner</h1>
              <p className="text-gray-600">Organiza tu contenido de TikTok y Reels de manera eficiente</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  {storage.isCloudEnabled() ? (
                    <>
                      <Cloud className="w-4 h-4 text-green-600" />
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Sincronización en la nube activa
                      </Badge>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-4 h-4 text-orange-600" />
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Solo guardado local
                      </Badge>
                    </>
                  )}
                </div>
                {storage.isCloudEnabled() && (
                  <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                    {syncing ? "Sincronizando..." : "Sincronizar"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <Tabs defaultValue="ideas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="ideas" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Ideas & Guiones
            </TabsTrigger>
            <TabsTrigger value="recording" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Grabación
            </TabsTrigger>
            <TabsTrigger value="publishing" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Publicación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ideas">
            <ContentIdeas
              contentItems={contentItems}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
            />
          </TabsContent>

          <TabsContent value="recording">
            <ContentCalendar contentItems={contentItems} onUpdateItem={handleUpdateItem} calendarType="recording" />
          </TabsContent>

          <TabsContent value="publishing">
            <ContentCalendar contentItems={contentItems} onUpdateItem={handleUpdateItem} calendarType="publishing" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
