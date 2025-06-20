"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Edit, Trash2, Plus } from "lucide-react"
import { ServiceForm } from "./service-form"
import { DeleteArticleDialog } from "./delete-article-dialog"
import { matchesSearch } from "./utils"

interface Service {
    id: number
    name: string
    price: number
    category_id: number
    service_type_id: number
    categories: { name: string }
    service_types: { name: string }
}

interface Category {
    id: number
    name: string
}

interface ServiceType {
    id: number
    name: string
}

interface GroupedItem {
    name: string
    categoryId: number
    categoryName: string
    services: Service[]
}

interface CategoryGroup {
    categoryName: string
    categoryId: number
    items: GroupedItem[]
}

interface ServicesTableProps {
    services: Service[]
    categories: Category[]
    serviceTypes: ServiceType[]
}

export function ServicesTable({ services, categories, serviceTypes }: ServicesTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

    // Group services by category, then by item name
    const groupedByCategory = useMemo(() => {
        const grouped = services.reduce(
            (acc, service) => {
                const categoryKey = service.category_id
                const categoryName = service.categories?.name || "Necategorizat"
                const itemKey = `${service.name}-${service.category_id}`

                if (!acc[categoryKey]) {
                    acc[categoryKey] = {
                        categoryName,
                        categoryId: categoryKey,
                        items: {},
                    }
                }

                if (!acc[categoryKey].items[itemKey]) {
                    acc[categoryKey].items[itemKey] = {
                        name: service.name,
                        categoryId: service.category_id,
                        categoryName,
                        services: [],
                    }
                }

                acc[categoryKey].items[itemKey].services.push(service)
                return acc
            },
            {} as Record<number, { categoryName: string; categoryId: number; items: Record<string, GroupedItem> }>,
        )

        // Convert to array and sort
        return Object.values(grouped)
            .map((category) => ({
                ...category,
                items: Object.values(category.items).sort((a, b) => a.name.localeCompare(b.name)),
            }))
            .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
    }, [services])

    // Get unique categories from services for filter badges
    const usedCategories = useMemo(() => {
        const categoryIds = Array.from(new Set(services.map((s) => s.category_id)))
        return categories.filter((cat) => categoryIds.includes(cat.id))
    }, [services, categories])

    // Filter items based on search term and selected category (with diacritics-insensitive search)
    const filteredCategories = useMemo(() => {
        return groupedByCategory
            .map((categoryGroup) => ({
                ...categoryGroup,
                items: categoryGroup.items.filter((item) => {
                    const matchesSearchTerm =
                        searchTerm === "" ||
                        matchesSearch(item.name, searchTerm) ||
                        matchesSearch(item.categoryName, searchTerm) ||
                        item.services.some((service) => matchesSearch(service.service_types?.name || "", searchTerm))

                    const matchesCategory = selectedCategory === null || item.categoryId === selectedCategory

                    return matchesSearchTerm && matchesCategory
                }),
            }))
            .filter((categoryGroup) => categoryGroup.items.length > 0)
    }, [groupedByCategory, searchTerm, selectedCategory])

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Caută articole, categorii sau servicii..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Category Filter Badges */}
            <div className="flex flex-wrap gap-2">
                <Badge
                    variant={selectedCategory === null ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                >
                    Toate
                </Badge>
                {usedCategories.map((category) => (
                    <Badge
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(category.id)}
                    >
                        {category.name}
                    </Badge>
                ))}
            </div>

            {/* Grouped Items by Category */}
            {filteredCategories.length > 0 ? (
                <div className="space-y-6">
                    {filteredCategories.map((categoryGroup) => (
                        <div key={categoryGroup.categoryId} className="space-y-3">
                            {/* Category Header */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-muted-foreground">{categoryGroup.categoryName}</h2>
                            </div>

                            {/* Items in Category */}
                            <div className="space-y-3">
                                {categoryGroup.items.map((item) => (
                                    <Card key={`${item.name}-${item.categoryId}`} className="overflow-hidden">
                                        <CardContent className="p-4">
                                            {/* Item Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem asChild>
                                                            <ServiceForm
                                                                categories={categories}
                                                                serviceTypes={serviceTypes}
                                                                article={item}
                                                                mode="edit"
                                                                trigger={
                                                                    <div className="flex items-center cursor-pointer w-full px-2 py-2 text-sm">
                                                                        <Edit className="w-4 h-4 mr-3" />
                                                                        Editează articol
                                                                    </div>
                                                                }
                                                            />
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <ServiceForm
                                                                categories={categories}
                                                                serviceTypes={serviceTypes}
                                                                defaultCategory={item.categoryId}
                                                                defaultServiceName={item.name}
                                                                mode="create"
                                                                trigger={
                                                                    <div className="flex items-center cursor-pointer w-full px-2 py-2 text-sm">
                                                                        <Plus className="w-4 h-4 mr-3" />
                                                                        Adaugă serviciu
                                                                    </div>
                                                                }
                                                            />
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <DeleteArticleDialog
                                                                articleName={item.name}
                                                                services={item.services}
                                                                trigger={
                                                                    <div className="flex items-center cursor-pointer w-full px-2 py-2 text-sm text-red-600">
                                                                        <Trash2 className="w-4 h-4 mr-3" />
                                                                        Șterge articol
                                                                    </div>
                                                                }
                                                            />
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Services List */}
                                            <div className="space-y-2">
                                                {item.services.map((service) => (
                                                    <div
                                                        key={service.id}
                                                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium">{service.service_types?.name}</span>
                                                                <span className="text-lg font-bold">{service.price} RON</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                        {searchTerm || selectedCategory !== null
                            ? "Nu s-au găsit servicii care să corespundă filtrelor."
                            : "Nu există servicii înregistrate."}
                    </p>
                    <ServiceForm categories={categories} serviceTypes={serviceTypes} mode="create" />
                </div>
            )}
        </div>
    )
}
