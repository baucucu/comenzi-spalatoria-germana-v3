"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"
import { ServiceForm } from "./service-form"
import { DeleteServiceDialog } from "./delete-service-dialog"

interface ServiceType {
    id: number
    type: string
    price: number
    service_type_id: number
    category_id: number
}

interface GroupedService {
    name: string
    serviceTypes: ServiceType[]
}

interface CategoryGroup {
    categoryId: number
    categoryName: string
    services: GroupedService[]
}

interface Category {
    id: number
    name: string
}

interface ServiceTypeOption {
    id: number
    name: string
}

interface ServiceGroupProps {
    categoryGroup: CategoryGroup
    categories: Category[]
    serviceTypes: ServiceTypeOption[]
}

export function ServiceGroup({ categoryGroup, categories, serviceTypes }: ServiceGroupProps) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <Card>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                {categoryGroup.categoryName}
                                <Badge variant="secondary" className="ml-2">
                                    {categoryGroup.services.length} servicii
                                </Badge>
                            </CardTitle>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-0">
                        <div className="space-y-4">
                            {categoryGroup.services.map((service) => (
                                <div key={service.name} className="border rounded-lg p-4 bg-muted/20">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-lg">{service.name}</h4>
                                        <ServiceForm
                                            categories={categories}
                                            serviceTypes={serviceTypes}
                                            article={{
                                                name: service.name,
                                                categoryId: categoryGroup.categoryId,
                                                categoryName: categoryGroup.categoryName,
                                                services: service.serviceTypes.map((st) => ({
                                                    id: st.id,
                                                    price: st.price,
                                                    service_type_id: st.service_type_id,
                                                })),
                                            }}
                                            mode="edit"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        {service.serviceTypes.map((serviceType) => (
                                            <div
                                                key={serviceType.id}
                                                className="flex items-center justify-between p-3 bg-background rounded border"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline">{serviceType.type}</Badge>
                                                    <span className="font-medium">{serviceType.price.toFixed(2)} RON</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <DeleteServiceDialog
                                                        serviceId={serviceType.id}
                                                        serviceName={`${service.name} - ${serviceType.type}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}
