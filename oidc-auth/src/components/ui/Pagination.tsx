import * as React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
  /** Compact mode hides page-size selector & count summary */
  compact?: boolean
}

/**
 * Standard pagination control. Renders nothing when there's a single page
 * unless a page-size selector is required.
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
  compact = false,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  if (total === 0) return null

  const start = (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, total)

  const goto = (p: number) => onPageChange(Math.min(Math.max(1, p), totalPages))

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3 border-t border-white/6 text-[12px]',
        className,
      )}
    >
      {/* Summary + page size */}
      {!compact && (
        <div className="flex items-center gap-4 text-white/45">
          <span>
            <span className="text-white/75 font-medium tabular-nums">{start.toLocaleString()}–{end.toLocaleString()}</span> of{' '}
            <span className="text-white/75 font-medium tabular-nums">{total.toLocaleString()}</span>
          </span>
          {onPageSizeChange && (
            <div className="flex items-center gap-1.5">
              <label htmlFor="page-size" className="text-white/40">Rows</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => {
                  onPageSizeChange(Number(e.target.value))
                  onPageChange(1)
                }}
                className="h-7 rounded-md bg-white/[0.04] border border-white/10 text-white/85 px-1.5 text-[12px] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {compact && <div className="text-white/45 tabular-nums">Page {safePage} of {totalPages}</div>}

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <PageBtn onClick={() => goto(1)} disabled={safePage === 1} title="First page">
          <ChevronsLeft className="size-3.5" />
        </PageBtn>
        <PageBtn onClick={() => goto(safePage - 1)} disabled={safePage === 1} title="Previous page">
          <ChevronLeft className="size-3.5" />
        </PageBtn>

        {!compact && (
          <div className="flex items-center gap-0.5 mx-1">
            {pageRange(safePage, totalPages).map((p, idx) =>
              p === '…' ? (
                <span key={`gap-${idx}`} className="px-1.5 text-white/30">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goto(p)}
                  className={cn(
                    'h-7 min-w-7 px-2 rounded-md text-[12px] font-medium transition-colors tabular-nums',
                    p === safePage
                      ? 'bg-violet-500/15 text-violet-200 border border-violet-500/30'
                      : 'text-white/55 hover:text-white hover:bg-white/[0.05] border border-transparent',
                  )}
                >
                  {p}
                </button>
              ),
            )}
          </div>
        )}

        <PageBtn onClick={() => goto(safePage + 1)} disabled={safePage >= totalPages} title="Next page">
          <ChevronRight className="size-3.5" />
        </PageBtn>
        <PageBtn onClick={() => goto(totalPages)} disabled={safePage >= totalPages} title="Last page">
          <ChevronsRight className="size-3.5" />
        </PageBtn>
      </div>
    </div>
  )
}

function PageBtn({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className="size-7 rounded-md text-white/55 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center justify-center transition-colors"
    >
      {children}
    </button>
  )
}

/**
 * Build a compact page range like: 1 … 4 5 [6] 7 8 … 20
 */
function pageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const out: (number | '…')[] = []
  const window = 1 // pages on each side of current
  out.push(1)
  if (current - window > 2) out.push('…')
  for (let p = Math.max(2, current - window); p <= Math.min(total - 1, current + window); p++) {
    out.push(p)
  }
  if (current + window < total - 1) out.push('…')
  out.push(total)
  return out
}

/**
 * Local pagination hook. Pairs with the `<Pagination />` component.
 * Resets to page 1 whenever the dataset length changes (e.g. after a filter).
 */
export function usePagination<T>(items: T[], defaultSize = 10) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(defaultSize)

  // Reset to page 1 when the underlying dataset shrinks past current page
  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(items.length / pageSize))
    if (page > maxPage) setPage(maxPage)
  }, [items.length, pageSize, page])

  const paged = React.useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    paged,
    total: items.length,
  }
}
