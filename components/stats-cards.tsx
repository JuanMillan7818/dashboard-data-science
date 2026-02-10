"use client"

import { Hash, Type, ToggleLeft, Calendar, Loader2, Activity } from "lucide-react"
import type { DataFrame } from "@/lib/dataframe-data"
import { useQuery } from "@tanstack/react-query"
import { fetchStats } from "@/lib/api"

interface StatsCardsProps {
  dataframe?: DataFrame
}

export function StatsCards({ dataframe }: StatsCardsProps) {
  const isClientMode = !!dataframe

  // API Mode Data
  const { data: apiStats, isLoading, isError } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    enabled: !isClientMode,
  })

  // Calculate Client Mode Data
  const clientStats = isClientMode ? {
    numeric: dataframe.columns.filter((c) => c.dtype === "numeric").length,
    categorical: dataframe.columns.filter((c) => c.dtype === "categorical").length,
    boolean: dataframe.columns.filter((c) => c.dtype === "boolean").length,
    datetime: dataframe.columns.filter((c) => c.dtype === "datetime").length,
    completeness: (() => {
      const totalNulls = dataframe.columns.reduce((sum, col) => sum + col.nullCount, 0)
      const totalCells = dataframe.totalRows * dataframe.totalColumns
      return totalCells > 0 ? ((totalCells - totalNulls) / totalCells) * 100 : 0
    })()
  } : null

  // Consolidate data for rendering
  const displayStats = isClientMode ? [
    { label: "Numericas", value: clientStats!.numeric, icon: Hash, color: "hsl(199, 89%, 48%)" },
    { label: "Categoricas", value: clientStats!.categorical, icon: Type, color: "hsl(160, 84%, 39%)" },
    { label: "Booleanas", value: clientStats!.boolean, icon: ToggleLeft, color: "hsl(35, 92%, 53%)" },
    { label: "Datetime", value: clientStats!.datetime, icon: Calendar, color: "hsl(346, 77%, 50%)" },
  ] : apiStats ? [
    { label: "Numericas", value: apiStats.stats.find(s => s.type === "numeric")?.value ?? 0, icon: Hash, color: "hsl(199, 89%, 48%)" },
    { label: "Categoricas", value: apiStats.stats.find(s => s.type === "categorical")?.value ?? 0, icon: Type, color: "hsl(160, 84%, 39%)" },
    { label: "Booleanas", value: apiStats.stats.find(s => s.type === "boolean")?.value ?? 0, icon: ToggleLeft, color: "hsl(35, 92%, 53%)" },
    { label: "Datetime", value: apiStats.stats.find(s => s.type === "datetime")?.value ?? 0, icon: Calendar, color: "hsl(346, 77%, 50%)" },
  ] : []

  const completeness = isClientMode
    ? clientStats!.completeness.toFixed(1)
    : apiStats?.completeness.toFixed(1) ?? "0.0"

  if (!isClientMode && isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-card/50" />
        ))}
      </div>
    )
  }

  if (!isClientMode && isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
        Error al cargar estadísticas
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {displayStats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2">
            <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {stat.value}
          </p>
        </div>
      ))}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "hsl(160, 84%, 39%)" }}
          />
          <span className="text-sm text-muted-foreground">Completitud</span>
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {completeness}%
        </p>
      </div>
    </div>
  )
}
