// @ts-nocheck
// temporary ignore types until @tanstack/react-query is installed

import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Order } from "../types";

export function useOrder(orderId?: number | null) {
    return useQuery<Order | null>({
        enabled: !!orderId,
        queryKey: ["orders", orderId],
        queryFn: async () => {
            if (!orderId) return null;
            const supabase = createClient();
            const { data, error } = await supabase
                .from("orders")
                .select("*, customers(*), order_services(id, cantitate, total_articol, services(*))")
                .eq("id", orderId)
                .single();
            if (error) throw error;
            return data as unknown as Order;
        },
    });
} 