'use client';
import { Sheet, SheetTitle, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Paperclip, Shirt, Notebook } from "lucide-react";
import OrderStatusComponent from "./OrderSidebar/OrderStatusComponent";
import OrderCustomer from "./OrderSidebar/OrderCustomer";
import OrderAddress from "./OrderSidebar/OrderAddress";
import OrderPaymentMethod from "./OrderSidebar/OrderPaymentMethod";
import OrderDiscount from "./OrderSidebar/OrderDiscount";
import OrderItems from "./OrderSidebar/OrderItems";
import OrderFooter from "./OrderSidebar/OrderFooter";
import OrderNotes from "./OrderSidebar/OrderNotes";
import OrderMarcute from "./OrderSidebar/OrderMarcute";


interface OrderSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: number | null;
    onSaved?: () => void;
}


export default function OrderSidebar({ open, onOpenChange, orderId, onSaved }: OrderSidebarProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange} >
            <SheetContent className="max-w-lg w-full h-full flex flex-col p-0 gap-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex gap-2 items-center">
                        <span className="font-bold text-lg">
                            Comanda #{orderId ?? 'Nouă'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {/* Optionally show date or other info here if needed */}
                        </span>
                    </SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="detalii" className="flex flex-1 flex-col overflow-hidden">
                    <TabsList className="w-full justify-around rounded-none border-b bg-transparent p-0">
                        <TabsTrigger value="detalii" className="flex-1 flex items-center justify-center gap-2">
                            <Paperclip className="w-4 h-4" />
                            Comanda
                        </TabsTrigger>
                        <TabsTrigger value="articole" className="flex-1 flex items-center justify-center gap-2">
                            <Shirt className="w-4 h-4" />
                            Articole
                        </TabsTrigger>
                        <TabsTrigger value="notite" className="flex-1 flex items-center justify-center gap-2">
                            <Notebook className="w-4 h-4" />
                            Notițe
                        </TabsTrigger>
                    </TabsList>
                    <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/25">
                        <TabsContent value="detalii" className="m-0 flex flex-col gap-4">
                            <OrderStatusComponent orderId={orderId} />
                            <OrderMarcute orderId={orderId} />
                            <OrderCustomer orderId={orderId} />
                            <OrderAddress orderId={orderId} type="colectare" />
                            <OrderAddress orderId={orderId} type="returnare" />
                            <OrderPaymentMethod orderId={orderId} />
                            <OrderDiscount orderId={orderId} />
                        </TabsContent>
                        <TabsContent value="articole" className="m-0 flex flex-col gap-4">
                            <OrderItems orderId={orderId} onItemsChange={onSaved} />
                        </TabsContent>
                        <TabsContent value="notite" className="m-0 flex flex-col gap-4">
                            <OrderNotes orderId={orderId} />
                        </TabsContent>
                    </main>
                </Tabs>
                <OrderFooter orderId={orderId} />
            </SheetContent>
        </Sheet>
    );
} 