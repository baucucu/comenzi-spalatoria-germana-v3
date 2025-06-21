export interface OrderStatus {
    id: number;
    name: string;
    label: string;
    color: string;
}

export interface Customer {
    id: string;
    nume: string;
    prenume: string;
    telefon?: string;
    email?: string;
}

export interface Order {
    id: number;
    date_created: string;
    status: string | null;
    total_comanda_cu_discount: number;
    customers: Customer | null;
    adresa_colectare_id?: number;
    adresa_returnare_id?: number;
    urgent?: boolean;
    payment_method?: string;
    notes?: string;
    data_comanda?: string;
    data_colectare?: string;
    data_returnare?: string;
    marcute?: string;
    adresa_colectare?: { adresa: string } | null;
    adresa_returnare?: { adresa: string } | null;
}

export interface CustomerFull {
    id: string;
    nume: string;
    prenume: string;
    email: string;
    telefon: string;
}

export interface Service {
    id: number;
    name: string;
    price: number;
    category: { name: string };
    service_type: { name: string };
}

export interface Address {
    id: number;
    adresa: string;
    detalii?: string;
}

export interface Discount {
    id: number;
    name: string;
    value: number;
}

export interface StatusHistory {
    status: string;
    changed_at: string;
} 