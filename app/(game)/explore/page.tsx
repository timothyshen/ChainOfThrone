import { ExplorePageComponent } from "@/components/explore/ExplorePage"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

export default function ExplorePage() {
    return (
        <ErrorBoundary>
            <ExplorePageComponent />
        </ErrorBoundary>
    )
}
