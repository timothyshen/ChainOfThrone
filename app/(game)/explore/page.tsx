'use client'

import { ExplorePageComponent } from "@/components/explore/ExplorePage"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function ExplorePage() {
    return (
        <ProtectedRoute>
            <ExplorePageComponent />
        </ProtectedRoute>
    )
}
