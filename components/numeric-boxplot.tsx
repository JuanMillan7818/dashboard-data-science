"use client"

import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface NumericBoxplotProps {
  variables: any[]
  title?: string
}

interface ChartData {
  id: string
  name: string
  variable_label?: string
  mean?: number
  std?: number
  min?: number
  max?: number
  q1?: number
  median?: number
  q3?: number
  valid_percentage: number
  null_count: number
  non_null_count: number
  total_rows: number
}

export function NumericBoxplot({ variables, title = "Variables Numéricas" }: NumericBoxplotProps) {
  const [selectedVar, setSelectedVar] = useState<string>(variables[0]?.variable || "")
  const [sortBy, setSortBy] = useState<"name" | "mean" | "completeness">("completeness")

  const chartData = useMemo(() => {
    // Si no hay variables, devolver array vacío
    if (!variables || !Array.isArray(variables) || variables.length === 0) {
      return []
    }
    
    // Procesar variables numéricas con estadísticas reales
    let data = variables
      .filter((variable) => 
        variable && 
        typeof variable === 'object' && 
        variable.variable &&
        variable.dtype === 'numeric' // Solo variables numéricas del endpoint
      )
      .map((variable, index) => {
        // Crear datos limpios con ID único
        const varName = variable.variable || variable.name || `Variable-${index}`
        const uniqueId = `var-${varName.replace(/[^a-zA-Z0-9]/g, '_')}-${index}`
        
        return {
          id: uniqueId,
          name: varName,
          variable_label: variable.variable_label || varName,
          mean: Number(variable.mean),
          std: Number(variable.std),
          min: Number(variable.min),
          max: Number(variable.max),
          q1: Number(variable.q1),
          median: Number(variable.median),
          q3: Number(variable.q3),
          valid_percentage: Number(variable.valid_percentage) || 0,
          null_count: Number(variable.null_count) || 0,
          non_null_count: Number(variable.non_null_count) || 0,
          total_rows: Number(variable.total_rows) || 0
        }
      })
      .filter(item => item.non_null_count > 0) // Solo variables con datos

    // Ordenar por completitud (de menor a mayor)
    data.sort((a, b) => a.valid_percentage - b.valid_percentage)

    return data.slice(0, 15) // Top 15 variables
  }, [variables])

  const selectedData = chartData.find(d => d.name === selectedVar)

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
    "hsl(47, 96%, 68%)",
    "hsl(280, 65%, 75%)",
    "hsl(199, 89%, 75%)",
    "hsl(160, 84%, 75%)",
    "hsl(35, 92%, 75%)",
  ]

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }> }) {
    if (!active || !payload?.length) return null
    const data = payload[0].payload

    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
        <p className="mb-2 text-sm font-semibold text-foreground">{data.name}</p>
        <div className="grid gap-1.5 text-xs">
          {data.mean !== undefined && (
            <>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Media:</span>
                <span className="font-mono font-semibold text-foreground">{data.mean.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Desv. estándar:</span>
                <span className="font-mono font-semibold text-foreground">{data.std?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Rango:</span>
                <span className="font-mono font-semibold text-foreground">
                  [{data.min?.toFixed(2) || 'N/A'}, {data.max?.toFixed(2) || 'N/A'}]
                </span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Completitud:</span>
            <span className="font-mono font-semibold" style={{ color: "hsl(160, 84%, 39%)" }}>
              {data.valid_percentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Valores no nulos:</span>
            <span className="font-mono font-semibold text-foreground">{data.non_null_count.toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No hay variables numéricas disponibles
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Boxplots individuales de variables numéricas
        </p>
      </div>

      {/* Selector de variable */}
      <div className="mb-6">
        <Select value={selectedVar} onValueChange={setSelectedVar}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleccionar variable" />
          </SelectTrigger>
          <SelectContent>
            {chartData.map((variable) => (
              <SelectItem key={variable.id} value={variable.name}>
                {variable.variable_label || variable.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Boxplot individual */}
      {selectedData && (
        <div className="mb-6">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground">
              {selectedData.variable_label || selectedData.name}
            </h4>
            <p className="text-xs text-muted-foreground">
              Completitud: {selectedData.valid_percentage.toFixed(1)}% | 
              N: {selectedData.non_null_count.toLocaleString()}/{selectedData.total_rows.toLocaleString()}
            </p>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { 
                  name: selectedData.variable_label || selectedData.name,
                  min: selectedData.min,
                  q1: selectedData.q1,
                  median: selectedData.median,
                  q3: selectedData.q3,
                  max: selectedData.max,
                  mean: selectedData.mean
                }
              ]}
              margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 14%)" />
              <XAxis 
                type="number"
                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                label={{ value: "Valor", position: "insideBottom", offset: -5, fill: "hsl(215, 20%, 55%)" }}
              />
              <YAxis 
                type="category"
                dataKey="name" 
                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                width={100}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
                      <p className="mb-2 text-sm font-semibold text-foreground">{data.name}</p>
                      <div className="grid gap-1.5 text-xs">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Mínimo:</span>
                          <span className="font-mono font-semibold">{data.min?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Q1:</span>
                          <span className="font-mono font-semibold">{data.q1?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Mediana:</span>
                          <span className="font-mono font-semibold">{data.median?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Q3:</span>
                          <span className="font-mono font-semibold">{data.q3?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Máximo:</span>
                          <span className="font-mono font-semibold">{data.max?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Media:</span>
                          <span className="font-mono font-semibold text-red-500">{data.mean?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )
                }}
              />
              
              {/* Boxplot usando barras apiladas */}
              <Bar dataKey="min" stackId="boxplot" fill="transparent" />
              <Bar dataKey="q1" stackId="boxplot" fill="hsl(199, 89%, 48%, 0.8)" />
              <Bar dataKey="median" stackId="boxplot" fill="hsl(199, 89%, 48%, 0.6)" />
              <Bar dataKey="q3" stackId="boxplot" fill="hsl(199, 89%, 48%, 0.4)" />
              <Bar dataKey="max" stackId="boxplot" fill="hsl(199, 89%, 48%, 0.2)" />
              
              {/* Línea de media */}
              <Line 
                type="monotone" 
                dataKey="mean" 
                stroke="hsl(346, 77%, 50%)" 
                strokeWidth={3}
                dot={{ fill: "hsl(346, 77%, 50%)", r: 5 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla de estadísticas */}
      {selectedData && (
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Estadísticas Descriptivas
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Media:</span>
              <span className="ml-2 font-mono font-semibold">{selectedData.mean?.toFixed(2) || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Desv. estándar:</span>
              <span className="ml-2 font-mono">{selectedData.std?.toFixed(2) || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Mínimo:</span>
              <span className="ml-2 font-mono">{selectedData.min?.toFixed(2) || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Máximo:</span>
              <span className="ml-2 font-mono">{selectedData.max?.toFixed(2) || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Q1:</span>
              <span className="ml-2 font-mono">{selectedData.q1?.toFixed(2) || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Mediana:</span>
              <span className="ml-2 font-mono">{selectedData.median?.toFixed(2) || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Q3:</span>
              <span className="ml-2 font-mono">{selectedData.q3?.toFixed(2) || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Completitud:</span>
              <span className="ml-2 font-mono font-semibold" style={{ 
                color: selectedData.valid_percentage > 90 ? "hsl(160, 84%, 39%)" : 
                       selectedData.valid_percentage >= 70 ? "hsl(35, 92%, 53%)" : 
                       "hsl(346, 77%, 50%)"
              }}>
                {selectedData.valid_percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
