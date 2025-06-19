import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { OrderStatus } from "../types";

export function useOrderStatuses() {
    const [statuses, setStatuses] = useState<OrderStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatuses = async () => {
            setLoading(true);
            const supabase = createClient();
            const { data } = await supabase
                .from("order_statuses")
                .select("id, name, label, color");
            if (data) setStatuses(data);
            setLoading(false);
        };
        fetchStatuses();
    }, []);

    return { statuses, loading };
} 