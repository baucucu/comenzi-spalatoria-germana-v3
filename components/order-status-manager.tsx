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
import { Plus, Edit, Trash2, GripVertical, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/utils/supabase/client"

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

export default function OrderStatusManager({ statusComenzi = initialStatuses }: { statusComenzi?: OrderStatus[] }) {
    const supabase = createClient()
    const [statuses, setStatuses] = useState<OrderStatus[]>(statusComenzi)
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

    const handleAdd = async () => {
        if (!formData.name || !formData.label) return

        const newStatus = {
            name: formData.name,
            label: formData.label,
            color: formData.color,
            position: statuses.length + 1,
            status_final: formData.status_final,
        }

        try {
            const { data, error } = await supabase.from("order_statuses").insert([newStatus]).select().single()

            if (error) throw error

            setStatuses([...statuses, data])
            setIsAddDialogOpen(false)
            resetForm()
        } catch (error) {
            console.error("Error adding status:", error)
            // Fallback to local state update
            const localStatus = {
                id: Math.max(...statuses.map((s) => s.id)) + 1,
                ...newStatus,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            setStatuses([...statuses, localStatus])
            setIsAddDialogOpen(false)
            resetForm()
        }
    }

    const handleEdit = async () => {
        if (!editingStatus || !formData.name || !formData.label) return

        const updates = {
            name: formData.name,
            label: formData.label,
            color: formData.color,
            status_final: formData.status_final,
            updated_at: new Date().toISOString(),
        }

        try {
            const { error } = await supabase.from("order_statuses").update(updates).eq("id", editingStatus.id)

            if (error) throw error

            setStatuses(statuses.map((status) => (status.id === editingStatus.id ? { ...status, ...updates } : status)))
            setEditingStatus(null)
            resetForm()
        } catch (error) {
            console.error("Error updating status:", error)
            // Fallback to local state update
            setStatuses(statuses.map((status) => (status.id === editingStatus.id ? { ...status, ...updates } : status)))
            setEditingStatus(null)
            resetForm()
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const { error } = await supabase.from("order_statuses").delete().eq("id", id)

            if (error) throw error

            setStatuses(statuses.filter((status) => status.id !== id))
        } catch (error) {
            console.error("Error deleting status:", error)
            // Fallback to local state update
            setStatuses(statuses.filter((status) => status.id !== id))
        }
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

    const handleDrop = async (e: React.DragEvent, targetId: number) => {
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

        // Optimistically update UI
        setStatuses(newStatuses)
        setDraggedItem(null)

        // Update positions in database
        try {
            const updates = [
                {
                    id: draggedItem,
                    position: targetStatus.position,
                    updated_at: new Date().toISOString(),
                },
                {
                    id: targetId,
                    position: draggedStatus.position,
                    updated_at: new Date().toISOString(),
                },
            ]

            for (const update of updates) {
                const { error } = await supabase
                    .from("order_statuses")
                    .update({ position: update.position, updated_at: update.updated_at })
                    .eq("id", update.id)

                if (error) throw error
            }
        } catch (error) {
            console.error("Error updating positions:", error)
            // Revert to original state on error
            setStatuses(statuses)
        }
    }

    return (
        <div className="h-screen w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col">
            <Card className="flex flex-col h-full">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-lg sm:text-xl">Status Comenzi</CardTitle>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm} className="w-full sm:w-auto">
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="sm:inline">Adaugă Status</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-md">
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
                                                    className={`w-8 h-8 rounded ${color.preview} border-2 ${formData.color === color.value ? "border-foreground" : "border-transparent"
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
                                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                                            Anulează
                                        </Button>
                                        <Button onClick={handleAdd} className="w-full sm:w-auto">
                                            Adaugă
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 flex-1 overflow-y-auto">
                    <div className="space-y-3 min-h-0">
                        {sortedStatuses.map((status) => (
                            <div
                                key={status.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, status.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, status.id)}
                                className="border rounded-lg p-4 hover:bg-muted/50 cursor-move touch-manipulation"
                            >
                                {/* Mobile Layout */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge className={`bg-${status.color}-500 text-white flex-shrink-0`}>{status.label}</Badge>
                                                {status.status_final && (
                                                    <Badge variant="outline" className="text-xs flex-shrink-0">
                                                        Final
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Actions */}
                                    <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                                        <Dialog
                                            open={editingStatus?.id === status.id}
                                            onOpenChange={(open) => !open && setEditingStatus(null)}
                                        >
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(status)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="w-[95vw] max-w-md">
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
                                                                    className={`w-8 h-8 rounded ${color.preview} border-2 ${formData.color === color.value ? "border-foreground" : "border-transparent"
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
                                                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setEditingStatus(null)}
                                                            className="w-full sm:w-auto"
                                                        >
                                                            Anulează
                                                        </Button>
                                                        <Button onClick={handleEdit} className="w-full sm:w-auto">
                                                            Salvează
                                                        </Button>
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
                                            <AlertDialogContent className="w-[95vw] max-w-md">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Șterge Status</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Ești sigur că vrei să ștergi statusul "{status.label}"? Această acțiune nu poate fi anulată.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                                    <AlertDialogCancel className="w-full sm:w-auto">Anulează</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(status.id)} className="w-full sm:w-auto">
                                                        Șterge
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>

                                    {/* Mobile Actions Menu */}
                                    <div className="sm:hidden flex-shrink-0">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(status)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editează
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Șterge
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="w-[95vw] max-w-md">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Șterge Status</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Ești sigur că vrei să ștergi statusul "{status.label}"? Această acțiune nu poate fi
                                                                anulată.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                                            <AlertDialogCancel className="w-full sm:w-auto">Anulează</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(status.id)} className="w-full sm:w-auto">
                                                                Șterge
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
