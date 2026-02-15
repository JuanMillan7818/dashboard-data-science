"use client"

import { useMemo } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { BoxPlotController } from "@sgratzl/chartjs-chart-boxplot"
import { Chart } from "react-chartjs-2"

// Extender los tipos de Chart.js para incluir boxandwhiskers
declare module "chart.js" {
  interface ChartTypeRegistry {
    boxandwhiskers: {
      chartOptions: any
      datasetType: any
      defaultDataPoint: any
      parsedDataType: any
      scales: {
        x: {
          type: CategoryScale
          min: number
          max: number
          labels: string[]
        }
        y: {
          type: LinearScale
          min: number
          max: number
        }
      }
    }
  }
}

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BoxPlotController,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface NumericBoxplotProps {
  variables: any[]
  title?: string
}

export function NumericBoxplot({ variables, title = "Variables Numéricas" }: NumericBoxplotProps) {
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

  // Preparar datos para Chart.js boxplot
  const chartData = {
    labels: processedData.map(v => v.label),
    datasets: [
      {
        label: 'Boxplot',
        data: processedData.map(v => ({
          min: v.min,
          q1: v.q1,
          median: v.median,
          q3: v.q3,
          max: v.max,
          mean: v.mean,
        })),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        outlierColor: '#ff0000',
        padding: 10,
        itemRadius: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const data = context.raw
            return [
              `Mínimo: ${data.min?.toFixed(2)}`,
              `Q1: ${data.q1?.toFixed(2)}`,
              `Mediana: ${data.median?.toFixed(2)}`,
              `Q3: ${data.q3?.toFixed(2)}`,
              `Máximo: ${data.max?.toFixed(2)}`,
              `Media: ${data.mean?.toFixed(2)}`,
            ]
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Variables',
          color: 'hsl(215, 20%, 55%)',
          font: {
            size: 12,
          },
        },
        ticks: {
          color: 'hsl(215, 20%, 55%)',
          font: {
            size: 10,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Valor',
          color: 'hsl(215, 20%, 55%)',
          font: {
            size: 12,
          },
        },
        ticks: {
          color: 'hsl(215, 20%, 55%)',
          font: {
            size: 10,
          },
        },
      },
    },
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Boxplots de variables numéricas ({processedData.length} variables)
        </p>
      </div>

      {/* Gráfico principal */}
      <div className="mb-6" style={{ height: `${Math.max(400, processedData.length * 30)}px` }}>
        <Chart type="boxandwhiskers" data={chartData} options={options} />
      </div>

      {/* Tabla de estadísticas */}
      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Estadísticas Descriptivas
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
                <tr key={index} className="border-b border-border/50">
                  <td className="py-2 px-2 font-mono text-xs" title={variable.label}>
                    {variable.label.length > 15 ? variable.label.substring(0, 15) + '...' : variable.label}
                  </td>
                  <td className="text-center py-2 px-1 font-mono">{variable.mean?.toFixed(2) || 'N/A'}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.std?.toFixed(2) || 'N/A'}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.min?.toFixed(2) || 'N/A'}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.q1?.toFixed(2) || 'N/A'}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.median?.toFixed(2) || 'N/A'}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.q3?.toFixed(2) || 'N/A'}</td>
                  <td className="text-center py-2 px-1 font-mono">{variable.max?.toFixed(2) || 'N/A'}</td>
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
