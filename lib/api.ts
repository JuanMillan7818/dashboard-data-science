const API_URL = "http://localhost:8000/api/v1";

export interface Category {
  code: string;
  value: string;
}

export interface Variable {
  variable: string;
  variable_label: string | null;
  dtype: string;
  categories?: Category[];
  keywords?: string[];
  valid_percentage?: number;
  null_count?: number;
  non_null_count?: number;
  total_rows?: number;
}

export interface VariableListResponse {
  items: Variable[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}

export interface CompletenessItem {
  variable: string;
  valid_percentage: number;
  null_count: number;
  non_null_count: number;
  total_rows: number;
  dtype: string;
}

export interface CompletenessResponse {
  items: CompletenessItem[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}

export interface StatsItem {
  label: string;
  value: number;
  type: string;
}

export interface StatsResponse {
  stats: StatsItem[];
  total_variables: number;
  completeness: number;
}

export interface CategoryStat {
  value: string;
  label?: string;
  count: number;
  percentage: number;
}

export interface CategoricalVariableStats {
  variable: string;
  variable_label: string | null;
  total_rows: number;
  valid_percentage: number;
  top_values: CategoryStat[];
  categories?: Category[];
}

export interface CategoricalStatsResponse {
  items: CategoricalVariableStats[];
  total: number;
  page: number;
  size: number;
  has_more: boolean;
}

export interface DatasetInfo {
  total_variables: number;
  total_rows: number;
  columns: string[];
}

// ... existing fetchVariables ...

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_URL}/graph/stats`);
  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }
  return res.json();
}

export async function fetchVariables({
  pageParam = 1,
  search = "",
}: {
  pageParam?: number;
  search?: string;
}): Promise<VariableListResponse> {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    size: "20",
  });
  if (search) {
    params.append("search", search);
  }

  const res = await fetch(`${API_URL}/graph/variables?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch variables");
  }
  return res.json();
}

export async function fetchCompleteness({
  pageParam = 1,
  size = 20,
  dtype = "all",
}: {
  pageParam?: number;
  size?: number;
  dtype?: string;
} = {}): Promise<CompletenessResponse> {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    size: size.toString(),
  });

  // Usar el endpoint /graph/variables que tiene los datos de completitud
  // Sin el parámetro dtype para evitar errores
  const res = await fetch(`${API_URL}/graph/variables?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch completeness stats");
  }
  return res.json();
}

export async function fetchDatasetInfo(): Promise<DatasetInfo> {
  const res = await fetch(`${API_URL}/graph/dataset/info`);
  if (!res.ok) {
    throw new Error("Failed to fetch dataset info");
  }
  return res.json();
}

export async function fetchNumericStats(): Promise<any[]> {
  const res = await fetch(`${API_URL}/graph/numeric/stats`);
  if (!res.ok) {
    throw new Error("Failed to fetch numeric stats");
  }
  const data = await res.json();
  return data.variables || [];
}

export async function fetchCategoricalStats({
  pageParam = 1,
  search = "",
}: {
  pageParam?: number;
  search?: string;
}): Promise<CategoricalStatsResponse> {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    size: "20",
  });
  if (search) {
    params.append("search", search);
  }

  const res = await fetch(`${API_URL}/categorical/?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch categorical stats");
  }
  return res.json();
}
