"use client"

import { useState, useMemo } from "react"
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import type { DataFrameColumn } from "@/lib/dataframe-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CategoryRadarChartProps {
  categoricalColumns: DataFrameColumn[]
}

const RADAR_COLORS = [
  "hsl(199, 89%, 48%)",
  "hsl(160, 84%, 39%)",
  "hsl(35, 92%, 53%)",
]

function RadarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
      <p className="mb-1.5 text-sm font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium text-foreground">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CategoryRadarChart({
  categoricalColumns,
}: CategoryRadarChartProps) {
  const [selectedVars, setSelectedVars] = useState<string[]>(
    categoricalColumns.length > 0
      ? [categoricalColumns[0].name]
      : []
  )
  const [viewMode, setViewMode] = useState<"count" | "percentage">("count")

  const addVariable = (name: string) => {
    if (selectedVars.length < 3 && !selectedVars.includes(name)) {
      setSelectedVars((prev) => [...prev, name])
    }
  }

  const removeVariable = (name: string) => {
    setSelectedVars((prev) => prev.filter((n) => n !== name))
  }

  const radarData = useMemo(() => {
    if (selectedVars.length === 0) return []

    // Get all unique categories across selected variables
    if (selectedVars.length === 1) {
      const col = categoricalColumns.find(
        (c) => c.name === selectedVars[0]
      )
      if (!col?.categories) return []
      const total = col.categories.reduce((s, c) => s + c.count, 0)
      return col.categories.map((cat) => ({
        category: cat.name,
        [col.name]: viewMode === "count" ? cat.count : parseFloat(((cat.count / total) * 100).toFixed(1)),
      }))
    }

    // Multi-variable: normalize categories so they can be compared
    // Use percentage mode for comparison
    const allCategories = new Set<string>()
    for (const varName of selectedVars) {
      const col = categoricalColumns.find((c) => c.name === varName)
      if (col?.categories) {
        for (const cat of col.categories) {
          allCategories.add(cat.name)
        }
      }
    }

    return Array.from(allCategories).map((catName) => {
      const entry: Record<string, string | number> = { category: catName }
      for (const varName of selectedVars) {
        const col = categoricalColumns.find((c) => c.name === varName)
        if (col?.categories) {
          const total = col.categories.reduce((s, c) => s + c.count, 0)
          const found = col.categories.find((c) => c.name === catName)
          entry[varName] =
            viewMode === "count"
              ? found?.count ?? 0
              : found
                ? parseFloat(((found.count / total) * 100).toFixed(1))
                : 0
        }
      }
      return entry
    })
  }, [categoricalColumns, selectedVars, viewMode])

  const availableVars = categoricalColumns.filter(
    (c) => !selectedVars.includes(c.name)
  )

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Distribucion Categorica
          </h3>
          <p className="text-sm text-muted-foreground">
            Radar de variables categoricas (max. 3 simultaneas)
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode("count")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode === "count"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            Conteo
          </button>
          <button
            type="button"
            onClick={() => setViewMode("percentage")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode === "percentage"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            Porcentaje
          </button>
        </div>
      </div>

      {/* Selected variables chips */}
      <div className="mb-3 flex flex-wrap gap-2">
        {selectedVars.map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => removeVariable(name)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:opacity-80"
            style={{ backgroundColor: `${RADAR_COLORS[i]}30`, border: `1px solid ${RADAR_COLORS[i]}` }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: RADAR_COLORS[i] }}
            />
            {name.replace(/_/g, " ")}
            <span className="ml-1 text-muted-foreground">&times;</span>
          </button>
        ))}
      </div>

      {/* Variable selector */}
      {availableVars.length > 0 && selectedVars.length < 3 && (
        <div className="mb-4 w-full max-w-xs">
          <Select onValueChange={addVariable} value="">
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue placeholder="Agregar variable..." />
            </SelectTrigger>
            <SelectContent>
              {availableVars.map((col) => (
                <SelectItem key={col.name} value={col.name}>
                  {col.name.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {radarData.length > 0 ? (
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={radarData}
              cx="50%"
              cy="50%"
              outerRadius="75%"
            >
              <PolarGrid
                stroke="hsl(222, 47%, 18%)"
                strokeOpacity={0.8}
              />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "hsl(210, 40%, 96%)", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 9 }}
                axisLine={false}
              />
              {selectedVars.map((varName, i) => (
                <Radar
                  key={varName}
                  name={varName.replace(/_/g, " ")}
                  dataKey={varName}
                  stroke={RADAR_COLORS[i]}
                  fill={RADAR_COLORS[i]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Tooltip content={<RadarTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "hsl(210, 40%, 96%)" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[350px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Selecciona al menos una variable categorica
          </p>
        </div>
      )}

      {/* Category breakdown table */}
      {selectedVars.length === 1 && (
        <div className="mt-4">
          {(() => {
            const col = categoricalColumns.find(
              (c) => c.name === selectedVars[0]
            )
            if (!col?.categories) return null
            const total = col.categories.reduce((s, c) => s + c.count, 0)
            return (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Categoria
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        Conteo
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        %
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Distribucion
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {col.categories
                      .sort((a, b) => b.count - a.count)
                      .map((cat, i) => {
                        const pct = (cat.count / total) * 100
                        return (
                          <tr
                            key={cat.name}
                            className="border-b border-border last:border-0"
                          >
                            <td className="px-3 py-2 text-foreground">
                              {cat.name}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-foreground">
                              {cat.count.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-foreground">
                              {pct.toFixed(1)}%
                            </td>
                            <td className="px-3 py-2">
                              <div className="h-2 w-full rounded-full bg-secondary">
                                <div
                                  className="h-2 rounded-full transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor:
                                      RADAR_COLORS[
                                        i % RADAR_COLORS.length
                                      ],
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
