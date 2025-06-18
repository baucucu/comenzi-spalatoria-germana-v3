// @ts-nocheck
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateOrder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, values }: { id: number; values: any }) => {
            const supabase = createClient();
            const { error } = await supabase.from("orders").update(values).eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ["orders", id] });
            toast.success("Comanda actualizată");
        },
        onError: (e: any) => toast.error(e.message ?? "Eroare la salvare"),
    });
} 