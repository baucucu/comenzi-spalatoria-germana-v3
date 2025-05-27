import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceForm } from "./service-form"
import { getCategories, getServiceTypes } from "./actions"
import { ServicesTable } from "./services-table"

interface Service {
    id: number
    name: string
    price: number
    created_at: string
    updated_at: string
    category_id: number
    service_type_id: number
    categories: { name: string }
    service_types: { name: string }
}

export default async function Comenzi() {
    const supabase = createClient()

    // Fetch services
    const { data: servicii, error } = await supabase
        .from("services")
        .select(`
      *,
      categories (
        name
      ),
      service_types (
        name
      )
    `)
        .order("categories(name), name, service_types(name)")

    if (error) {
        console.error(error)
        return <div>Error loading services</div>
    }

    // Fetch categories and service types for the forms
    const [categories, serviceTypes] = await Promise.all([getCategories(), getServiceTypes()])

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-2xl font-semibold">Articole si servicii</CardTitle>
                        <ServiceForm categories={categories} serviceTypes={serviceTypes} mode="create" />
                    </div>
                </CardHeader>
                <CardContent>
                    <ServicesTable services={servicii || []} categories={categories} serviceTypes={serviceTypes} />
                </CardContent>
            </Card>
        </div>
    )
}
