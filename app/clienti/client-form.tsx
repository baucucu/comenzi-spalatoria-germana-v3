import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ClientFormProps {
    mode: "create" | "edit";
}

export function ClientForm({ mode }: ClientFormProps) {
    return (
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />{" "}
            {mode === "create" ? "Add Client" : "Edit Client"}
        </Button>
    );
} 