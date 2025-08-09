"use client"

import { useState } from "react"
import type { ContentItem } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Video, Upload } from "lucide-react"

interface ContentCalendarProps {
  contentItems: ContentItem[]
  onUpdateItem: (id: string, updates: Partial<ContentItem>) => void
  calendarType: "recording" | "publishing"
}

export function ContentCalendar({ contentItems, onUpdateItem, calendarType }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const isRecordingCalendar = calendarType === "recording"

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDateIter = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDateIter))
      currentDateIter.setDate(currentDateIter.getDate() + 1)
    }

    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getItemsForDate = (date: string) => {
    return contentItems.filter((item) => {
      const targetDate = isRecordingCalendar ? item.recordingDate : item.publishDate
      return targetDate === date
    })
  }

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleDrop = (itemId: string, newDate: string) => {
    const updates: any = {}
    if (isRecordingCalendar) {
      updates.recordingDate = newDate
    } else {
      updates.publishDate = newDate
    }
    onUpdateItem(itemId, updates)
  }

  const removeFromCalendar = (itemId: string) => {
    const updates: any = {}
    if (isRecordingCalendar) {
      updates.recordingDate = undefined
    } else {
      updates.publishDate = undefined
    }
    onUpdateItem(itemId, updates)
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const unscheduledItems = contentItems.filter((item) => {
    const targetDate = isRecordingCalendar ? item.recordingDate : item.publishDate
    return (
      !targetDate &&
      (isRecordingCalendar ? ["script-ready", "recorded"].includes(item.status) : ["recorded"].includes(item.status))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            {isRecordingCalendar ? (
              <>
                <Video className="w-6 h-6" />
                Calendario de Grabación
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                Calendario de Publicación
              </>
            )}
          </h2>
          <p className="text-gray-600">
            {isRecordingCalendar
              ? "Organiza cuándo vas a grabar tu contenido"
              : "Planifica cuándo publicar tu contenido"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Unscheduled Items */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isRecordingCalendar ? "Listo para Grabar" : "Listo para Publicar"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {unscheduledItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white border rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", item.id)
                  }}
                >
                  <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {item.platform === "both" ? "TikTok + Reels" : item.platform === "tiktok" ? "TikTok" : "Reels"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              ))}

              {unscheduledItems.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  {isRecordingCalendar ? "No hay contenido listo para grabar" : "No hay contenido listo para publicar"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDateChange("prev")}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDateChange("next")}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const dateStr = formatDate(day)
                  const itemsForDate = getItemsForDate(dateStr)
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const isToday = dateStr === formatDate(new Date())

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border rounded-lg transition-colors ${
                        isCurrentMonth ? "bg-white" : "bg-gray-50"
                      } ${isToday ? "ring-2 ring-blue-500" : ""} hover:bg-gray-50`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const itemId = e.dataTransfer.getData("text/plain")
                        handleDrop(itemId, dateStr)
                      }}
                    >
                      <div
                        className={`text-sm font-medium mb-2 ${
                          isCurrentMonth ? "text-gray-900" : "text-gray-400"
                        } ${isToday ? "text-blue-600" : ""}`}
                      >
                        {day.getDate()}
                      </div>

                      <div className="space-y-1">
                        {itemsForDate.map((item) => (
                          <div
                            key={item.id}
                            className="p-1 bg-blue-100 text-blue-800 rounded text-xs cursor-pointer hover:bg-blue-200"
                            onClick={() => removeFromCalendar(item.id)}
                            title={`Click para remover: ${item.title}`}
                          >
                            <div className="font-medium truncate">{item.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
