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

export function NumericBoxplot({ variables, title = "Variables Numéricas" }: NumericBoxplotProps) {
  // Procesar variables
  const processedData = useMemo(() => {
    console.log('Variables recibidas en boxplot:', variables)
    console.log('Tipo de variables:', typeof variables)
    console.log('Longitud:', variables?.length)
    
    if (!variables || !Array.isArray(variables)) {
      console.log('No hay variables o no es array')
      return []
    }
    
    const filtered = variables.filter((variable) => {
      const isValid = variable && 
        typeof variable === 'object' && 
        variable.variable &&
        variable.dtype === 'numeric'
      console.log('Variable filtrada:', variable?.variable, 'dtype:', variable?.dtype, 'válida:', isValid)
      return isValid
    })
    
    console.log('Variables filtradas:', filtered.length)
    
    const mapped = filtered.map((variable) => {
      const processed = {
        id: variable.variable,
        name: variable.variable,
        label: variable.variable_label || variable.variable,
        min: Number(variable.min) || 0,
        q1: Number(variable.q1) || 0,
        median: Number(variable.median) || 0,
        q3: Number(variable.q3) || 0,
        max: Number(variable.max) || 0,
        mean: Number(variable.mean) || 0,
        std: Number(variable.std) || 0,
        valid_percentage: Number(variable.valid_percentage) || 0,
      }
      console.log('Variable procesada:', processed)
      return processed
    })
    
    console.log('Datos finales procesados:', mapped)
    return mapped
  }, [variables])

  if (processedData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No hay variables numéricas disponibles
        </div>
      </div>
    )
  }

  // Componente individual para cada boxplot
  const SingleBoxplot = ({ data }: { data: any }) => {
    console.log('SingleBoxplot data:', data)
    
    // Datos para el boxplot - asegurar que todos los valores sean números válidos
    const boxplotData = [
      { name: 'Mínimo', value: Number(data.min) || 0 },
      { name: 'Q1', value: Number(data.q1) || 0 },
      { name: 'Mediana', value: Number(data.median) || 0 },
      { name: 'Q3', value: Number(data.q3) || 0 },
      { name: 'Máximo', value: Number(data.max) || 0 },
      { name: 'Media', value: Number(data.mean) || 0 }
    ]
    
    console.log('BoxplotData:', boxplotData)

    return (
      <div className="mb-8 last:mb-0">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-foreground">
            {data.label}
          </h4>
          <p className="text-xs text-muted-foreground">
            Completitud: {data.valid_percentage.toFixed(1)}% | 
            Media: {data.mean?.toFixed(2)} | 
            Rango: {data.min?.toFixed(2)} - {data.max?.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="relative">
            {/* Escala del eje X */}
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{data.min?.toFixed(0)}</span>
              <span>{data.max?.toFixed(0)}</span>
            </div>
            
            {/* Boxplot principal */}
            <div className="relative h-12 bg-background rounded border border-border">
              {/* Línea desde mínimo hasta máximo */}
              <div 
                className="absolute top-1/2 h-0.5 bg-gray-400 -translate-y-1/2"
                style={{
                  left: `${((data.min - data.min) / (data.max - data.min)) * 100}%`,
                  width: `${((data.max - data.min) / (data.max - data.min)) * 100}%`
                }}
              />
              
              {/* Caja principal (Q1 a Q3) */}
              <div 
                className="absolute top-2 bottom-2 bg-blue-500 rounded"
                style={{
                  left: `${((data.q1 - data.min) / (data.max - data.min)) * 100}%`,
                  width: `${((data.q3 - data.q1) / (data.max - data.min)) * 100}%`
                }}
              />
              
              {/* Línea de la mediana */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                style={{
                  left: `${((data.median - data.min) / (data.max - data.min)) * 100}%`
                }}
              />
              
              {/* Línea de la media */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-600"
                style={{
                  left: `${((data.mean - data.min) / (data.max - data.min)) * 100}%`
                }}
              />
              
              {/* Bigotes (líneas desde Q1 a mínimo y desde Q3 a máximo) */}
              <div 
                className="absolute top-1/2 h-0.5 bg-gray-600 -translate-y-1/2"
                style={{
                  left: `${((data.min - data.min) / (data.max - data.min)) * 100}%`,
                  width: `${((data.q1 - data.min) / (data.max - data.min)) * 100}%`
                }}
              />
              <div 
                className="absolute top-1/2 h-0.5 bg-gray-600 -translate-y-1/2"
                style={{
                  left: `${((data.q3 - data.min) / (data.max - data.min)) * 100}%`,
                  width: `${((data.max - data.q3) / (data.max - data.min)) * 100}%`
                }}
              />
              
              {/* Marcadores de valores */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs">
                <span className="text-blue-600 font-semibold">Min</span>
                <span className="text-blue-400">Q1</span>
                <span className="text-red-500 font-semibold">Med</span>
                <span className="text-blue-400">Q3</span>
                <span className="text-blue-600 font-semibold">Max</span>
                <span className="text-red-600 font-semibold">Media</span>
              </div>
            </div>
            
            {/* Valores exactos */}
            <div className="flex justify-between text-xs text-muted-foreground mt-8">
              <span>{data.min?.toFixed(1)}</span>
              <span>{data.q1?.toFixed(1)}</span>
              <span>{data.median?.toFixed(1)}</span>
              <span>{data.q3?.toFixed(1)}</span>
              <span>{data.max?.toFixed(1)}</span>
              <span className="text-red-500">{data.mean?.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        {/* Estadísticas rápidas debajo del gráfico */}
        <div className="grid grid-cols-5 gap-2 text-xs mt-2">
          <div className="text-center">
            <span className="text-muted-foreground">Min:</span>
            <span className="ml-1 font-mono">{data.min?.toFixed(1)}</span>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground">Q1:</span>
            <span className="ml-1 font-mono">{data.q1?.toFixed(1)}</span>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground">Med:</span>
            <span className="ml-1 font-mono">{data.median?.toFixed(1)}</span>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground">Q3:</span>
            <span className="ml-1 font-mono">{data.q3?.toFixed(1)}</span>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground">Max:</span>
            <span className="ml-1 font-mono">{data.max?.toFixed(1)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Boxplots de variables numéricas ({processedData.length} variables)
        </p>
      </div>

      {/* Todos los boxplots uno debajo de otro */}
      <div className="space-y-4">
        {processedData.map((variable) => (
          <SingleBoxplot key={variable.id} data={variable} />
        ))}
      </div>
    </div>
  )
}
