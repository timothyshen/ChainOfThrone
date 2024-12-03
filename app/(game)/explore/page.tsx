import { Suspense } from "react"
import { ExplorePageComponent } from "@/components/explore/ExplorePage"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { LoadingScreen } from "@/components/ui/LoadingScreen"

export default function ExplorePage() {
    return (
        <ProtectedRoute>
            <Suspense fallback={<LoadingScreen />}>
                <ExplorePageComponent />
            </Suspense>
        </ProtectedRoute>
    )
}
