"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CategoricalVariableStats } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface CategoricalValueDistributionChartProps {
  data: CategoricalVariableStats;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: any }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
      <p className="mb-2 text-sm font-semibold text-foreground">{data.value}</p>
      <div className="grid gap-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Frecuencia:</span>
          <span className="font-mono font-medium text-foreground">
            {data.count.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Porcentaje:</span>
          <span
            className="font-mono font-medium"
            style={{ color: "hsl(160, 84%, 39%)" }}
          >
            {data.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function CategoricalValueDistributionChart({
  data,
}: CategoricalValueDistributionChartProps) {
  // Ordenar datos por conteo descendente para mejor visualización
  // Mapear 'value' a 'categoryLabel' para evitar conflictos con palabras reservadas o tipos
  const chartData = [...data.top_values]
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      ...item,
      // Usar label si existe, si no usar value
      categoryLabel: item.value,
      categoryCount: item.count,
    }));

  // Calcular la altura basada en el número de categorías (mínimo 150px, máximo 400px o más si son muchas)
  // Cada barra ~30px + padding
  const chartHeight = Math.max(200, Math.min(500, chartData.length * 40 + 60));

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col h-full">
      <div className="mb-4 flex-none">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              {data.variable}
              {data.valid_percentage !== undefined && (
                <Badge
                  variant="outline"
                  className={`ml-2 text-xs border-transparent ${
                    data.valid_percentage > 90
                      ? "bg-green-500/10 text-green-500"
                      : data.valid_percentage > 70
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {data.valid_percentage.toFixed(0)}% completitud
                </Badge>
              )}
            </h3>
            {data.variable_label && (
              <p
                className="text-xs text-muted-foreground line-clamp-1 mt-1"
                title={data.variable_label}
              >
                {data.variable_label}
              </p>
            )}
          </div>
          <div className="text-xs text-muted-foreground text-right">
            <div>
              Total:{" "}
              {data?.top_values
                ?.reduce((acc, item) => acc + item?.count, 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Legend / Category Definitions */}
      {data.categories && data.categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
          {data.categories.map((cat, idx) => (
            <div
              key={`${cat.code}-${idx}`}
              className="text-xs bg-muted/50 rounded-md px-2 py-1 flex items-center gap-1.5 border border-border/50"
              title={`${cat.code} - ${cat.value}`}
            >
              <span className="font-mono font-bold text-primary/80">
                {cat.code}
              </span>
              <span className="text-muted-foreground">-</span>
              <span className="text-muted-foreground truncate max-w-[150px]">
                {cat.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {chartData.length > 0 ? (
        <div className="w-full min-h-0" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              barCategoryGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="hsl(222, 47%, 14%)"
              />
              <XAxis
                type="number"
                tickFormatter={(v: number) => `${v}`}
                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
                axisLine={{ stroke: "hsl(222, 47%, 14%)" }}
                tickLine={{ stroke: "hsl(222, 47%, 14%)" }}
              />
              <YAxis
                type="category"
                dataKey="categoryLabel"
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={-6}
                      y={0}
                      dy={3}
                      textAnchor="end"
                      fill="hsl(210, 40%, 96%)"
                      fontSize={11}
                      className="text-[11px]"
                    >
                      {payload.value.length > 28
                        ? `${payload.value.substring(0, 28)}...`
                        : payload.value}
                    </text>
                  </g>
                )}
                axisLine={{ stroke: "hsl(222, 47%, 14%)" }}
                tickLine={false}
                interval={0}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsla(222, 47%, 14%, 0.5)" }}
              />
              <Bar
                dataKey="categoryCount"
                radius={[0, 4, 4, 0]}
                maxBarSize={20}
                fill="hsl(199, 89%, 48%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground h-32">
          Sin datos para mostrar
        </div>
      )}
    </div>
  );
}
