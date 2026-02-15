"use client"

import { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SingleBooleanChartProps {
  variables: any[]
  title?: string
}

interface BooleanData {
  name: string
  value: number
  percentage: number
}

export function SingleBooleanChart({ variables, title = "Variables Booleanas" }: SingleBooleanChartProps) {
  const [selectedVar, setSelectedVar] = useState<string>(variables[0]?.variable || "")

  const selectedData = useMemo(() => {
    return variables.find(v => v.variable === selectedVar)
  }, [variables, selectedVar])

  const chartData = useMemo(() => {
    if (!selectedData?.categories) return []
    
    return selectedData.categories.map((cat: any) => ({
      name: cat.value === '1' || cat.value === true || cat.value === 'si' ? 'Verdadero' : 'Falso',
      value: cat.count || 0,
      percentage: ((cat.count || 0) / (selectedData.non_null_count || 1)) * 100
    })).sort((a: any, b: any) => b.value - a.value)
  }, [selectedData])

  const COLORS = [
    "hsl(160, 84%, 39%)", // Verde para verdadero
    "hsl(346, 77%, 50%)", // Rojo para falso
  ]

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }> }) {
    if (!active || !payload?.length) return null
    const data = payload[0].payload

    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
        <p className="mb-2 text-sm font-semibold text-foreground">{data.name}</p>
        <div className="grid gap-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Count:</span>
            <span className="font-mono font-semibold text-foreground">{data.value.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Percentage:</span>
            <span className="font-mono font-semibold" style={{ color: "hsl(160, 84%, 39%)" }}>
              {data.percentage.toFixed(1)}%
            </span>
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
          No hay variables booleanas disponibles
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Distribución de valores booleanos individual
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

      {selectedData && chartData.length > 0 && (
        <>
          {/* Gráfico de barras */}
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 14%)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`bool-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de pastel */}
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`pie-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Estadísticas detalladas */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Estadísticas: {selectedData.variable}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
              {chartData[0] && (
                <>
                  <div>
                    <span className="text-muted-foreground block">Valor más común:</span>
                    <span className="font-mono font-semibold text-lg">{chartData[0].name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Frecuencia:</span>
                    <span className="font-mono font-semibold text-lg">{chartData[0].value.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
