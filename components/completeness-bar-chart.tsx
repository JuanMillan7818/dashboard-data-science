"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { fetchCompleteness, fetchNumericStats, CompletenessItem } from "@/lib/api"
import { Loader2, Download } from "lucide-react"
import type { DataFrameColumn } from "@/lib/dataframe-data"
import { useInView } from "react-intersection-observer"

type FilterType = "all" | "numeric" | "categorical" | "boolean" | "datetime"

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }> }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
      <p className="mb-2 text-sm font-semibold text-foreground">{data.name}</p>
      <div className="grid gap-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Tipo:</span>
          <span className="font-medium text-foreground capitalize">{data.dtype}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Completitud:</span>
          <span className="font-mono font-semibold" style={{ color: "hsl(160, 84%, 39%)" }}>
            {data.validPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="my-1 h-px bg-border" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "hsl(160, 84%, 39%)" }} />
            <span className="text-muted-foreground">Validos:</span>
          </div>
          <span className="font-mono font-medium text-foreground">
            {data.nonNullCount.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "hsl(346, 77%, 50%)" }} />
            <span className="text-muted-foreground">Nulos:</span>
          </div>
          <span className="font-mono font-medium text-foreground">
            {data.nullCount.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Total filas:</span>
          <span className="font-mono text-muted-foreground">
            {data.totalRows.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

interface CompletenessBarChartProps {
  columns?: DataFrameColumn[]
}

export function CompletenessBarChart({ columns }: CompletenessBarChartProps) {
  const [filter, setFilter] = useState<FilterType>("all")
  const isClientMode = !!columns
  const { ref, inView } = useInView()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  /**
   * Efecto: Reiniciar posición de scroll al inicio cuando cambia el filtro.
   * Esto asegura que el usuario vea los primeros elementos de los nuevos resultados filtrados.
   */
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [filter])

  /**
   * Obtención de Datos: Consulta de Scroll Infinito
   * Obtiene datos de completitud en páginas de 100 elementos.
   * El estado 'filter' es parte de la queryKey para separar cachés por tipo de filtro.
   */
  const {
    data: apiData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["completeness_infinite", filter],
    queryFn: ({ pageParam = 1 }) => fetchCompleteness({ pageParam, size: 100, dtype: filter }),
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

  /**
   * Maneja los cambios de filtro por interacción del usuario.
   * CRÍTICO: Invalida la caché de consulta específica para el nuevo filtro.
   * Esto garantiza que al cambiar de filtro siempre se carguen datos frescos desde la página 1,
   * evitando estados obsoletos de navegaciones anteriores.
   */
  const handleFilterChange = (newFilter: FilterType) => {
    if (!isClientMode) {
      // Reiniciar la caché para el nuevo filtro para asegurar que empezamos desde la página 1
      // y no disparamos múltiples solicitudes para páginas cargadas previamente
      queryClient.removeQueries({ queryKey: ["completeness_infinite", newFilter] })
    }
    setFilter(newFilter)
  }

  /**
   * Lógica de Filtrado, Normalización y Ordenamiento (Memorizada)
   * 1. Combina datos de entrada (Cliente o API).
   * 2. Filtra por tipo de dato (dtype) si es necesario.
   * 3. Normaliza nombres de claves (snake_case de API vs camelCase de Cliente).
   * 4. Ordena por porcentaje de validez ascendente para visualización en gráfico.
   */
  const filteredData = useMemo(() => {
    let rawItems: any[] = []

    if (isClientMode) {
      rawItems = columns || []
    } else {
      rawItems = apiData?.pages.flatMap(page => page.items) || []
    }

    const filtered =
      filter === "all"
        ? rawItems
        : rawItems.filter((c: any) => c.dtype === filter)

    return filtered
      .map((col: any) => {
        // Normalizar campos (manejar snake_case de API y camelCase de local)
        const validPercentage = col.validPercentage ?? col.valid_percentage ?? 0
        const nullCount = col.nullCount ?? col.null_count ?? 0
        const nonNullCount = col.nonNullCount ?? col.non_null_count ?? 0
        const totalRows = col.totalRows ?? col.total_rows ?? 0
        const name = col.name ?? col.variable

        return {
          ...col,
          name,
          validPercentage,
          nullCount,
          nonNullCount,
          totalRows,
        }
      })
      // Ordenar por porcentaje de validez (menor a mayor)
      .sort((a: any, b: any) => a.validPercentage - b.validPercentage)
  }, [isClientMode, columns, apiData, filter])

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: "Todas", value: "all" },
    { label: "Numericas", value: "numeric" },
    { label: "Categoricas", value: "categorical" },
    { label: "Booleanas", value: "boolean" },
    { label: "Datetime", value: "datetime" },
  ]

  const exportChart = () => {
    // Encontrar el elemento SVG del gráfico - múltiples intentos
    let chartElement = document.querySelector('.recharts-wrapper svg')
  
    // Si no encuentra, intentar otros selectores
    if (!chartElement) {
      chartElement = document.querySelector('svg[style*="overflow: hidden"]')
    }
    if (!chartElement) {
      chartElement = document.querySelector('.recharts-surface svg')
    }
    if (!chartElement) {
      chartElement = document.querySelector('div[class*="recharts"] svg')
    }
  
    if (!chartElement) {
      alert('No se encontró el gráfico para exportar. Intente asegurar que el gráfico sea visible.')
      return
    }

    // Serializar SVG a string
    const svgData = new XMLSerializer().serializeToString(chartElement)
  
    // Crear un canvas para convertir SVG a imagen
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
  
    img.onload = function() {
      canvas.width = 800  // Ancho fijo para mejor calidad
      canvas.height = 600  // Alto fijo para mejor calidad
      ctx?.drawImage(img, 0, 0)
      
      // Convertir canvas a blob y descargar
      canvas.toBlob(function(blob) {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = 'completitud_variables.png'
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/png', 0.95)  // 95% calidad
    }
  
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const exportAllChart = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Mostrar indicador de carga
    const button = event.currentTarget
    const originalText = button.innerHTML
    button.innerHTML = '<div class="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div> Cargando...'
    button.disabled = true

    try {
      // Cargar todas las variables de una sola vez desde el endpoint
      const allVars = await fetchNumericStats()
      const allData = allVars.sort((a: any, b: any) => a.valid_percentage - b.valid_percentage)

      // Crear un gráfico temporal con todos los datos
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.width = '2400px'
      tempContainer.style.height = `${Math.max(800, allData.length * 25)}px`
      document.body.appendChild(tempContainer)

      // Renderizar el gráfico completo
      const chartHTML = `
        <svg width="2400" height="${Math.max(800, allData.length * 25)}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 ${Math.max(800, allData.length * 25)}">
          <rect width="2400" height="${Math.max(800, allData.length * 25)}" fill="white"/>
          <text x="1200" y="40" text-anchor="middle" font-size="28" font-weight="bold" fill="#1a1a1a">
            Data Completeness
          </text>
          <line x1="200" y1="60" x2="2200" y2="60" stroke="#e0e0e0" stroke-width="2"/>
          
          ${allData.map((item, index) => {
            const y = 80 + index * 25
            const barWidth = (item.valid_percentage / 100) * 1600
            const color = item.valid_percentage > 90 ? '#22c55e' : 
                         item.valid_percentage >= 70 ? '#eab308' : '#ef4444'
            
            return `
              <rect x="400" y="${y}" width="${barWidth}" height="20" fill="${color}" opacity="0.85"/>
              <text x="380" y="${y + 15}" text-anchor="end" font-size="14" fill="#333" font-family="Arial, sans-serif">${item.variable}</text>
              <text x="2020" y="${y + 15}" text-anchor="start" font-size="14" fill="#666" font-family="Arial, sans-serif">${item.valid_percentage.toFixed(1)}%</text>
            `
          }).join('')}
          
          <text x="400" y="${80 + allData.length * 25 + 30}" font-size="16" fill="#666" font-family="Arial, sans-serif">0%</text>
          <text x="2000" y="${80 + allData.length * 25 + 30}" font-size="16" fill="#666" font-family="Arial, sans-serif">100%</text>
          <line x1="400" y1="${80 + allData.length * 25 + 10}" x2="2000" y2="${80 + allData.length * 25 + 10}" stroke="#e0e0e0" stroke-width="1"/>
        </svg>
      `
      
      tempContainer.innerHTML = chartHTML
      
      // Convertir SVG a imagen
      const svgElement = tempContainer.querySelector('svg')
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = function() {
          canvas.width = 2400
          canvas.height = Math.max(800, allData.length * 25)
          ctx?.drawImage(img, 0, 0)
          
          canvas.toBlob(function(blob) {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.download = `data_completeness_per_variable_${new Date().toISOString().split('T')[0]}.png`
              link.href = url
              link.click()
              URL.revokeObjectURL(url)
            }
          }, 'image/png', 1.0)
        }
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
      }
      
      // Limpiar
      setTimeout(() => {
        document.body.removeChild(tempContainer)
      }, 1000)
      
    } catch (error) {
      console.error('Error al exportar:', error)
      alert('Error al exportar el gráfico. Intente de nuevo.')
    } finally {
      // Restaurar botón
      button.innerHTML = originalText
      button.disabled = false
    }
  }

  const exportToPDF = () => {
    const data = filteredData.map(item => ({
      Variable: item.name,
      Tipo: item.dtype,
      'Completitud (%)': item.validPercentage.toFixed(1),
      Nulos: item.nullCount,
      'Total filas': item.totalRows
    }))

    // Crear contenido CSV para exportación
    const headers = ['Variable', 'Tipo', 'Completitud (%)', 'Nulos', 'Total filas']
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.Variable,
        row.Tipo,
        row['Completitud (%)'],
        row.Nulos,
        row['Total filas']
      ].join(','))
    ].join('\n')

    // Descargar como archivo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'completitud_variables.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isClientMode && isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isClientMode && isError) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 h-[400px] flex items-center justify-center text-red-500">
        Error al cargar datos de completitud
      </div>
    )
  }

  // Calculate distinct counts for summary
  const totalCount = isClientMode ? columns!.length : apiData?.pages[0]?.total ?? 0

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Completitud de Variables
          </h3>
          <p className="text-sm text-muted-foreground">
            Porcentaje de valores no nulos por variable
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleFilterChange(opt.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${filter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            onClick={exportAllChart}
            className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-muted flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Exportar TODO
          </button>
          <button
            type="button"
            onClick={exportToPDF}
            className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-muted flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(160, 84%, 39%)" }} />
          <span className="text-xs text-muted-foreground">{">"} 90% completo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(35, 92%, 53%)" }} />
          <span className="text-xs text-muted-foreground">70-90%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(346, 77%, 50%)" }} />
          <span className="text-xs text-muted-foreground">{"<"} 70%</span>
        </div>
      </div>

      {filteredData.length > 0 ? (
        <div ref={scrollContainerRef} className="relative w-full overflow-y-auto pr-2" style={{ maxHeight: "800px" }}>
          {/* Dynamic height based on items count, plus extra space for scroll loading */}
          <div style={{ height: Math.max(400, filteredData.length * 25 + 50) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 0, bottom: 50 }}
                barCategoryGap="10%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(222, 47%, 14%)"
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(222, 47%, 14%)" }}
                  tickLine={{ stroke: "hsl(222, 47%, 14%)" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  tick={{ fill: "hsl(210, 40%, 96%)", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(222, 47%, 14%)" }}
                  tickLine={false}
                  interval={0}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "hsla(222, 47%, 14%, 0.5)" }}
                />
                <ReferenceLine
                  x={90}
                  stroke="hsl(215, 20%, 35%)"
                  strokeDasharray="4 4"
                  label={{
                    value: "90%",
                    position: "top",
                    fill: "hsl(215, 20%, 55%)",
                    fontSize: 10,
                  }}
                />
                <Bar dataKey="validPercentage" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {filteredData.map((entry: any) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.validPercentage > 90
                          ? "hsl(160, 84%, 39%)"
                          : entry.validPercentage > 70
                            ? "hsl(35, 92%, 53%)"
                            : "hsl(346, 77%, 50%)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Infinite Scroll Trigger */}
          {!isClientMode && hasNextPage && (
            <div ref={ref} className="py-2 flex justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No hay variables de este tipo
          </p>
        </div>
      )}

      <div className="mt-3 flex justify-end gap-3 items-center">
        {!isClientMode && (
          <span className="text-xs text-muted-foreground">
            Mostrando {filteredData.length} de {totalCount}
          </span>
        )}
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
          {filteredData.length} variable{filteredData.length !== 1 ? "s" : ""}
        </Badge>
      </div>
    </div>
  )
}
