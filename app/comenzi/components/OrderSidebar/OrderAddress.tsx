import React from "react";
export default function OrderAddress({ orderId, type }: { orderId?: number | null, type: 'colectare' | 'returnare' }) {
    return <div>OrderAddress ({type})</div>;
} 