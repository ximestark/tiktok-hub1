"use client"

import type React from "react"

import { useState } from "react"
import type { ContentItem } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, FileText, Lightbulb } from "lucide-react"

interface ContentIdeasProps {
  contentItems: ContentItem[]
  onAddItem: (item: Omit<ContentItem, "id" | "createdAt">) => void
  onUpdateItem: (id: string, updates: Partial<ContentItem>) => void
  onDeleteItem: (id: string) => void
}

export function ContentIdeas({ contentItems, onAddItem, onUpdateItem, onDeleteItem }: ContentIdeasProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    script: "",
    platform: "both" as "tiktok" | "reels" | "both",
    tags: "",
  })

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      script: "",
      platform: "both",
      tags: "",
    })
    setEditingItem(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const newItemData = {
      title: formData.title,
      description: formData.description,
      script: formData.script || undefined,
      platform: formData.platform,
      tags,
      status: "idea" as const,
    }

    if (editingItem) {
      onUpdateItem(editingItem.id, newItemData)
    } else {
      onAddItem(newItemData)
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      script: item.script || "",
      platform: item.platform,
      tags: item.tags.join(", "),
    })
    setIsDialogOpen(true)
  }

  const getStatusColor = (status: ContentItem["status"]) => {
    switch (status) {
      case "idea":
        return "bg-gray-100 text-gray-800"
      case "script-ready":
        return "bg-blue-100 text-blue-800"
      case "recorded":
        return "bg-yellow-100 text-yellow-800"
      case "published":
        return "bg-green-100 text-green-800"
    }
  }

  const getStatusText = (status: ContentItem["status"]) => {
    switch (status) {
      case "idea":
        return "Idea"
      case "script-ready":
        return "Guión Listo"
      case "recorded":
        return "Grabado"
      case "published":
        return "Publicado"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Ideas y Guiones</h2>
          <p className="text-gray-600">Crea y organiza tus ideas de contenido</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nueva Idea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Contenido" : "Nueva Idea de Contenido"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Modifica los detalles de tu contenido" : "Crea una nueva idea para tu contenido"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Tutorial de maquillaje natural"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Plataforma</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value: "tiktok" | "reels" | "both") =>
                      setFormData((prev) => ({ ...prev, platform: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="reels">Reels</SelectItem>
                      <SelectItem value="both">Ambas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe brevemente tu idea de contenido"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="script">Guión (opcional)</Label>
                <Textarea
                  id="script"
                  value={formData.script}
                  onChange={(e) => setFormData((prev) => ({ ...prev, script: e.target.value }))}
                  placeholder="Escribe el guión completo de tu video"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separados por comas)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="Ej: maquillaje, tutorial, natural"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingItem ? "Actualizar" : "Crear Idea"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contentItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(item.status)}>{getStatusText(item.status)}</Badge>
                    <Badge variant="outline">
                      {item.platform === "both" ? "TikTok + Reels" : item.platform === "tiktok" ? "TikTok" : "Reels"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDeleteItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <CardDescription>{item.description}</CardDescription>

              {item.script && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <FileText className="w-4 h-4" />
                  Guión completado
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`script-${item.id}`}
                    checked={
                      item.status === "script-ready" || item.status === "recorded" || item.status === "published"
                    }
                    onChange={(e) => {
                      if (e.target.checked && item.status === "idea") {
                        onUpdateItem(item.id, { status: "script-ready" })
                      } else if (!e.target.checked && item.status === "script-ready") {
                        onUpdateItem(item.id, { status: "idea" })
                      }
                    }}
                    className="rounded"
                  />
                  <label htmlFor={`script-${item.id}`} className="text-sm text-gray-700">
                    Guión listo
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`recorded-${item.id}`}
                    checked={item.status === "recorded" || item.status === "published"}
                    onChange={(e) => {
                      if (e.target.checked && (item.status === "script-ready" || item.status === "idea")) {
                        onUpdateItem(item.id, { status: "recorded" })
                      } else if (!e.target.checked && item.status === "recorded") {
                        onUpdateItem(item.id, { status: "script-ready" })
                      }
                    }}
                    disabled={item.status === "idea"}
                    className="rounded"
                  />
                  <label
                    htmlFor={`recorded-${item.id}`}
                    className={`text-sm ${item.status === "idea" ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Grabación lista
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`published-${item.id}`}
                    checked={item.status === "published"}
                    onChange={(e) => {
                      if (e.target.checked && item.status === "recorded") {
                        onUpdateItem(item.id, { status: "published" })
                      } else if (!e.target.checked && item.status === "published") {
                        onUpdateItem(item.id, { status: "recorded" })
                      }
                    }}
                    disabled={item.status !== "recorded"}
                    className="rounded"
                  />
                  <label
                    htmlFor={`published-${item.id}`}
                    className={`text-sm ${item.status !== "recorded" ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Publicado
                  </label>
                </div>
              </div>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500">Creado: {new Date(item.createdAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contentItems.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes ideas aún</h3>
            <p className="text-gray-600 mb-4">Comienza creando tu primera idea de contenido</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Idea
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
