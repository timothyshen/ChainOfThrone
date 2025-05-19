'use client'

import { Search, Filter } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusFilter } from './GameTable'
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"

interface GameFiltersProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    statusFilter: StatusFilter
    setStatusFilter: (filter: StatusFilter) => void
}

export default function GameFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter
}: GameFiltersProps) {
    const [tempFilter, setTempFilter] = useState<StatusFilter>(statusFilter)
    const [tempSearch, setTempSearch] = useState(searchTerm)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const applyFilters = () => {
        setSearchTerm(tempSearch)
        setStatusFilter(tempFilter)
        setIsDialogOpen(false)
    }

    // Desktop view
    const DesktopFilters = () => (
        <div className="flex gap-4 mb-6">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4" />
                <Input
                    placeholder="Search available games..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                defaultValue={statusFilter}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )

    // Mobile view
    const MobileFilters = () => (
        <div className="flex gap-2 mb-6">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4" />
                <Input
                    placeholder="Search games..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="px-3">
                        <Filter className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Filter Games</DialogTitle>
                        <DialogDescription>
                            Apply filters to find the games you're looking for
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Search</h3>
                            <Input
                                placeholder="Search available games..."
                                value={tempSearch}
                                onChange={(e) => setTempSearch(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Status</h3>
                            <Select
                                onValueChange={(value) => setTempFilter(value as StatusFilter)}
                                defaultValue={tempFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in progress">In Progress</SelectItem>
                                    <SelectItem value="full">Full</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={applyFilters}>
                            Apply Filters
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )

    return (
        <>
            {/* Desktop view (hidden on mobile) */}
            <div className="hidden md:block">
                <DesktopFilters />
            </div>

            {/* Mobile view (hidden on desktop) */}
            <div className="md:hidden">
                <MobileFilters />
            </div>
        </>
    )
} 