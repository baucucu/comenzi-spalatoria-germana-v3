"use client"

import type React from "react"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createMultipleServices, updateMultipleServices } from "./actions"
import { Plus, Trash2 } from "lucide-react"

interface Category {
    id: number
    name: string
}

interface ServiceType {
    id: number
    name: string
}

interface Service {
    id: number
    name: string
    price: number
    category_id: number
    service_type_id: number
    categories: { name: string }
    service_types: { name: string }
}

interface GroupedItem {
    name: string
    categoryId: number
    categoryName: string
    services: Service[]
}

interface ServiceEntry {
    id?: number
    service_type_id: string
    price: string
}

interface ServiceFormProps {
    categories: Category[]
    serviceTypes: ServiceType[]
    article?: GroupedItem
    mode: "create" | "edit"
    defaultCategory?: number
    defaultServiceName?: string
    trigger?: ReactNode
}

export function ServiceForm({
    categories,
    serviceTypes,
    article,
    mode,
    defaultCategory,
    defaultServiceName,
    trigger,
}: ServiceFormProps) {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [articleName, setArticleName] = useState(article?.name || defaultServiceName || "")
    const [categoryId, setCategoryId] = useState(article?.categoryId?.toString() || defaultCategory?.toString() || "")
    const [serviceEntries, setServiceEntries] = useState<ServiceEntry[]>(() => {
        if (article?.services) {
            return article.services.map((service) => ({
                id: service.id,
                service_type_id: service.service_type_id.toString(),
                price: service.price.toString(),
            }))
        }
        return [{ service_type_id: "", price: "" }]
    })

    const addServiceEntry = () => {
        setServiceEntries([...serviceEntries, { service_type_id: "", price: "" }])
    }

    const removeServiceEntry = (index: number) => {
        if (serviceEntries.length > 1) {
            setServiceEntries(serviceEntries.filter((_, i) => i !== index))
        }
    }

    const updateServiceEntry = (index: number, field: keyof ServiceEntry, value: string) => {
        const updated = [...serviceEntries]
        updated[index] = { ...updated[index], [field]: value }
        setServiceEntries(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const validEntries = serviceEntries.filter((entry) => entry.service_type_id && entry.price)

            if (validEntries.length === 0) {
                alert("Adaugă cel puțin un serviciu valid")
                return
            }

            if (mode === "create") {
                await createMultipleServices({
                    name: articleName,
                    category_id: Number.parseInt(categoryId),
                    services: validEntries.map((entry) => ({
                        service_type_id: Number.parseInt(entry.service_type_id),
                        price: Number.parseFloat(entry.price),
                    })),
                })
            } else {
                await updateMultipleServices({
                    originalName: article!.name,
                    originalCategoryId: article!.categoryId,
                    name: articleName,
                    category_id: Number.parseInt(categoryId),
                    services: validEntries.map((entry) => ({
                        id: entry.id,
                        service_type_id: Number.parseInt(entry.service_type_id),
                        price: Number.parseFloat(entry.price),
                    })),
                })
            }

            setOpen(false)
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700">
                        <Plus className="w-4 h-4 mr-2" />
                        {mode === "create" ? "Adaugă articol" : "Editează"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Adaugă Articol Nou" : "Editează Articol"}</DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "Completează informațiile pentru a adăuga un articol nou cu serviciile și prețurile asociate."
                            : "Modifică informațiile articolului și serviciile asociate."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nume Articol</Label>
                        <Input
                            id="name"
                            placeholder="ex: Cojoc natural lung"
                            value={articleName}
                            onChange={(e) => setArticleName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category_id">Categorie</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selectează categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Servicii și Prețuri</Label>
                            <Button type="button" onClick={addServiceEntry}>
                                <Plus className="w-4 h-4 mr-1" />
                                Adaugă serviciu
                            </Button>
                        </div>

                        {serviceEntries.map((entry, index) => (
                            <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <Label className="text-xs">Tip serviciu</Label>
                                    <Select
                                        value={entry.service_type_id}
                                        onValueChange={(value) => updateServiceEntry(index, "service_type_id", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selectează" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviceTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-24">
                                    <Label className="text-xs">Preț (RON)</Label>
                                    <Input
                                        type="number"
                                        step="1"
                                        min="0"
                                        placeholder="0"
                                        value={entry.price}
                                        onChange={(e) => updateServiceEntry(index, "price", e.target.value)}
                                    />
                                </div>
                                {serviceEntries.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeServiceEntry(index)}
                                        className="text-red-600 h-9 w-9 p-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                            Anulează
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? "Se salvează..." : mode === "create" ? "Adaugă articol" : "Salvează modificări"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
