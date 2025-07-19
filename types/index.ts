export enum Environment {
  DEV = "DEV",
  UAT = "UAT",
  PERF = "PERF",
  PROD = "PROD",
}

export enum Cluster {
  // DEV
  GT1DEV1 = "GT1DEV1",
  GT1DEV3 = "GT1DEV3",
  SW1DEV1 = "SW1DEV1",
  SW1DEV3 = "SW1DEV3",
  // UAT
  GT1UAT1 = "GT1UAT1",
  GT1UAT2 = "GT1UAT2",
  SW1UAT1 = "SW1UAT1",
  // PERF
  GT1PERF1 = "GT1PERF1",
  SW1PERF1 = "SW1PERF1",
  // PROD
  GT1PROD1 = "GT1PROD1",
  PROD1 = "PROD1",
  PROD2 = "PROD2",
  SW1PROD1 = "SW1PROD1",
}

export enum ConfigTabType {
  Spring = "Spring",
  Database = "Database",
  Mongo = "Mongo",
  Solace = "Solace",
  MDM = "MDM",
}

export interface Microservice {
  id: string
  name: string
  type: string
  environments: Partial<Record<Environment, Cluster[]>>
  repository?: string
  createdAt?: string
  updatedAt?: string
  lightspeed?: string
}

export interface ConfigFile {
  tabs?: ConfigTabType[]
  [tabName: string]: TabProperties | ConfigTabType[] | undefined
}

export interface TabProperties {
  [key: string]: string | number | boolean
}

export interface SelectedConfig {
  selectedTabs: ConfigTabType[]
  selectedClusters: Partial<Record<Environment, Cluster[]>>
  configValues: Record<ConfigTabType, TabProperties>
}

export const ENVIRONMENT_CLUSTERS: Record<Environment, Cluster[]> = {
  [Environment.DEV]: [Cluster.GT1DEV1, Cluster.GT1DEV3, Cluster.SW1DEV1, Cluster.SW1DEV3],
  [Environment.UAT]: [Cluster.GT1UAT1, Cluster.GT1UAT2, Cluster.SW1UAT1],
  [Environment.PERF]: [Cluster.GT1PERF1, Cluster.SW1PERF1],
  [Environment.PROD]: [Cluster.GT1PROD1, Cluster.PROD1, Cluster.PROD2, Cluster.SW1PROD1],
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
