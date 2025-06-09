import React from "react";

interface PageContentWrapperProps {
    children: React.ReactNode;
}

export function PageContentWrapper({ children }: PageContentWrapperProps) {
    return <div className="container mx-auto p-6">{children}</div>;
} 