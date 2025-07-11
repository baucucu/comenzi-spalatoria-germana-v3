import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface CustomerFull {
    id: string;
    nume: string;
    prenume: string;
    email: string;
    telefon: string;
}

export function useCustomer(
    orderId?: number | null,
    controlledCustomerId?: string,
    onCustomerChange?: (id: string) => void,
) {
    const [customers, setCustomers] = useState<CustomerFull[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [addCustomerOpen, setAddCustomerOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ nume: "", prenume: "", email: "", telefon: "" });
    const [addingCustomer, setAddingCustomer] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

    useEffect(() => {
        // If controlled, sync with prop
        if (controlledCustomerId !== undefined) {
            setSelectedCustomerId(controlledCustomerId);
        }
    }, [controlledCustomerId]);

    // Fetch order's customer when orderId changes (if uncontrolled)
    useEffect(() => {
        const fetchOrderCustomer = async () => {
            if (!orderId) {
                setSelectedCustomerId("");
                return;
            }
            const supabase = createClient();
            const { data } = await supabase
                .from("orders")
                .select("customer_id")
                .eq("id", orderId)
                .single();
            if (data) setSelectedCustomerId(data.customer_id);
        };

        if (controlledCustomerId === undefined) {
            fetchOrderCustomer();
        }
    }, [orderId, controlledCustomerId]);

    // Fetch customers when search changes
    useEffect(() => {
        let isCancelled = false;

        const fetchCustomers = async () => {
            const supabase = createClient();
            let query = supabase
                .from("customers")
                .select("id, nume, prenume, email, telefon")
                .order("nume");

            if (customerSearch.trim()) {
                const cleanedSearch = customerSearch.trim().replace(/[&|!():*]/g, "");
                const tsQuery = cleanedSearch
                    .split(/\s+/)
                    .filter(Boolean)
                    .map(term => `${term}:*`)
                    .join(" & ");

                if (tsQuery) {
                    query = query.textSearch("search_vector", tsQuery, {
                        config: "romanian",
                        type: "tsquery",
                    } as any);
                }
            }

            const { data } = await query;
            if (!isCancelled) {
                setCustomers(data || []);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchCustomers();
        }, 300); // Debounce search

        return () => {
            clearTimeout(timeoutId);
            isCancelled = true;
        };
    }, [customerSearch]);

    // Add new customer
    const handleAddCustomer = async () => {
        setAddingCustomer(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("customers")
            .insert(newCustomer)
            .select()
            .single();
        setAddingCustomer(false);

        if (error) {
            toast.error("Eroare la adăugarea clientului: " + error.message);
            return false;
        } else if (data) {
            setCustomers(prev => [data, ...prev]);
            handleCustomerChange(data.id);
            setAddCustomerOpen(false);
            setNewCustomer({ nume: "", prenume: "", email: "", telefon: "" });
            toast.success("Client adăugat!");
            return true;
        }
        return false;
    };

    // Update order's customer
    const handleCustomerChange = async (customerId: string) => {
        setSelectedCustomerId(customerId);
        if (onCustomerChange) {
            onCustomerChange(customerId);
        }

        if (!orderId) return;

        const supabase = createClient();
        const { error } = await supabase
            .from("orders")
            .update({ customer_id: customerId })
            .eq("id", orderId);

        if (error) {
            toast.error("Eroare la actualizarea clientului: " + error.message);
        }
    };

    return {
        customers,
        customerSearch,
        setCustomerSearch,
        addCustomerOpen,
        setAddCustomerOpen,
        newCustomer,
        setNewCustomer,
        addingCustomer,
        selectedCustomerId,
        handleAddCustomer,
        handleCustomerChange
    };
} 