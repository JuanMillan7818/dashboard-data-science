"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Hash, Type, ToggleLeft, Calendar, Loader2, Tag } from "lucide-react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchVariables } from "@/lib/api"
import { useInView } from "react-intersection-observer"
import type { DataFrameColumn } from "@/lib/dataframe-data"
import { Badge } from "@/components/ui/badge"

const DTYPE_ICONS: Record<string, typeof Hash> = {
  numeric: Hash,
  categorical: Type,
  boolean: ToggleLeft,
  datetime: Calendar,
  unknown: Type,
}

const DTYPE_COLORS: Record<string, string> = {
  numeric: "hsl(199, 89%, 48%)",
  categorical: "hsl(160, 84%, 39%)",
  boolean: "hsl(35, 92%, 53%)",
  datetime: "hsl(346, 77%, 50%)",
  unknown: "hsl(215, 20%, 55%)",
}

interface VariableInspectorProps {
  columns?: DataFrameColumn[]
}

export function VariableInspector({ columns }: VariableInspectorProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { ref, inView } = useInView()
  const [expandedVar, setExpandedVar] = useState<string | null>(null)

  /**
   * Efecto: Debounce (retraso) de la entrada de búsqueda para evitar llamadas excesivas a la API.
   * Actualiza 'debouncedSearch' 500ms después de que el usuario deja de escribir.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Verificación de modo cliente (si se proporciona la propiedad columns)
  const isClientMode = !!columns

  // Lógica de filtrado para Modo Cliente
  const clientFiltered = isClientMode
    ? columns?.filter((col) => col.name.toLowerCase().includes(search.toLowerCase()))
    : []

  /**
   * Obtención de Datos: Consulta de Scroll Infinito para Variables
   * Usa 'debouncedSearch' en queryKey para activar la recarga al actualizar la búsqueda.
   */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["variables", debouncedSearch],
    queryFn: ({ pageParam = 1 }) => fetchVariables({ pageParam, search: debouncedSearch }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.page + 1 : undefined),
    enabled: !isClientMode,
  })

  /**
   * Efecto: Disparar la carga de la siguiente página cuando el elemento centinela entra en vista.
   */
  useEffect(() => {
    if (!isClientMode && inView && hasNextPage) {
      fetchNextPage()
    }
  }, [isClientMode, inView, fetchNextPage, hasNextPage])

  const totalVariables = isClientMode ? columns?.length : data?.pages[0]?.total

  return (
    <div className="rounded-xl border border-border bg-card p-5 h-[600px] flex flex-col">
      <div className="mb-4 flex-none">
        <h3 className="text-base font-semibold text-foreground">
          Inspector de Variables
        </h3>
        <p className="text-sm text-muted-foreground">
          Explorar las variables disponibles ({totalVariables ?? 0})
        </p>
      </div>

      <div className="relative mb-4 flex-none">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar variable..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-secondary py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
        {isClientMode ? (
          // Renderizado de Datos Cliente (Array local filtrado)
          clientFiltered?.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No se encontraron variables
            </div>
          ) : (
            clientFiltered?.map((col) => {
              const Icon = DTYPE_ICONS[col.dtype] ?? Hash
              const color = DTYPE_COLORS[col.dtype] ?? "hsl(199, 89%, 48%)"
              const isExpanded = expandedVar === col.name

              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setExpandedVar(isExpanded ? null : col.name)}
                  className="w-full text-left rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" style={{ color }} />
                      <span className="text-sm font-medium text-foreground">
                        {col.name.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
                        style={{ color, backgroundColor: `${color}18` }}
                      >
                        {col.dtype}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {col.validPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Completeness bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${col.validPercentage}%`,
                        backgroundColor:
                          col.validPercentage > 90
                            ? "hsl(160, 84%, 39%)"
                            : col.validPercentage > 70
                              ? "hsl(35, 92%, 53%)"
                              : "hsl(346, 77%, 50%)",
                      }}
                    />
                  </div>

                  {isExpanded && (
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                      <div><span className="text-muted-foreground">Total:</span> <span className="font-mono text-foreground">{col.totalRows.toLocaleString()}</span></div>
                      <div><span className="text-muted-foreground">Validos:</span> <span className="font-mono text-foreground">{col.nonNullCount.toLocaleString()}</span></div>
                      <div><span className="text-muted-foreground">Nulos:</span> <span className="font-mono text-foreground">{col.nullCount.toLocaleString()}</span></div>
                      <div><span className="text-muted-foreground">% Nulos:</span> <span className="font-mono text-foreground">{col.nullPercentage.toFixed(2)}%</span></div>
                      {col.dtype === "numeric" && (
                        <>
                          <div><span className="text-muted-foreground">Min:</span> <span className="font-mono text-foreground">{col.min}</span></div>
                          <div><span className="text-muted-foreground">Max:</span> <span className="font-mono text-foreground">{col.max}</span></div>
                          <div><span className="text-muted-foreground">Media:</span> <span className="font-mono text-foreground">{col.mean}</span></div>
                        </>
                      )}
                    </div>
                  )}
                </button>
              )
            })
          )
        ) : (
          // Renderizado de Datos API (Scroll Infinito con React Query)
          // Maneja estados de carga (pending) y error antes de mostrar la lista
          status === "pending" ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : status === "error" ? (
            <div className="flex h-full items-center justify-center text-sm text-red-500">
              Error al cargar variables
            </div>
          ) : (
            <>
              {data?.pages.map((page, i) => (
                <div key={i} className="space-y-1.5">
                  {page.items.map((col) => {
                    const Icon = DTYPE_ICONS[col.dtype] ?? DTYPE_ICONS.unknown
                    const color = DTYPE_COLORS[col.dtype] ?? DTYPE_COLORS.unknown
                    const isExpanded = expandedVar === col.variable

                    return (
                      <button
                        key={col.variable}
                        type="button"
                        onClick={() => setExpandedVar(isExpanded ? null : col.variable)}
                        className="w-full text-left rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/60 cursor-default"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4" style={{ color }} />
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium text-foreground">
                                {col.variable}
                              </span>
                              {col.variable_label && (
                                <span className="text-xs text-muted-foreground text-left line-clamp-1">
                                  {col.variable_label}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
                              style={{ color, backgroundColor: `${color}18` }}
                            >
                              {col.dtype}
                            </span>
                            {col.valid_percentage !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                {col.valid_percentage.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 
                          Barra de Completitud para items de API
                          Se muestra solo si valid_percentage está definido.
                          Cambia de color din&aacute;micamente según el porcentaje (>90 verde, >70 amarillo, <70 rojo).
                        */}
                        {col.valid_percentage !== undefined && (
                          <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${col.valid_percentage}%`,
                                backgroundColor:
                                  col.valid_percentage > 90
                                    ? "hsl(160, 84%, 39%)"
                                    : col.valid_percentage > 70
                                      ? "hsl(35, 92%, 53%)"
                                      : "hsl(346, 77%, 50%)",
                              }}
                            />
                          </div>
                        )}

                        {isExpanded && col.keywords && col.keywords.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {col.keywords.map((kw, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0 h-5 border-muted-foreground/30 text-muted-foreground">
                                <Tag className="w-3 h-3 mr-1" />
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {isExpanded && col.valid_percentage !== undefined && (
                          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                            <div><span className="text-muted-foreground">Total:</span> <span className="font-mono text-foreground">{col.total_rows?.toLocaleString() ?? 0}</span></div>
                            <div><span className="text-muted-foreground">Validos:</span> <span className="font-mono text-foreground">{col.non_null_count?.toLocaleString() ?? 0}</span></div>
                            <div><span className="text-muted-foreground">Nulos:</span> <span className="font-mono text-foreground">{col.null_count?.toLocaleString() ?? 0}</span></div>
                            <div><span className="text-muted-foreground">% Completitud:</span> <span className="font-mono text-foreground">{col.valid_percentage.toFixed(2)}%</span></div>
                          </div>
                        )}

                        {isExpanded && col.categories && col.categories.length > 0 && (
                          <div className="mt-3 border-t border-border pt-2">
                            <span className="text-xs font-medium text-muted-foreground mb-1 block">Categorias / Valores:</span>
                            <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs">
                              {col.categories.map((cat, idx) => (
                                <div key={idx} className="contents">
                                  <div className="font-mono text-primary/80">{cat.code}</div>
                                  <div className="text-foreground">{cat.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}

              <div ref={ref} className="py-2 flex justify-center h-8">
                {isFetchingNextPage && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {data?.pages[0].items.length === 0 && (
                <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                  No se encontraron variables
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  )
}
