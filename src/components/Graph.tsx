import { useState, useEffect, useRef } from 'react'
import ForceGraph3D from '3d-force-graph'
import { Loader2, AlertCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_FASTAPI_URI 

export const Graph = ({ jobs = [], limit = 5000 }) => {
    const graphRef = useRef(null)
    const fgInstanceRef = useRef(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [graphData, setGraphData] = useState({ nodes: [], links: [] })

    useEffect(() => {
        if (!jobs.length) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        const fetchGraphData = async () => {
            try {
                const response = await fetch(`${API_URL}/graph/jobs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobs, limit })
                })

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.detail || 'Failed to fetch graph data')
                }

                const data = await response.json()
                setGraphData(data)
            } catch (err) {
                console.error('Graph fetch error:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchGraphData()
    }, [jobs, limit])

useEffect(() => {
    if (loading || error || !graphData.nodes.length || !graphRef.current) return

    if (fgInstanceRef.current) {
        graphRef.current.innerHTML = ''
    }

    const width = graphRef.current.clientWidth
    const height = graphRef.current.clientHeight

    fgInstanceRef.current = ForceGraph3D()(graphRef.current)
        .width(width)
        .height(height)
        .graphData(graphData)
        .nodeVal('size')
        .nodeAutoColorBy('label')
        .nodeLabel(node => `${node.label}: ${node.caption}`)
        .backgroundColor('rgba(0,0,0,0)')
        .linkColor(() => '#888888')
        .onNodeHover(node => {
            if (graphRef.current) graphRef.current.style.cursor = node ? 'pointer' : null
        })

    // Handle panel resize
    const resizeObserver = new ResizeObserver(() => {
        if (fgInstanceRef.current && graphRef.current) {
            fgInstanceRef.current
                .width(graphRef.current.clientWidth)
                .height(graphRef.current.clientHeight)
        }
    })
    resizeObserver.observe(graphRef.current)

    return () => {
        resizeObserver.disconnect()
        if (graphRef.current) graphRef.current.innerHTML = ''
    }
}, [graphData, loading, error])

    if (loading) return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Building knowledge graph...</p>
        </div>
    )

    if (error) return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm font-medium">{error}</p>
        </div>
    )

    if (!jobs.length) return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <p className="text-sm">No jobs available to visualize yet.</p>
        </div>
    )

    return (
        <div ref={graphRef} className="" />
    )
}
