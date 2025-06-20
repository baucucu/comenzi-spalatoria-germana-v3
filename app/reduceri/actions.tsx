"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export interface Discount {
    id: number
    name: string
    value: number
    created_at?: string
}

export async function getDiscounts(): Promise<Discount[]> {
    const supabase = await createClient()

    const { data, error } = await supabase.from("discounts").select("*").order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching discounts:", error)
        throw new Error("Failed to fetch discounts")
    }

    return data || []
}

export async function createDiscount(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const value = Number.parseInt(formData.get("value") as string) || 0

    if (!name?.trim()) {
        return { error: "Numele reducerii este obligatoriu" }
    }

    const { data, error } = await supabase
        .from("discounts")
        .insert([{ name: name.trim(), value }])
        .select()

    if (error) {
        console.error("Error creating discount:", error)
        return { error: "Eroare la adăugarea reducerii" }
    }

    revalidatePath("/reduceri")
    return { success: true, data: data[0] }
}

export async function updateDiscount(formData: FormData) {
    const supabase = await createClient()

    const id = Number.parseInt(formData.get("id") as string)
    const name = formData.get("name") as string
    const value = Number.parseInt(formData.get("value") as string) || 0

    if (!name?.trim()) {
        return { error: "Numele reducerii este obligatoriu" }
    }

    const { error } = await supabase.from("discounts").update({ name: name.trim(), value }).eq("id", id)

    if (error) {
        console.error("Error updating discount:", error)
        return { error: "Eroare la actualizarea reducerii" }
    }

    revalidatePath("/reduceri")
    return { success: true }
}

export async function deleteDiscount(id: number) {
    const supabase = await createClient()

    const { error } = await supabase.from("discounts").delete().eq("id", id)

    if (error) {
        console.error("Error deleting discount:", error)
        return { error: "Eroare la ștergerea reducerii" }
    }

    revalidatePath("/reduceri")
    return { success: true }
}
