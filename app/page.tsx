"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, BoxSelect, Radar, List } from "lucide-react";
import { sampleDataFrame, getNumericColumns } from "@/lib/dataframe-data";
import { fetchDatasetInfo, fetchNumericStats } from "@/lib/api";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatsCards } from "@/components/stats-cards";
import { CompletenessBarChart } from "@/components/completeness-bar-chart";
import { NumericBoxplot } from "@/components/numeric-boxplot-native";
import { CategoricalView } from "@/components/categorical-view";
import { VariableInspector } from "@/components/variable-inspector";

const NAV_ITEMS = [
  { id: "overview", label: "Resumen", icon: BarChart3 },
  { id: "numeric", label: "Numéricas", icon: BoxSelect },
  { id: "categorical", label: "Categóricas", icon: Radar },
  { id: "variables", label: "Variables", icon: List },
] as const;

type Section = (typeof NAV_ITEMS)[number]["id"];

export default function DashboardPage() {
  /**
   * Estado para controlar la pestaña de sección actualmente activa.
   * Opciones: "overview" (Resumen), "distribution" (Distribución), "categorical" (Categóricas), "variables" (Variables).
   */
  const [activeSection, setActiveSection] = useState<Section>("overview");

  // Obtener datos dinámicos del dataset
  const { data: datasetInfo } = useQuery({
    queryKey: ["dataset-info"],
    queryFn: fetchDatasetInfo,
  });

  // Crear DataFrame dinámico con los datos de la API
  const df = datasetInfo
    ? {
        name: "Datos centenarios",
        totalRows: datasetInfo.total_rows,
        totalColumns: datasetInfo.total_variables,
        columns: [], // Se llenará dinámicamente según sea necesario
      }
    : sampleDataFrame;

  // Obtener variables numéricas de la API
  const { data: numericVars } = useQuery({
    queryKey: ["numeric-stats"],
    queryFn: fetchNumericStats,
  });

  const numericCols = numericVars || getNumericColumns(df);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader dataframe={df} />

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-0 overflow-x-auto px-6">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido Principal */}
      <main className="p-6">
        {/*
          Renderizado Condicional: Sección Resumen
          Se muestra cuando activeSection es "overview".
          Contiene tarjetas de estadísticas, gráfica de completitud e inspector de variables.
        */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            <StatsCards />
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <CompletenessBarChart />
              </div>
              <div>
                <VariableInspector />
              </div>
            </div>
          </div>
        )}

        {activeSection === "numeric" && (
          <div className="space-y-6">
            <NumericBoxplot variables={numericCols || []} />
          </div>
        )}

        {activeSection === "categorical" && <CategoricalView />}

        {activeSection === "variables" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <VariableInspector columns={df.columns} />
            <div className="space-y-6">
              <CompletenessBarChart columns={df.columns} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
