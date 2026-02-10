// Simulated dataframe data for a data science dashboard
// This represents a typical dataset you might encounter in EDA (Exploratory Data Analysis)

export interface DataFrameColumn {
  name: string
  dtype: "numeric" | "categorical" | "boolean" | "datetime"
  totalRows: number
  nonNullCount: number
  nullCount: number
  nullPercentage: number
  validPercentage: number
  // Numeric stats
  min?: number
  q1?: number
  median?: number
  q3?: number
  max?: number
  mean?: number
  std?: number
  // Categorical stats
  categories?: { name: string; count: number }[]
}

export interface DataFrame {
  name: string
  totalRows: number
  totalColumns: number
  columns: DataFrameColumn[]
}

// Sample demographic / health dataset
export const sampleDataFrame: DataFrame = {
  name: "encuesta_demografica_2024",
  totalRows: 15420,
  totalColumns: 18,
  columns: [
    {
      name: "Edad",
      dtype: "numeric",
      totalRows: 15420,
      nonNullCount: 15210,
      nullCount: 210,
      nullPercentage: 1.36,
      validPercentage: 98.64,
      min: 18,
      q1: 28,
      median: 38,
      q3: 52,
      max: 89,
      mean: 40.2,
      std: 14.6,
    },
    {
      name: "Ingreso_Mensual",
      dtype: "numeric",
      totalRows: 15420,
      nonNullCount: 12850,
      nullCount: 2570,
      nullPercentage: 16.67,
      validPercentage: 83.33,
      min: 450,
      q1: 1200,
      median: 2100,
      q3: 3800,
      max: 25000,
      mean: 2890,
      std: 2450,
    },
    {
      name: "Horas_Trabajo_Semanal",
      dtype: "numeric",
      totalRows: 15420,
      nonNullCount: 14900,
      nullCount: 520,
      nullPercentage: 3.37,
      validPercentage: 96.63,
      min: 0,
      q1: 20,
      median: 40,
      q3: 48,
      max: 80,
      mean: 38.5,
      std: 12.3,
    },
    {
      name: "Indice_Masa_Corporal",
      dtype: "numeric",
      totalRows: 15420,
      nonNullCount: 13200,
      nullCount: 2220,
      nullPercentage: 14.4,
      validPercentage: 85.6,
      min: 15.5,
      q1: 21.2,
      median: 25.8,
      q3: 30.4,
      max: 48.9,
      mean: 26.1,
      std: 5.8,
    },
    {
      name: "Presion_Arterial",
      dtype: "numeric",
      totalRows: 15420,
      nonNullCount: 11800,
      nullCount: 3620,
      nullPercentage: 23.48,
      validPercentage: 76.52,
      min: 80,
      q1: 110,
      median: 125,
      q3: 140,
      max: 200,
      mean: 126.8,
      std: 18.5,
    },
    {
      name: "Nivel_Glucosa",
      dtype: "numeric",
      totalRows: 15420,
      nonNullCount: 10500,
      nullCount: 4920,
      nullPercentage: 31.91,
      validPercentage: 68.09,
      min: 60,
      q1: 85,
      median: 99,
      q3: 126,
      max: 350,
      mean: 110.4,
      std: 35.2,
    },
    {
      name: "Anios_Educacion",
      dtype: "numeric",
      totalRows: 15420,
      nonNullCount: 15100,
      nullCount: 320,
      nullPercentage: 2.08,
      validPercentage: 97.92,
      min: 0,
      q1: 6,
      median: 11,
      q3: 16,
      max: 22,
      mean: 11.4,
      std: 4.5,
    },
    {
      name: "Puntuacion_Satisfaccion",
      dtype: "numeric",
      totalRows: 15420,
      nonNullCount: 14200,
      nullCount: 1220,
      nullPercentage: 7.91,
      validPercentage: 92.09,
      min: 1,
      q1: 4,
      median: 6,
      q3: 8,
      max: 10,
      mean: 5.9,
      std: 2.3,
    },
    {
      name: "Afiliacion",
      dtype: "categorical",
      totalRows: 15420,
      nonNullCount: 15000,
      nullCount: 420,
      nullPercentage: 2.72,
      validPercentage: 97.28,
      categories: [
        { name: "Contributivo", count: 5800 },
        { name: "Subsidiado", count: 4200 },
        { name: "Especial", count: 2100 },
        { name: "No Afiliado", count: 1900 },
        { name: "Prepagada", count: 1000 },
      ],
    },
    {
      name: "Etnia",
      dtype: "categorical",
      totalRows: 15420,
      nonNullCount: 14800,
      nullCount: 620,
      nullPercentage: 4.02,
      validPercentage: 95.98,
      categories: [
        { name: "Mestizo", count: 7200 },
        { name: "Afrocolombiano", count: 2800 },
        { name: "Indigena", count: 2100 },
        { name: "Blanco", count: 1600 },
        { name: "Raizal", count: 700 },
        { name: "Palenquero", count: 400 },
      ],
    },
    {
      name: "Nivel_Educativo",
      dtype: "categorical",
      totalRows: 15420,
      nonNullCount: 15200,
      nullCount: 220,
      nullPercentage: 1.43,
      validPercentage: 98.57,
      categories: [
        { name: "Primaria", count: 3200 },
        { name: "Secundaria", count: 4800 },
        { name: "Tecnico", count: 2900 },
        { name: "Universitario", count: 2700 },
        { name: "Posgrado", count: 1600 },
      ],
    },
    {
      name: "Estado_Civil",
      dtype: "categorical",
      totalRows: 15420,
      nonNullCount: 15300,
      nullCount: 120,
      nullPercentage: 0.78,
      validPercentage: 99.22,
      categories: [
        { name: "Soltero", count: 4500 },
        { name: "Casado", count: 4100 },
        { name: "Union Libre", count: 3200 },
        { name: "Divorciado", count: 2100 },
        { name: "Viudo", count: 1400 },
      ],
    },
    {
      name: "Region",
      dtype: "categorical",
      totalRows: 15420,
      nonNullCount: 15400,
      nullCount: 20,
      nullPercentage: 0.13,
      validPercentage: 99.87,
      categories: [
        { name: "Andina", count: 5500 },
        { name: "Caribe", count: 3800 },
        { name: "Pacifica", count: 2600 },
        { name: "Orinoquia", count: 1800 },
        { name: "Amazonia", count: 1700 },
      ],
    },
    {
      name: "Genero",
      dtype: "categorical",
      totalRows: 15420,
      nonNullCount: 15380,
      nullCount: 40,
      nullPercentage: 0.26,
      validPercentage: 99.74,
      categories: [
        { name: "Femenino", count: 7900 },
        { name: "Masculino", count: 7200 },
        { name: "Otro", count: 280 },
      ],
    },
    {
      name: "Zona",
      dtype: "categorical",
      totalRows: 15420,
      nonNullCount: 15350,
      nullCount: 70,
      nullPercentage: 0.45,
      validPercentage: 99.55,
      categories: [
        { name: "Urbana", count: 10200 },
        { name: "Rural", count: 5150 },
      ],
    },
    {
      name: "Tiene_Empleo",
      dtype: "boolean",
      totalRows: 15420,
      nonNullCount: 14800,
      nullCount: 620,
      nullPercentage: 4.02,
      validPercentage: 95.98,
      categories: [
        { name: "Si", count: 9200 },
        { name: "No", count: 5600 },
      ],
    },
    {
      name: "Acceso_Internet",
      dtype: "boolean",
      totalRows: 15420,
      nonNullCount: 15100,
      nullCount: 320,
      nullPercentage: 2.08,
      validPercentage: 97.92,
      categories: [
        { name: "Si", count: 9800 },
        { name: "No", count: 5300 },
      ],
    },
    {
      name: "Fecha_Registro",
      dtype: "datetime",
      totalRows: 15420,
      nonNullCount: 15420,
      nullCount: 0,
      nullPercentage: 0,
      validPercentage: 100,
    },
  ],
}

export function getNumericColumns(df: DataFrame): DataFrameColumn[] {
  return df.columns.filter((col) => col.dtype === "numeric")
}

export function getCategoricalColumns(df: DataFrame): DataFrameColumn[] {
  return df.columns.filter(
    (col) => col.dtype === "categorical" || col.dtype === "boolean"
  )
}

export function getAllColumns(df: DataFrame): DataFrameColumn[] {
  return df.columns
}
