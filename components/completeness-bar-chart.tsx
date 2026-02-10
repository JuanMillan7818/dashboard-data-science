"use client"

import { useState, useMemo } from "react"
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
import { useQuery } from "@tanstack/react-query"
import { fetchCompleteness, CompletenessItem } from "@/lib/api"
import { Loader2 } from "lucide-react"
import type { DataFrameColumn } from "@/lib/dataframe-data"

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

  const { data: apiData, isLoading, isError } = useQuery({
    queryKey: ["completeness"],
    queryFn: fetchCompleteness,
    enabled: !isClientMode,
  })

  const filteredData = useMemo(() => {
    let rawItems: any[] = []

    if (isClientMode) {
      rawItems = columns || []
    } else {
      rawItems = apiData?.items || []
    }

    const filtered =
      filter === "all"
        ? rawItems
        : rawItems.filter((c: any) => c.dtype === filter)

    return filtered
      .map((col: any) => {
        // Normalize fields
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
      .sort((a: any, b: any) => a.validPercentage - b.validPercentage)
  }, [isClientMode, columns, apiData, filter])

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: "Todas", value: "all" },
    { label: "Numericas", value: "numeric" },
    { label: "Categoricas", value: "categorical" },
    { label: "Booleanas", value: "boolean" },
    { label: "Datetime", value: "datetime" },
  ]

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
              onClick={() => setFilter(opt.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${filter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
            >
              {opt.label}
            </button>
          ))}
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
        <div className="relative w-full overflow-y-auto pr-2" style={{ maxHeight: "600px" }}>
          {/* Dynamic height based on items count */}
          <div style={{ height: Math.max(300, filteredData.length * 30) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                barCategoryGap="20%"
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
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No hay variables de este tipo
          </p>
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
          {filteredData.length} variable{filteredData.length !== 1 ? "s" : ""}
        </Badge>
      </div>
    </div>
  )
}
