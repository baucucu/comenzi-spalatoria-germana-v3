"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, GripVertical } from "lucide-react"

interface OrderStatus {
  id: number
  name: string
  label: string
  color: string
  position: number
  created_at: string
  updated_at: string
  status_final: boolean
}

const colorOptions = [
  { value: "bg-emerald-500", label: "Verde", preview: "bg-emerald-500" },
  { value: "bg-yellow-500", label: "Galben", preview: "bg-yellow-500" },
  { value: "bg-purple-500", label: "Mov", preview: "bg-purple-500" },
  { value: "bg-orange-500", label: "Portocaliu", preview: "bg-orange-500" },
  { value: "bg-blue-500", label: "Albastru", preview: "bg-blue-500" },
  { value: "bg-red-500", label: "Roșu", preview: "bg-red-500" },
  { value: "bg-gray-500", label: "Gri", preview: "bg-gray-500" },
  { value: "bg-destructive", label: "Destructiv", preview: "bg-destructive" },
  { value: "bg-pink-500", label: "Roz", preview: "bg-pink-500" },
  { value: "bg-indigo-500", label: "Indigo", preview: "bg-indigo-500" },
]

const initialStatuses: OrderStatus[] = [
  {
    id: 1,
    name: "noua",
    label: "Nouă",
    color: "bg-emerald-500",
    position: 1,
    created_at: "2025-02-19T12:22:49.174431+00:00",
    updated_at: "2025-02-20T09:46:19.634685+00:00",
    status_final: false,
  },
  {
    id: 2,
    name: "in_asteptare",
    label: "În așteptare",
    color: "bg-yellow-500",
    position: 2,
    created_at: "2025-02-19T12:22:49.174431+00:00",
    updated_at: "2025-02-20T09:46:19.758155+00:00",
    status_final: false,
  },
  {
    id: 4,
    name: "in_livrare",
    label: "În livrare",
    color: "bg-purple-500",
    position: 3,
    created_at: "2025-02-19T12:22:49.174431+00:00",
    updated_at: "2025-02-20T09:46:23.626808+00:00",
    status_final: false,
  },
  {
    id: 5,
    name: "in_ridicare",
    label: "În ridicare",
    color: "bg-orange-500",
    position: 4,
    created_at: "2025-02-19T12:22:49.174431+00:00",
    updated_at: "2025-02-20T09:46:26.58945+00:00",
    status_final: false,
  },
  {
    id: 3,
    name: "gata",
    label: "Gata",
    color: "bg-blue-500",
    position: 5,
    created_at: "2025-02-19T12:22:49.174431+00:00",
    updated_at: "2025-02-20T09:46:26.702824+00:00",
    status_final: false,
  },
  {
    id: 6,
    name: "finalizata",
    label: "Finalizată",
    color: "bg-gray-500",
    position: 6,
    created_at: "2025-02-19T12:22:49.174431+00:00",
    updated_at: "2025-02-19T12:44:53.297466+00:00",
    status_final: true,
  },
  {
    id: 7,
    name: "anulata",
    label: "Anulată",
    color: "bg-destructive",
    position: 7,
    created_at: "2025-02-19T12:22:49.174431+00:00",
    updated_at: "2025-02-19T12:44:53.297466+00:00",
    status_final: true,
  },
]

export default function OrderStatusManager() {
  const [statuses, setStatuses] = useState<OrderStatus[]>(initialStatuses)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<OrderStatus | null>(null)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    color: "bg-blue-500",
    status_final: false,
  })

  const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position)

  const resetForm = () => {
    setFormData({
      name: "",
      label: "",
      color: "bg-blue-500",
      status_final: false,
    })
  }

  const handleAdd = () => {
    if (!formData.name || !formData.label) return

    const newStatus: OrderStatus = {
      id: Math.max(...statuses.map((s) => s.id)) + 1,
      name: formData.name,
      label: formData.label,
      color: formData.color,
      position: statuses.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status_final: formData.status_final,
    }

    setStatuses([...statuses, newStatus])
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!editingStatus || !formData.name || !formData.label) return

    setStatuses(
      statuses.map((status) =>
        status.id === editingStatus.id
          ? {
              ...status,
              name: formData.name,
              label: formData.label,
              color: formData.color,
              status_final: formData.status_final,
              updated_at: new Date().toISOString(),
            }
          : status,
      ),
    )
    setEditingStatus(null)
    resetForm()
  }

  const handleDelete = (id: number) => {
    setStatuses(statuses.filter((status) => status.id !== id))
  }

  const openEditDialog = (status: OrderStatus) => {
    setEditingStatus(status)
    setFormData({
      name: status.name,
      label: status.label,
      color: status.color,
      status_final: status.status_final,
    })
  }

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault()

    if (!draggedItem || draggedItem === targetId) return

    const draggedStatus = statuses.find((s) => s.id === draggedItem)
    const targetStatus = statuses.find((s) => s.id === targetId)

    if (!draggedStatus || !targetStatus) return

    const newStatuses = statuses.map((status) => {
      if (status.id === draggedItem) {
        return { ...status, position: targetStatus.position, updated_at: new Date().toISOString() }
      }
      if (status.id === targetId) {
        return { ...status, position: draggedStatus.position, updated_at: new Date().toISOString() }
      }
      return status
    })

    setStatuses(newStatuses)
    setDraggedItem(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestionare Statusuri Comenzi</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Adaugă Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adaugă Status Nou</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nume (intern)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: in_procesare"
                  />
                </div>
                <div>
                  <Label htmlFor="label">Etichetă (afișare)</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="ex: În procesare"
                  />
                </div>
                <div>
                  <Label>Culoare</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-8 h-8 rounded ${color.preview} border-2 ${
                          formData.color === color.value ? "border-foreground" : "border-transparent"
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status_final"
                    checked={formData.status_final}
                    onCheckedChange={(checked) => setFormData({ ...formData, status_final: checked })}
                  />
                  <Label htmlFor="status_final">Status final</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Anulează
                  </Button>
                  <Button onClick={handleAdd}>Adaugă</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedStatuses.map((status) => (
              <div
                key={status.id}
                draggable
                onDragStart={(e) => handleDragStart(e, status.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status.id)}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-move"
              >
                <div className="flex items-center space-x-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                  <span className="text-sm text-muted-foreground">({status.name})</span>
                  {status.status_final && (
                    <Badge variant="outline" className="text-xs">
                      Final
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Poziția {status.position}</span>
                  <Dialog
                    open={editingStatus?.id === status.id}
                    onOpenChange={(open) => !open && setEditingStatus(null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(status)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editează Status</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name">Nume (intern)</Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-label">Etichetă (afișare)</Label>
                          <Input
                            id="edit-label"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Culoare</Label>
                          <div className="grid grid-cols-5 gap-2 mt-2">
                            {colorOptions.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, color: color.value })}
                                className={`w-8 h-8 rounded ${color.preview} border-2 ${
                                  formData.color === color.value ? "border-foreground" : "border-transparent"
                                }`}
                                title={color.label}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit-status_final"
                            checked={formData.status_final}
                            onCheckedChange={(checked) => setFormData({ ...formData, status_final: checked })}
                          />
                          <Label htmlFor="edit-status_final">Status final</Label>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setEditingStatus(null)}>
                            Anulează
                          </Button>
                          <Button onClick={handleEdit}>Salvează</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Șterge Status</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ești sigur că vrei să ștergi statusul "{status.label}"? Această acțiune nu poate fi anulată.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anulează</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(status.id)}>Șterge</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
