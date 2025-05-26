"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Plus, MoreVertical, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createDiscount, updateDiscount, deleteDiscount, type Discount } from "./actions"

interface DiscountManagementProps {
    initialDiscounts: Discount[]
}

export default function DiscountManagement({ initialDiscounts }: DiscountManagementProps) {
    const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts)
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleEdit = (discount: Discount) => {
        setEditingDiscount(discount)
        setIsEditModalOpen(true)
    }

    const handleCancelEdit = () => {
        setIsEditModalOpen(false)
        setEditingDiscount(null)
        setError(null)
    }

    const handleDelete = async (id: number) => {
        try {
            const result = await deleteDiscount(id)
            if (result.success) {
                setDiscounts((prev) => prev.filter((discount) => discount.id !== id))
            } else {
                setError(result.error || "Eroare la ștergerea reducerii")
            }
        } catch (error) {
            console.error("Error deleting discount:", error)
            setError("Eroare la ștergerea reducerii")
        }
    }

    const handleAddDiscount = () => {
        setIsAddModalOpen(true)
    }

    const handleCancelAdd = () => {
        setIsAddModalOpen(false)
        setError(null)
    }

    const handleCreateSubmit = async (formData: FormData) => {
        try {
            setIsSubmitting(true)
            setError(null)
            const result = await createDiscount(formData)
            if (result.success && result.data) {
                setDiscounts((prev) => [result.data, ...prev])
                setIsAddModalOpen(false)
            } else {
                setError(result.error || "Eroare la adăugarea reducerii")
            }
        } catch (error) {
            console.error("Error creating discount:", error)
            setError("Eroare la adăugarea reducerii")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateSubmit = async (formData: FormData) => {
        try {
            setIsSubmitting(true)
            setError(null)
            const result = await updateDiscount(formData)
            if (result.success && editingDiscount) {
                setDiscounts((prev) =>
                    prev.map((discount) =>
                        discount.id === editingDiscount.id
                            ? { ...discount, name: formData.get("name") as string, value: Number(formData.get("value")) }
                            : discount
                    )
                )
                setIsEditModalOpen(false)
                setEditingDiscount(null)
            } else {
                setError(result.error || "Eroare la actualizarea reducerii")
            }
        } catch (error) {
            console.error("Error updating discount:", error)
            setError("Eroare la actualizarea reducerii")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
                    <CardTitle className="text-2xl font-semibold">Lista de reduceri</CardTitle>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAddDiscount} className="bg-slate-800 hover:bg-slate-700 w-full sm:w-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Adaugă reducere
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-md">
                            <DialogHeader>
                                <DialogTitle>Adaugă reducere nouă</DialogTitle>
                                <DialogDescription>
                                    Completează detaliile pentru a adăuga o nouă reducere.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={handleCreateSubmit}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="add-name" className="text-right">
                                            Denumire
                                        </Label>
                                        <Input
                                            id="add-name"
                                            name="name"
                                            className="col-span-3"
                                            placeholder="Introduceți numele reducerii"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="add-value" className="text-right">
                                            Procent (%)
                                        </Label>
                                        <Input
                                            id="add-value"
                                            name="value"
                                            type="number"
                                            min="0"
                                            max="100"
                                            defaultValue="0"
                                            className="col-span-3"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={handleCancelAdd} disabled={isSubmitting}>
                                        Anulează
                                    </Button>
                                    <Button type="submit" className="bg-slate-800 hover:bg-slate-700" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Se salvează...
                                            </>
                                        ) : (
                                            "Adaugă"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {discounts.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">Nu există reduceri. Adăugați prima reducere!</div>
                    ) : (
                        <Table >
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-slate-600">Denumire</TableHead>
                                    <TableHead className="text-slate-600 text-right">Procent (%)</TableHead>
                                    <TableHead className="text-slate-600 text-right">Acțiuni</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {discounts.map((discount) => (
                                    <TableRow key={discount.id} className="hover:bg-slate-50">
                                        <TableCell className="font-medium">{discount.name}</TableCell>
                                        <TableCell className="text-right">{discount.value}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(discount)}>
                                                        <Edit className="w-4 h-4 mr-2" /> Editează
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(discount.id)} className="text-red-600">
                                                        <Trash2 className="w-4 h-4 mr-2" /> Șterge
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            {/* Edit Dialog at root level for proper overlay */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editează reducerea</DialogTitle>
                        <DialogDescription>
                            Modifică detaliile reducerii selectate.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        action={async (formData) => {
                            await handleUpdateSubmit(formData)
                        }}
                    >
                        <input type="hidden" name="id" value={editingDiscount?.id} />
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                    Denumire
                                </Label>
                                <Input
                                    id="edit-name"
                                    name="name"
                                    defaultValue={editingDiscount?.name ?? ''}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-value" className="text-right">
                                    Procent (%)
                                </Label>
                                <Input
                                    id="edit-value"
                                    name="value"
                                    type="number"
                                    min="0"
                                    max="100"
                                    defaultValue={editingDiscount?.value ?? 0}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                                Anulează
                            </Button>
                            <Button type="submit" className="bg-slate-800 hover:bg-slate-700" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Se salvează...
                                    </>
                                ) : (
                                    "Salvează"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
