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

export function useCustomer(orderId?: number | null) {
    const [customers, setCustomers] = useState<CustomerFull[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [addCustomerOpen, setAddCustomerOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ nume: "", prenume: "", email: "", telefon: "" });
    const [addingCustomer, setAddingCustomer] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

    // Fetch order's customer when orderId changes
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
        fetchOrderCustomer();
    }, [orderId]);

    // Fetch customers when search changes
    useEffect(() => {
        const fetchCustomers = async () => {
            const supabase = createClient();
            let query = supabase
                .from("customers")
                .select("id, nume, prenume, email, telefon")
                .order("nume");
            if (customerSearch) {
                const q = `%${customerSearch.toLowerCase()}%`;
                query = query.or(`nume.ilike.${q},prenume.ilike.${q},email.ilike.${q},telefon.ilike.${q}`);
            }
            const { data } = await query;
            if (data) setCustomers(data);
        };
        fetchCustomers();
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