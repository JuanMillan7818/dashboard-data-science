"use client"

import { useState } from "react"
import { BarChart3, BoxSelect, Radar, List } from "lucide-react"
import {
  sampleDataFrame,
  getNumericColumns,
  getCategoricalColumns,
} from "@/lib/dataframe-data"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { CompletenessBarChart } from "@/components/completeness-bar-chart"
import { BoxplotChart } from "@/components/boxplot-chart"
import { CategoryRadarChart } from "@/components/category-radar-chart"
import { VariableInspector } from "@/components/variable-inspector"

const NAV_ITEMS = [
  { id: "overview", label: "Resumen", icon: BarChart3 },
  { id: "distribution", label: "Distribucion", icon: BoxSelect },
  { id: "categorical", label: "Categoricas", icon: Radar },
  { id: "variables", label: "Variables", icon: List },
] as const

type Section = (typeof NAV_ITEMS)[number]["id"]

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>("overview")
  const df = sampleDataFrame
  const numericCols = getNumericColumns(df)
  const categoricalCols = getCategoricalColumns(df)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader dataframe={df} />

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-0 overflow-x-auto px-6">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <main className="p-6">
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

        {activeSection === "distribution" && (
          <div className="space-y-6">
            <StatsCards dataframe={df} />
            <BoxplotChart numericColumns={numericCols} />
          </div>
        )}

        {activeSection === "categorical" && (
          <div className="space-y-6">
            <StatsCards dataframe={df} />
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <CategoryRadarChart categoricalColumns={categoricalCols} />
              </div>
              <div>
                <VariableInspector columns={categoricalCols} />
              </div>
            </div>
          </div>
        )}

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
  )
}
