"use client"

import { useMemo, useRef, useState } from "react"

interface NumericBoxplotProps {
  variables: any[]
  title?: string
}

export function NumericBoxplot({ variables, title = "Variables Numéricas" }: NumericBoxplotProps) {
  const exportRef = useRef<HTMLDivElement | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPng = async () => {
    if (!exportRef.current || isExporting) return
    setIsExporting(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      })

      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = `variables-numericas-${new Date().toISOString().slice(0, 10)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setIsExporting(false)
    }
  }

  // Procesar variables
  const processedData = useMemo(() => {
    if (!variables || !Array.isArray(variables)) {
      return []
    }
    
    return variables
      .filter((variable) => 
        variable && 
        typeof variable === 'object' && 
        variable.variable &&
        variable.dtype === 'numeric'
      )
      .map((variable) => ({
        label: variable.variable_label || variable.variable,
        min: Number(variable.min) || 0,
        q1: Number(variable.q1) || 0,
        median: Number(variable.median) || 0,
        q3: Number(variable.q3) || 0,
        max: Number(variable.max) || 0,
        mean: Number(variable.mean) || 0,
        std: Number(variable.std) || 0,
        valid_percentage: Number(variable.valid_percentage) || 0,
      }))
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
    const iqr = Number(data.q3) - Number(data.q1)
    const lowerBound = Number(data.q1) - 1.5 * iqr
    const upperBound = Number(data.q3) + 1.5 * iqr

    const whiskerMin = Number.isFinite(lowerBound) ? Math.max(Number(data.min), lowerBound) : Number(data.min)
    const whiskerMax = Number.isFinite(upperBound) ? Math.min(Number(data.max), upperBound) : Number(data.max)

    const axisMin = Number.isFinite(whiskerMin) ? whiskerMin : Number(data.min)
    const axisMax = Number.isFinite(whiskerMax) ? whiskerMax : Number(data.max)
    const axisRange = axisMax - axisMin

    const pct = (value: number) => {
      if (!Number.isFinite(value) || !Number.isFinite(axisMin) || !Number.isFinite(axisMax) || axisRange <= 0) {
        return 0
      }
      const raw = ((value - axisMin) / axisRange) * 100
      return Math.max(0, Math.min(100, raw))
    }

    const hasLowOutlier = Number(data.min) < axisMin
    const hasHighOutlier = Number(data.max) > axisMax

    return (
      <div className="mb-8 last:mb-0">
        {/* Nombre de la variable arriba del gráfico */}
        <div className="text-center mb-3">
          <h4 className="text-sm font-semibold text-foreground">
            {data.label.charAt(0).toUpperCase() + data.label.slice(1)}
          </h4>
        </div>
        
        <div className="bg-black/5 dark:bg-black/20 rounded-lg p-6">
          <div className="relative">
            {/* Contenedor más ancho para boxplot más corto */}
            <div className="w-1/2 mx-auto">
              <div className="relative">
            {/* Escala del eje X */}
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{data.min?.toFixed(1)}</span>
              <span>{data.max?.toFixed(1)}</span>
            </div>
            
            {/* Contenedor del boxplot horizontal */}
            <div className="relative w-full h-10 bg-black/30 dark:bg-black/50 rounded border border-border/50 group cursor-pointer">
              {/* Tooltip informativo */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-max">
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-foreground mb-2">{data.label.charAt(0).toUpperCase() + data.label.slice(1)}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mínimo:</span>
                      <span className="font-mono font-semibold">{data.min?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Q1:</span>
                      <span className="font-mono">{data.q1?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-600 font-semibold">Mediana:</span>
                      <span className="font-mono text-purple-600">{data.median?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-500 font-semibold">Media:</span>
                      <span className="font-mono text-blue-500">{data.mean?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Q3:</span>
                      <span className="font-mono">{data.q3?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Máximo:</span>
                      <span className="font-mono font-semibold">{data.max?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Std Dev:</span>
                      <span className="font-mono">{data.std?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completitud:</span>
                      <span className="font-mono">{data.valid_percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                {/* Flecha del tooltip */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-background border-r border-b border-border rotate-45"></div>
              </div>
              {/* Línea base (whisker completo de min a max) */}
              <div 
                className="absolute top-1/2 h-0.5 bg-gray-400 -translate-y-1/2"
                style={{
                  left: "0%",
                  width: "100%"
                }}
              />
              
              {/* Bigote izquierdo (min a Q1) - línea punteada */}
              <div 
                className="absolute top-1/2 h-1 bg-gray-600 -translate-y-1/2"
                style={{
                  left: `${pct(whiskerMin)}%`,
                  width: `${Math.max(0, pct(Number(data.q1)) - pct(whiskerMin))}%`,
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #4b5563 2px, #4b5563 4px)'
                }}
              />
              
              {/* Bigote derecho (Q3 a max) - línea punteada */}
              <div 
                className="absolute top-1/2 h-1 bg-gray-600 -translate-y-1/2"
                style={{
                  left: `${pct(Number(data.q3))}%`,
                  width: `${Math.max(0, pct(whiskerMax) - pct(Number(data.q3)))}%`,
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #4b5563 2px, #4b5563 4px)'
                }}
              />
              
              {/* Caja principal (Q1 a Q3) */}
              <div 
                className="absolute top-2 bottom-2 bg-blue-500/30 dark:bg-blue-500/20 rounded border border-blue-500/40"
                style={{
                  left: `${pct(Number(data.q1))}%`,
                  width: `${Math.max(0, pct(Number(data.q3)) - pct(Number(data.q1)))}%`
                }}
              />
              
              {/* Puntos de los extremos (outliers) */}
              {hasLowOutlier && (
                <div 
                  className="absolute top-1/2 w-3 h-3 bg-slate-700 rounded-full -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-lg"
                  style={{
                    left: "0%"
                  }}
                  title={`Outlier bajo: ${Number(data.min).toFixed(2)}`}
                />
              )}

              {hasHighOutlier && (
                <div 
                  className="absolute top-1/2 w-3 h-3 bg-slate-700 rounded-full -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-lg"
                  style={{
                    left: "100%"
                  }}
                  title={`Outlier alto: ${Number(data.max).toFixed(2)}`}
                />
              )}
              
              {/* Línea de la mediana (Q2) */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-purple-500"
                style={{
                  left: `${pct(Number(data.median))}%`
                }}
              />

              {/* Etiqueta flotante: Mediana */}
              <span
                className="absolute text-xs font-semibold text-purple-500"
                style={{
                  position: "absolute",
                  left: `${pct(Number(data.median))}%`,
                  top: "-18px",
                  transform: "translateX(-50%)",
                }}
              >
                Mediana
              </span>
              
              {/* Marcadores de posición */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs">
                <span className="text-slate-600 font-semibold">Min</span>
                <span 
                  className="text-slate-400"
                  style={{
                    position: 'absolute',
                    left: `${pct(Number(data.q1))}%`,
                    transform: 'translateX(-50%)'
                  }}
                >Q1</span>
                <span 
                  className="text-slate-400"
                  style={{
                    position: 'absolute',
                    left: `${pct(Number(data.q3))}%`,
                    transform: 'translateX(-50%)'
                  }}
                >Q3</span>
                <span className="text-slate-600 font-semibold">Max</span>
                              </div>
            </div>
            
            {/* Valores exactos */}
            <div className="relative mt-8 h-6 text-xs text-muted-foreground">
              <span className="absolute left-0">{axisMin.toFixed(1)}</span>
              <span className="absolute right-0">{axisMax.toFixed(1)}</span>

              <span
                className="absolute -translate-x-1/2"
                style={{ left: `${pct(Number(data.q1))}%` }}
              >
                {data.q1?.toFixed(1)}
              </span>

              <span
                className="absolute -translate-x-1/2"
                style={{ left: `${pct(Number(data.median))}%` }}
              >
                {data.median?.toFixed(1)}
              </span>

              <span
                className="absolute -translate-x-1/2"
                style={{ left: `${pct(Number(data.q3))}%` }}
              >
                {data.q3?.toFixed(1)}
              </span>

              {/* Ticks */}
              <div className="absolute left-0 top-0 h-2 w-px bg-border" />
              <div className="absolute left-full top-0 h-2 w-px bg-border" />
              <div
                className="absolute top-0 h-2 w-px bg-border"
                style={{ left: `${pct(Number(data.q1))}%` }}
              />
              <div
                className="absolute top-0 h-2 w-px bg-border"
                style={{ left: `${pct(Number(data.median))}%` }}
              />
              <div
                className="absolute top-0 h-2 w-px bg-border"
                style={{ left: `${pct(Number(data.q3))}%` }}
              />
            </div>
              </div>
            </div>
          </div>
          
          {/* Descripción abajo del gráfico */}
          <div className="text-center mt-4 pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              Completitud: {data.valid_percentage.toFixed(1)}% | 
              Mediana: {data.median?.toFixed(2)} | 
              Media: {data.mean?.toFixed(2)} | 
              Rango: {data.min?.toFixed(2)} - {data.max?.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={exportRef} className="rounded-xl border border-border bg-card p-5">
      <div className="mb-6 text-center">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Boxplots de variables numéricas ({processedData.length} variables)
        </p>

        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={handleExportPng}
            disabled={isExporting}
            className="rounded-md border border-border bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-background/60 disabled:opacity-50"
          >
            {isExporting ? "Exportando..." : "Exportar PNG"}
          </button>
        </div>
      </div>

      {/* Todos los boxplots */}
      <div className="space-y-2">
        {processedData.map((variable, index) => (
          <SingleBoxplot key={`${variable.label}-${index}`} data={variable} />
        ))}
      </div>

      {/* Tabla resumen */}
      <div className="mt-8 rounded-lg border border-border bg-secondary/30 p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Resumen de Estadísticas
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2">Variable</th>
                <th className="text-center py-2 px-1">Media</th>
                <th className="text-center py-2 px-1">Std</th>
                <th className="text-center py-2 px-1">Mín</th>
                <th className="text-center py-2 px-1">Q1</th>
                <th className="text-center py-2 px-1">Mediana</th>
                <th className="text-center py-2 px-1">Q3</th>
                <th className="text-center py-2 px-1">Máx</th>
                <th className="text-center py-2 px-1">Completitud</th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((variable, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2 px-2 font-mono text-xs max-w-xs truncate" title={variable.label}>
                    {variable.label}
                  </td>
                  <td className="text-center py-2 px-1 font-mono">{variable.mean?.toFixed(2)}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.std?.toFixed(2)}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.min?.toFixed(2)}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.q1?.toFixed(2)}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.median?.toFixed(2)}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.q3?.toFixed(2)}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.max?.toFixed(2)}</td>
                  <td className="text-center py-2 px-1">
                    <span 
                      className="font-mono font-semibold"
                      style={{ 
                        color: variable.valid_percentage > 90 ? "hsl(160, 84%, 39%)" : 
                               variable.valid_percentage >= 70 ? "hsl(35, 92%, 53%)" : 
                               "hsl(346, 77%, 50%)"
                      }}
                    >
                      {variable.valid_percentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
