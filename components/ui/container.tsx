import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContainerProps {
    children: ReactNode;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
}

/**
 * A responsive container component that centers content and applies consistent padding
 */
export function Container({
    children,
    className,
    as: Component = "div",
}: ContainerProps) {
    return (
        <Component
            className={cn(
                "w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl",
                className
            )}
        >
            {children}
        </Component>
    );
}

/**
 * A container with responsive padding for page content
 */
export function PageContainer({
    children,
    className,
    as = "div",
}: ContainerProps) {
    return (
        <Container as={as} className={cn("py-4 sm:py-6 md:py-8 lg:py-12", className)}>
            {children}
        </Container>
    );
} 