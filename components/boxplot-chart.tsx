"use client"

import { useState, useMemo } from "react"
import type { DataFrameColumn } from "@/lib/dataframe-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BoxplotChartProps {
  numericColumns: DataFrameColumn[]
}

interface BoxplotData {
  name: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
  mean: number
  std: number
  iqr: number
  lowerWhisker: number
  upperWhisker: number
}

function normalizeBoxplotData(col: DataFrameColumn): BoxplotData | null {
  if (
    col.min === undefined ||
    col.q1 === undefined ||
    col.median === undefined ||
    col.q3 === undefined ||
    col.max === undefined ||
    col.mean === undefined ||
    col.std === undefined
  )
    return null

  const iqr = col.q3 - col.q1
  return {
    name: col.name,
    min: col.min,
    q1: col.q1,
    median: col.median,
    q3: col.q3,
    max: col.max,
    mean: col.mean,
    std: col.std,
    iqr,
    lowerWhisker: Math.max(col.min, col.q1 - 1.5 * iqr),
    upperWhisker: Math.min(col.max, col.q3 + 1.5 * iqr),
  }
}

function SingleBoxplot({ data, color }: { data: BoxplotData; color: string }) {
  const range = data.max - data.min
  const padding = range * 0.1
  const totalRange = range + padding * 2
  const minVal = data.min - padding
  const width = 400
  const height = 120
  const boxHeight = 44
  const boxY = (height - boxHeight) / 2

  const scale = (val: number) =>
    ((val - minVal) / totalRange) * (width - 60) + 30

  const ticks = [data.min, data.q1, data.median, data.q3, data.max]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ maxHeight: 120 }}
    >
      {/* Whisker line */}
      <line
        x1={scale(data.lowerWhisker)}
        y1={height / 2}
        x2={scale(data.upperWhisker)}
        y2={height / 2}
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.6}
      />
      {/* Lower whisker cap */}
      <line
        x1={scale(data.lowerWhisker)}
        y1={boxY + 8}
        x2={scale(data.lowerWhisker)}
        y2={boxY + boxHeight - 8}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Upper whisker cap */}
      <line
        x1={scale(data.upperWhisker)}
        y1={boxY + 8}
        x2={scale(data.upperWhisker)}
        y2={boxY + boxHeight - 8}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* IQR Box */}
      <rect
        x={scale(data.q1)}
        y={boxY}
        width={scale(data.q3) - scale(data.q1)}
        height={boxHeight}
        fill={color}
        fillOpacity={0.15}
        stroke={color}
        strokeWidth={1.5}
        rx={4}
      />
      {/* Median line */}
      <line
        x1={scale(data.median)}
        y1={boxY}
        x2={scale(data.median)}
        y2={boxY + boxHeight}
        stroke={color}
        strokeWidth={2.5}
      />
      {/* Mean dot */}
      <circle
        cx={scale(data.mean)}
        cy={height / 2}
        r={4}
        fill="hsl(35, 92%, 53%)"
        stroke="hsl(222, 47%, 8%)"
        strokeWidth={1.5}
      />
      {/* Tick labels */}
      {ticks.map((tick, i) => (
        <text
          key={`tick-${i}-${tick}`}
          x={scale(tick)}
          y={height - 4}
          textAnchor="middle"
          fill="hsl(215, 20%, 55%)"
          fontSize={9}
          fontFamily="monospace"
        >
          {tick.toLocaleString()}
        </text>
      ))}
    </svg>
  )
}

export function BoxplotChart({ numericColumns }: BoxplotChartProps) {
  const [selectedVars, setSelectedVars] = useState<string[]>(
    numericColumns.slice(0, 4).map((c) => c.name)
  )
  const [compareMode, setCompareMode] = useState<"single" | "compare">(
    "compare"
  )
  const [singleVar, setSingleVar] = useState(numericColumns[0]?.name ?? "")

  const COLORS = [
    "hsl(199, 89%, 48%)",
    "hsl(160, 84%, 39%)",
    "hsl(35, 92%, 53%)",
    "hsl(346, 77%, 50%)",
    "hsl(47, 96%, 53%)",
    "hsl(280, 65%, 60%)",
    "hsl(199, 89%, 68%)",
    "hsl(160, 84%, 55%)",
  ]

  const boxplots = useMemo(() => {
    if (compareMode === "single") {
      const col = numericColumns.find((c) => c.name === singleVar)
      if (!col) return []
      const d = normalizeBoxplotData(col)
      return d ? [d] : []
    }
    return selectedVars
      .map((name) => {
        const col = numericColumns.find((c) => c.name === name)
        if (!col) return null
        return normalizeBoxplotData(col)
      })
      .filter(Boolean) as BoxplotData[]
  }, [numericColumns, selectedVars, compareMode, singleVar])

  const toggleVariable = (name: string) => {
    setSelectedVars((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Distribucion de Variables Numericas
          </h3>
          <p className="text-sm text-muted-foreground">
            Boxplot: min, Q1, mediana, Q3, max y media
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setCompareMode("compare")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              compareMode === "compare"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            Comparar
          </button>
          <button
            type="button"
            onClick={() => setCompareMode("single")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              compareMode === "single"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            Individual
          </button>
        </div>
      </div>

      {compareMode === "compare" ? (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {numericColumns.map((col) => (
            <button
              key={col.name}
              type="button"
              onClick={() => toggleVariable(col.name)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedVars.includes(col.name)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {col.name.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-4 w-full max-w-xs">
          <Select value={singleVar} onValueChange={setSingleVar}>
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue placeholder="Seleccionar variable" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map((col) => (
                <SelectItem key={col.name} value={col.name}>
                  {col.name.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-6 rounded-sm border" style={{ borderColor: "hsl(199, 89%, 48%)", backgroundColor: "hsla(199, 89%, 48%, 0.15)" }} />
          <span>IQR (Q1-Q3)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-6" style={{ backgroundColor: "hsl(199, 89%, 48%)" }} />
          <span>Mediana</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(35, 92%, 53%)" }} />
          <span>Media</span>
        </div>
      </div>

      <div className="space-y-2">
        {boxplots.length > 0 ? (
          boxplots.map((bp, i) => (
            <div key={bp.name} className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {bp.name.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-mono">
                  <span className="text-muted-foreground">
                    Min: <span className="text-foreground">{bp.min.toLocaleString()}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Q1: <span className="text-foreground">{bp.q1.toLocaleString()}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Med: <span className="text-foreground">{bp.median.toLocaleString()}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Q3: <span className="text-foreground">{bp.q3.toLocaleString()}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Max: <span className="text-foreground">{bp.max.toLocaleString()}</span>
                  </span>
                  <span className="text-muted-foreground">
                    <span style={{ color: "hsl(35, 92%, 53%)" }}>x&#772;</span>: <span className="text-foreground">{bp.mean.toLocaleString()}</span>
                  </span>
                  <span className="text-muted-foreground">
                    &sigma;: <span className="text-foreground">{bp.std.toLocaleString()}</span>
                  </span>
                </div>
              </div>
              <SingleBoxplot
                data={bp}
                color={COLORS[i % COLORS.length]}
              />
            </div>
          ))
        ) : (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Selecciona al menos una variable
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
