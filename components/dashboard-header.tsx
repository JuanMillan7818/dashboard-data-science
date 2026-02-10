"use client"

import { Database, BarChart3, Table2 } from "lucide-react"
import type { DataFrame } from "@/lib/dataframe-data"
import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  dataframe: DataFrame
}

export function DashboardHeader({ dataframe }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              DataScope
            </h1>
            <p className="text-sm text-muted-foreground">
              Analisis Exploratorio de Datos
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Table2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">DataFrame:</span>
            <span className="text-sm font-medium text-foreground font-mono">
              {dataframe.name}
            </span>
          </div>
          <Badge variant="secondary" className="gap-1.5 bg-secondary text-secondary-foreground">
            <BarChart3 className="h-3 w-3" />
            {dataframe.totalRows.toLocaleString()} filas
          </Badge>
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            {dataframe.totalColumns} columnas
          </Badge>
        </div>
      </div>
    </header>
  )
}
