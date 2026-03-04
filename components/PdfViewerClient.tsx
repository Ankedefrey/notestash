'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Props {
  pdfId: string
  userEmail: string
}

export default function PdfViewerClient({ pdfId, userEmail }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scale, setScale] = useState(1.4)
  const renderTaskRef = useRef<any>(null)

  // Load PDF
  useEffect(() => {
    async function loadPdf() {
      try {
        // Fetch signed URL + metadata
        const res = await fetch(`/api/pdfs/${pdfId}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? 'Could not load PDF.')
          setLoading(false)
          return
        }
        const { url, title: pdfTitle, pageCount } = await res.json()
        setTitle(pdfTitle)

        // Dynamically import PDF.js (avoids SSR issues)
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

        const doc = await pdfjsLib.getDocument({ url, withCredentials: false }).promise
        setPdfDoc(doc)
        setTotalPages(doc.numPages)
        setLoading(false)
      } catch (e: any) {
        setError('Failed to load PDF. Please try again.')
        setLoading(false)
      }
    }
    loadPdf()
  }, [pdfId])

  // Render page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    async function renderPage() {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
      }
      const pdfPage = await pdfDoc.getPage(page)
      const viewport = pdfPage.getViewport({ scale })
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = { canvasContext: ctx, viewport }
      renderTaskRef.current = pdfPage.render(renderContext)
      try {
        await renderTaskRef.current.promise
        // Draw watermark overlay
        drawWatermark(ctx, canvas.width, canvas.height, userEmail)
      } catch (e: any) {
        if (e.name !== 'RenderingCancelledException') console.error(e)
      }
    }
    renderPage()
  }, [pdfDoc, page, scale, userEmail])

  function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, email: string) {
    ctx.save()
    ctx.globalAlpha = 0.07
    ctx.fillStyle = '#000000'
    ctx.font = `bold ${Math.max(14, w * 0.022)}px monospace`
    const text = `${email} · ${new Date().toLocaleDateString('en-ZA')}`
    const rows = 5
    const cols = 3
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.save()
        const x = (w / cols) * c + w / (cols * 2)
        const y = (h / rows) * r + h / (rows * 2)
        ctx.translate(x, y)
        ctx.rotate(-Math.PI / 6)
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0)
        ctx.restore()
      }
    }
    ctx.restore()
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <div className="text-5xl">😔</div>
      <div className="font-syne font-bold text-xl">{error}</div>
      <Link href="/dashboard" className="bg-[var(--accent)] text-black font-syne font-bold rounded-xl px-6 py-2.5 text-sm">← Back to dashboard</Link>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#111]">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border)] px-4 h-14 flex items-center gap-4">
        <Link href="/dashboard" className="border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-lg px-3 py-1.5 text-xs font-syne font-semibold transition-all flex-shrink-0">
          ← Back
        </Link>
        <div className="flex-1 min-w-0">
          <span className="font-syne font-bold text-sm truncate">{title || 'Loading…'}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))}
            className="border border-[var(--border)] text-[var(--text)] rounded-lg w-7 h-7 flex items-center justify-center text-lg hover:bg-[var(--card-hover)] transition-colors">−</button>
          <span className="text-xs text-[var(--muted)] w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.2))}
            className="border border-[var(--border)] text-[var(--text)] rounded-lg w-7 h-7 flex items-center justify-center text-lg hover:bg-[var(--card-hover)] transition-colors">+</button>
          <div className="w-px h-5 bg-[var(--border)] mx-1" />
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="border border-[var(--border)] text-[var(--text)] rounded-lg px-2.5 py-1 text-sm disabled:opacity-30">‹</button>
          <span className="text-xs text-[var(--muted)] w-20 text-center">
            {loading ? '…' : `${page} / ${totalPages}`}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="border border-[var(--border)] text-[var(--text)] rounded-lg px-2.5 py-1 text-sm disabled:opacity-30">›</button>
        </div>
      </div>

      {/* Security bar */}
      <div className="bg-[var(--accent)]/8 border-b border-[var(--accent)]/20 py-1.5 px-4 text-center text-[var(--accent)] text-xs">
        🔒 This document is watermarked with <strong>{userEmail}</strong>. Screenshots can be traced. Please respect the creator's work.
      </div>

      {/* Canvas */}
      <div className="flex-1 flex justify-center py-8 px-4 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center w-full">
            <div className="text-[var(--muted)] text-sm animate-pulse">Loading PDF…</div>
          </div>
        ) : (
          <div className="relative shadow-2xl rounded overflow-hidden select-none" onContextMenu={e => e.preventDefault()}>
            <canvas ref={canvasRef} className="block max-w-full" />
          </div>
        )}
      </div>
    </div>
  )
}
