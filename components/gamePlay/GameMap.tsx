import { Territory } from '@/lib/types/game'
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface GameMapProps {
    currentPlayer: string
    territories: Territory[][]
    onTerritoryClick: (territory: Territory) => void
    isLoading: boolean
}

export default function GameMap({ currentPlayer, territories, onTerritoryClick, isLoading }: GameMapProps) {
    const [isZoomed, setIsZoomed] = useState(false)
    const [scale, setScale] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const svgRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startPan, setStartPan] = useState({ x: 0, y: 0 })
    const [isMobile, setIsMobile] = useState(false)

    // Calculate grid dimensions
    const gridSize = {
        rows: territories.length || 0,
        cols: territories[0]?.length || 0
    }

    // Base cell sizes - will be scaled for different devices
    const baseCellSize = 100
    const padding = 20

    // Calculate grid size
    const gridWidth = (gridSize.cols * baseCellSize) + (padding * 2)
    const gridHeight = (gridSize.rows * baseCellSize) + (padding * 2)

    // Detect mobile devices and adjust scale accordingly
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            return mobile
        }

        const mobile = checkMobile()

        // Set initial zoom state based on device
        if (mobile) {
            setIsZoomed(false)
        }

        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Adjust scale for different screens
    useEffect(() => {
        if (!containerRef.current) return

        const updateScale = () => {
            const containerWidth = containerRef.current?.clientWidth || 0
            const containerHeight = containerRef.current?.clientHeight || 0

            // Calculate scale based on container dimensions and grid size
            const horizontalScale = containerWidth / gridWidth
            const verticalScale = containerHeight / gridHeight

            // Use the smaller scale to ensure the entire map fits
            let newScale = Math.min(horizontalScale, verticalScale, 1)

            // For mobile, use a fixed scale that shows more of the grid
            if (isMobile) {
                newScale = Math.min(0.7, newScale)
            }

            setScale(newScale)
        }

        updateScale()
        window.addEventListener('resize', updateScale)
        return () => window.removeEventListener('resize', updateScale)
    }, [gridWidth, gridHeight, territories, isMobile])

    // Reset position when toggling zoom
    const handleZoomToggle = () => {
        setIsZoomed(!isZoomed)
        setPan({ x: 0, y: 0 })
    }

    // Touch event handlers with proper TypeScript safety
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1 && e.touches[0]) {
            setIsDragging(true)
            setStartPan({
                x: e.touches[0].clientX - pan.x,
                y: e.touches[0].clientY - pan.y
            })
        }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !e.touches[0]) return
        e.preventDefault()

        const newPan = {
            x: e.touches[0].clientX - startPan.x,
            y: e.touches[0].clientY - startPan.y
        }
        setPan(newPan)
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
    }

    // Mouse interaction handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        setStartPan({
            x: e.clientX - pan.x,
            y: e.clientY - pan.y
        })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        const newPan = {
            x: e.clientX - startPan.x,
            y: e.clientY - startPan.y
        }
        setPan(newPan)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Calculate the zoom level based on state
    const zoomLevel = isZoomed ? scale * 1.5 : scale

    if (isLoading) {
        return <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }

    return (
        <Card className="h-full">
            <CardContent className="pt-4 p-0 sm:p-4 h-full flex flex-col">
                {/* Zoom controls */}
                <div className="flex justify-end mb-2 px-2">
                    <button
                        onClick={handleZoomToggle}
                        className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1"
                        aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                    >
                        {isZoomed ? (
                            <>
                                <ZoomOut className="h-3 w-3" />
                                <span className="hidden sm:inline">Reset View</span>
                            </>
                        ) : (
                            <>
                                <ZoomIn className="h-3 w-3" />
                                <span className="hidden sm:inline">Full View</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Map container with fixed height on mobile */}
                <div
                    ref={containerRef}
                    className="relative overflow-hidden border border-gray-300 rounded-md flex-1"
                    style={{
                        minHeight: isMobile ? '300px' : '400px',
                        height: isMobile ? '100%' : 'auto',
                        touchAction: 'none'
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div
                        className="absolute inset-0 transition-transform duration-200"
                        style={{
                            transform: `scale(${zoomLevel}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
                            transformOrigin: 'center center'
                        }}
                    >
                        <svg
                            ref={svgRef}
                            viewBox={`0 0 ${gridWidth} ${gridHeight}`}
                            className={cn(
                                "w-full h-full",
                                isDragging ? "cursor-grabbing" : "cursor-grab"
                            )}
                        >
                            {territories.map((row, rowIndex) => (
                                row.map((territory, colIndex) => {
                                    const x = (colIndex * baseCellSize) + padding
                                    const y = (rowIndex * baseCellSize) + padding

                                    return (
                                        <g
                                            key={`${rowIndex}-${colIndex}`}
                                            onClick={(e) => {
                                                if (!isDragging) {
                                                    onTerritoryClick(territory)
                                                }
                                                e.stopPropagation()
                                            }}
                                        >
                                            <rect
                                                x={x}
                                                y={y}
                                                width={baseCellSize}
                                                height={baseCellSize}
                                                fill={territory.isCastle ? '#FFFACD' : 'white'}
                                                stroke="black"
                                                strokeWidth="2"
                                                className="hover:opacity-80 transition-opacity"
                                                rx="4"
                                                ry="4"
                                            />
                                            <text
                                                x={x + baseCellSize / 2}
                                                y={y + 25}
                                                textAnchor="middle"
                                                className="text-sm font-medium"
                                                style={{ fontSize: '14px' }}
                                            >
                                                {territory.isCastle ? `Castle` : `Land`}
                                            </text>
                                            {territory.isCastle && (
                                                <svg
                                                    x={x + 40}
                                                    y={y + 35}
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                >
                                                    <path d="M12 2L2 8v14h20V8L12 2zm-2 17H6v-3h4v3zm8 0h-4v-3h4v3zm2-7H4v-5l8-4.5 8 4.5v5z" />
                                                </svg>
                                            )}

                                            {/* Coordinates */}
                                            <text
                                                x={x + 8}
                                                y={y + 16}
                                                textAnchor="start"
                                                className="text-xs opacity-70"
                                                style={{ fontSize: '10px' }}
                                            >
                                                {rowIndex},{colIndex}
                                            </text>

                                            {/* Owner indicator */}
                                            {territory.player === currentPlayer && (
                                                <rect
                                                    x={x + baseCellSize - 12}
                                                    y={y + 8}
                                                    width="8"
                                                    height="8"
                                                    fill="#FFFF00"
                                                    stroke="black"
                                                    strokeWidth="1"
                                                    rx="2"
                                                />
                                            )}

                                            {/* Units display */}
                                            {territory.units.map((unit, index) => (
                                                Number(unit) > 0 && (
                                                    <g key={index}>
                                                        <circle
                                                            cx={x + baseCellSize / 2}
                                                            cy={y + 70}
                                                            r="14"
                                                            fill={territory.player === currentPlayer ? "#FFFF00" : "#666"}
                                                            stroke="black"
                                                            strokeWidth="2"
                                                            opacity="0.85"
                                                        />
                                                        <text
                                                            x={x + baseCellSize / 2}
                                                            y={y + 74}
                                                            textAnchor="middle"
                                                            className="font-bold"
                                                            style={{ fontSize: '12px' }}
                                                            fill="black"
                                                        >
                                                            {Number(unit)}
                                                        </text>
                                                    </g>
                                                )
                                            ))}
                                        </g>
                                    )
                                })
                            ))}
                        </svg>
                    </div>
                </div>

                {/* Mobile instructions */}
                <p className="text-xs text-muted-foreground text-center mt-2 md:hidden px-2">
                    Drag to pan. Tap territories to select.
                </p>
            </CardContent>
        </Card>
    )
} 