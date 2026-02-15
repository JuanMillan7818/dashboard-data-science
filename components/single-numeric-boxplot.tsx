"use client"

import { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SingleNumericBoxplotProps {
  variables: any[]
  title?: string
}

interface BoxplotData {
  name: string
  mean: number
  std: number
  min: number
  max: number
  valid_percentage: number
  non_null_count: number
}

export function SingleNumericBoxplot({ variables, title = "Variables Numéricas" }: SingleNumericBoxplotProps) {
  const [selectedVar, setSelectedVar] = useState<string>(variables[0]?.variable || "")

  const selectedData = useMemo(() => {
    return variables.find(v => v.variable === selectedVar)
  }, [variables, selectedVar])

  const COLORS = [
    "hsl(199, 89%, 48%)",
    "hsl(160, 84%, 39%)",
    "hsl(35, 92%, 53%)",
    "hsl(346, 77%, 50%)",
    "hsl(47, 96%, 53%)",
  ]

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }> }) {
    if (!active || !payload?.length) return null
    const data = payload[0].payload

    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
        <p className="mb-2 text-sm font-semibold text-foreground">{data.name}</p>
        <div className="grid gap-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Value:</span>
            <span className="font-mono font-semibold text-foreground">{data.value.toFixed(2)}</span>
          </div>
        </div>
      </div>
    )
  }

  if (variables.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No hay variables numéricas disponibles
        </div>
      </div>
    )
  }

  // Crear datos para el boxplot
  const boxplotData = selectedData ? [
    { name: 'Min', value: selectedData.min || 0 },
    { name: 'Q1', value: (selectedData.min || 0) + ((selectedData.mean || 0) - (selectedData.min || 0)) * 0.25 },
    { name: 'Median', value: selectedData.mean || 0 },
    { name: 'Q3', value: (selectedData.mean || 0) + ((selectedData.max || 0) - (selectedData.mean || 0)) * 0.25 },
    { name: 'Max', value: selectedData.max || 0 },
  ] : []

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Boxplot individual para variables numéricas
          </p>
        </div>
        <Select value={selectedVar} onValueChange={setSelectedVar}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleccionar variable" />
          </SelectTrigger>
          <SelectContent>
            {variables.map((variable) => (
              <SelectItem key={variable.variable} value={variable.variable}>
                {variable.variable}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedData && (
        <>
          {/* Boxplot */}
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={boxplotData}
                margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 14%)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {boxplotData.map((entry, index) => (
                    <Cell key={`boxplot-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Estadísticas detalladas */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Estadísticas: {selectedData.variable}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Media:</span>
                <span className="font-mono font-semibold text-lg">{(selectedData.mean || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Desviación estándar:</span>
                <span className="font-mono font-semibold text-lg">{(selectedData.std || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Mínimo:</span>
                <span className="font-mono font-semibold text-lg">{(selectedData.min || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Máximo:</span>
                <span className="font-mono font-semibold text-lg">{(selectedData.max || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Valores no nulos:</span>
                <span className="font-mono font-semibold text-lg">{(selectedData.non_null_count || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Completitud:</span>
                <span className="font-mono font-semibold text-lg" style={{ color: "hsl(160, 84%, 39%)" }}>
                  {(selectedData.valid_percentage || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
