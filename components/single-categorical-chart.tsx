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

interface SingleCategoricalChartProps {
  variables: any[]
  title?: string
}

interface CategoryData {
  name: string
  value: number
  percentage: number
}

export function SingleCategoricalChart({ variables, title = "Variables Categóricas" }: SingleCategoricalChartProps) {
  const [selectedVar, setSelectedVar] = useState<string>(variables[0]?.variable || "")

  const selectedData = useMemo(() => {
    return variables.find(v => v.variable === selectedVar)
  }, [variables, selectedVar])

  const chartData = useMemo(() => {
    if (!selectedData?.categories) return []
    
    return selectedData.categories.map((cat: any) => ({
      name: cat.value || cat.code || 'Unknown',
      value: cat.count || 0,
      percentage: ((cat.count || 0) / (selectedData.non_null_count || 1)) * 100
    })).sort((a, b) => b.value - a.value)
  }, [selectedData])

  const COLORS = [
    "hsl(199, 89%, 48%)",
    "hsl(160, 84%, 39%)",
    "hsl(35, 92%, 53%)",
    "hsl(346, 77%, 50%)",
    "hsl(47, 96%, 53%)",
    "hsl(280, 65%, 60%)",
    "hsl(199, 89%, 68%)",
    "hsl(160, 84%, 55%)",
    "hsl(35, 92%, 68%)",
    "hsl(346, 77%, 68%)",
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
          No hay variables categóricas disponibles
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
            Distribución de categorías individual
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 14%)" />
                <XAxis 
                  type="number" 
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cat-${entry.name}`} fill={COLORS[index % COLORS.length]} />
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
                  {chartData.map((entry, index) => (
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Total categorías:</span>
                <span className="font-mono font-semibold text-lg">{chartData.length}</span>
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
              <div>
                <span className="text-muted-foreground block">Categoría más común:</span>
                <span className="font-mono font-semibold text-lg">{chartData[0]?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Frecuencia máxima:</span>
                <span className="font-mono font-semibold text-lg">{chartData[0]?.value?.toLocaleString() || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Porcentaje máximo:</span>
                <span className="font-mono font-semibold text-lg">{(chartData[0]?.percentage || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
