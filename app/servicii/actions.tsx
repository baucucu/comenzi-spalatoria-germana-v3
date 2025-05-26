"use server"

import { createClient } from "@/utils/supabase/client"
import { revalidatePath } from "next/cache"

export async function createService(formData: FormData) {
    const supabase = createClient()

    const name = formData.get("name") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const category_id = Number.parseInt(formData.get("category_id") as string)
    const service_type_id = Number.parseInt(formData.get("service_type_id") as string)

    const { error } = await supabase.from("services").insert({
        name,
        price,
        category_id,
        service_type_id,
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/comenzi")
}

export async function createMultipleServices(data: {
    name: string
    category_id: number
    services: { service_type_id: number; price: number }[]
}) {
    const supabase = createClient()

    const servicesToInsert = data.services.map((service) => ({
        name: data.name,
        category_id: data.category_id,
        service_type_id: service.service_type_id,
        price: service.price,
    }))

    const { error } = await supabase.from("services").insert(servicesToInsert)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/comenzi")
}

export async function updateMultipleServices(data: {
    originalName: string
    originalCategoryId: number
    name: string
    category_id: number
    services: { id?: number; service_type_id: number; price: number }[]
}) {
    const supabase = createClient()

    // Get existing services for this article
    const { data: existingServices, error: fetchError } = await supabase
        .from("services")
        .select("id")
        .eq("name", data.originalName)
        .eq("category_id", data.originalCategoryId)

    if (fetchError) {
        throw new Error(fetchError.message)
    }

    const existingServiceIds = existingServices?.map((s) => s.id) || []
    const updatedServiceIds = data.services.filter((s) => s.id).map((s) => s.id!)
    const servicesToDelete = existingServiceIds.filter((id) => !updatedServiceIds.includes(id))

    // Delete removed services
    if (servicesToDelete.length > 0) {
        const { error: deleteError } = await supabase.from("services").delete().in("id", servicesToDelete)

        if (deleteError) {
            throw new Error(deleteError.message)
        }
    }

    // Update existing services and insert new ones
    for (const service of data.services) {
        if (service.id) {
            // Update existing service
            const { error: updateError } = await supabase
                .from("services")
                .update({
                    name: data.name,
                    category_id: data.category_id,
                    service_type_id: service.service_type_id,
                    price: service.price,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", service.id)

            if (updateError) {
                throw new Error(updateError.message)
            }
        } else {
            // Insert new service
            const { error: insertError } = await supabase.from("services").insert({
                name: data.name,
                category_id: data.category_id,
                service_type_id: service.service_type_id,
                price: service.price,
            })

            if (insertError) {
                throw new Error(insertError.message)
            }
        }
    }

    revalidatePath("/comenzi")
}

export async function updateService(formData: FormData) {
    const supabase = createClient()

    const id = Number.parseInt(formData.get("id") as string)
    const name = formData.get("name") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const category_id = Number.parseInt(formData.get("category_id") as string)
    const service_type_id = Number.parseInt(formData.get("service_type_id") as string)

    const { error } = await supabase
        .from("services")
        .update({
            name,
            price,
            category_id,
            service_type_id,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/comenzi")
}

export async function deleteService(id: number) {
    const supabase = createClient()

    const { error } = await supabase.from("services").delete().eq("id", id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/comenzi")
}

export async function deleteArticle(serviceIds: number[]) {
    const supabase = createClient()

    const { error } = await supabase.from("services").delete().in("id", serviceIds)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/comenzi")
}

export async function getCategories() {
    const supabase = createClient()
    const { data, error } = await supabase.from("categories").select("id, name").order("name")

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function getServiceTypes() {
    const supabase = createClient()
    const { data, error } = await supabase.from("service_types").select("id, name").order("name")

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function getServicesGrouped() {
    const supabase = createClient()
    const { data, error } = await supabase
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
        throw new Error(error.message)
    }

    return data
}
