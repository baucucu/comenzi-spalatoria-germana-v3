import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ClientFormProps {
    mode: "create" | "edit";
}

export function ClientForm({ mode }: ClientFormProps) {
    return (
        <Button>
            <Plus className="mr-2 h-4 w-4" />{" "}
            {mode === "create" ? "Adauga Client" : "Editeaza Client"}
        </Button>
    );
} 