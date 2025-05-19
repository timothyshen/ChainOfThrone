import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface ResponsiveGridProps {
    children: ReactNode;
    className?: string;
    columns?: {
        default: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    gap?: string;
}

/**
 * A responsive grid component that adjusts columns based on screen size
 */
export function ResponsiveGrid({
    children,
    className,
    columns = { default: 1, sm: 2, lg: 3, xl: 4 },
    gap = "gap-4 md:gap-6",
}: ResponsiveGridProps) {
    // Calculate grid template columns for each breakpoint
    const gridColsDefault = `grid-cols-${columns.default}`;
    const gridColsSm = columns.sm ? `sm:grid-cols-${columns.sm}` : "";
    const gridColsMd = columns.md ? `md:grid-cols-${columns.md}` : "";
    const gridColsLg = columns.lg ? `lg:grid-cols-${columns.lg}` : "";
    const gridColsXl = columns.xl ? `xl:grid-cols-${columns.xl}` : "";

    return (
        <div
            className={cn(
                "grid",
                gridColsDefault,
                gridColsSm,
                gridColsMd,
                gridColsLg,
                gridColsXl,
                gap,
                className
            )}
        >
            {children}
        </div>
    );
} 