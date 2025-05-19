"use client";

import { Container, PageContainer } from "@/components/ui/container";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { OnlyDesktop, OnlyMobile } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ResponsiveTestPage() {
    return (
        <PageContainer>
            <h1 className={cn("text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center")}>
                Responsive Demo
            </h1>

            <section className={cn("mb-12")}>
                <h2 className={cn("text-2xl sm:text-3xl font-semibold mb-4")}>
                    Responsive Text
                </h2>
                <p className={cn("text-sm sm:text-base md:text-lg")}>
                    This text changes size based on the viewport width.
                </p>
            </section>

            <section className={cn("mb-12")}>
                <h2 className={cn("text-2xl sm:text-3xl font-semibold mb-4")}>
                    Conditional Rendering
                </h2>

                <OnlyMobile>
                    <div className={cn("p-4 bg-blue-100 rounded mb-4")}>
                        <p>This content is only visible on mobile devices.</p>
                    </div>
                </OnlyMobile>

                <OnlyDesktop>
                    <div className={cn("p-4 bg-green-100 rounded mb-4")}>
                        <p>This content is only visible on desktop devices.</p>
                    </div>
                </OnlyDesktop>
            </section>

            <section className={cn("mb-12")}>
                <h2 className={cn("text-2xl sm:text-3xl font-semibold mb-4")}>
                    Responsive Grid
                </h2>

                <ResponsiveGrid>
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className={cn("p-4 bg-gray-100 rounded flex items-center justify-center h-32")}
                        >
                            Item {item}
                        </div>
                    ))}
                </ResponsiveGrid>
            </section>

            <section>
                <h2 className={cn("text-2xl sm:text-3xl font-semibold mb-4")}>
                    Flex Direction
                </h2>

                <div className={cn("flex flex-col sm:flex-row gap-4")}>
                    <div className={cn("flex-1 p-4 bg-purple-100 rounded")}>
                        <p>This is the first flex item.</p>
                    </div>
                    <div className={cn("flex-1 p-4 bg-pink-100 rounded")}>
                        <p>This is the second flex item.</p>
                    </div>
                </div>
            </section>
        </PageContainer>
    );
} 