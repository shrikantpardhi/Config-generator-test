"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, Download, Home, AlertCircle } from "lucide-react"
import { ConfigEditor } from "@/components/config-editor" // Assuming this component exists
import { generateZip } from "@/lib/zip-generator" // Assuming this utility exists

// --- Updated Type Definitions (as per your provided data) ---
import { Microservice, ConfigFile, Environment, Cluster, ConfigTabType } from "@/types" // Ensure these are correctly imported from your types file

// --- Embedded Data for Demo (Replace with API fetch in real app) ---
const appData = {
  "microservices": [
    {
      "id": "user-svc-001",
      "name": "User Service",
      "type": "Spring Boot",
      "environments": {
        "DEV": ["GT1DEV1", "SW1DEV1"],
        "UAT": ["GT1UAT1"],
        "PROD": ["PROD1"]
      },
      "repository": "https://github.com/company/user-service",
      "createdAt": "2023-01-15",
      "lightspeed": "LS-USER-001"
    },
    {
      "id": "order-svc-002",
      "name": "Order Service",
      "type": "Spring Boot",
      "environments": {
        "DEV": ["GT1DEV3", "SW1DEV3"],
        "UAT": ["GT1UAT2"],
        "PERF": ["GT1PERF1"],
        "PROD": ["PROD2"]
      },
      "repository": "https://github.com/company/order-service",
      "createdAt": "2023-02-20",
      "lightspeed": "LS-ORDER-002"
    },
    {
      "id": "payment-svc-003",
      "name": "Payment Service",
      "type": "Node.js",
      "environments": {
        "DEV": ["SW1DEV1"],
        "PROD": ["SW1PROD1"]
      },
      "repository": "https://github.com/company/payment-service",
      "createdAt": "2023-03-10",
      "lightspeed": "LS-PAYMENT-003"
    },
    {
      "id": "inventory-svc-004",
      "name": "Inventory Service",
      "type": "Spring Boot",
      "environments": {
        "DEV": ["GT1DEV1", "GT1DEV3"],
        "UAT": ["SW1UAT1"],
        "PROD": ["GT1PROD1"]
      },
      "repository": "https://github.com/company/inventory-service",
      "createdAt": "2023-01-30",
      "lightspeed": "LS-INVENTORY-004"
    },
    {
      "id": "notification-svc-005",
      "name": "Notification Service",
      "type": "Python",
      "environments": {
        "DEV": ["SW1DEV3"],
        "PROD": ["PROD1", "PROD2"]
      },
      "repository": "https://github.com/company/notification-service",
      "createdAt": "2023-04-05",
      "lightspeed": "LS-NOTIFICATION-005"
    },
    {
      "id": "reporting-svc-006",
      "name": "Reporting Service",
      "type": "Spring Boot",
      "environments": {
        "DEV": ["GT1DEV1"],
        "UAT": ["GT1UAT1", "GT1UAT2"],
        "PERF": ["SW1PERF1"]
      },
      "repository": "https://github.com/company/reporting-service",
      "createdAt": "2023-05-12",
      "lightspeed": "LS-REPORTING-006"
    },
    {
      "id": "auth-svc-007",
      "name": "Auth Service",
      "type": "Go",
      "environments": {
        "DEV": ["SW1DEV1"],
        "UAT": ["SW1UAT1"],
        "PROD": ["SW1PROD1"]
      },
      "repository": "https://github.com/company/auth-service",
      "createdAt": "2023-02-28",
      "lightspeed": "LS-AUTH-007"
    },
    {
      "id": "search-svc-008",
      "name": "Search Service",
      "type": "Node.js",
      "environments": {
        "DEV": ["GT1DEV3"],
        "PROD": ["PROD1"]
      },
      "repository": "https://github.com/company/search-service",
      "createdAt": "2023-06-18",
      "lightspeed": "LS-SEARCH-008"
    },
    {
      "id": "analytics-svc-009",
      "name": "Analytics Service",
      "type": "Python",
      "environments": {
        "DEV": ["GT1DEV1", "SW1DEV1"],
        "PERF": ["GT1PERF1"],
        "PROD": ["PROD2"]
      },
      "repository": "https://github.com/company/analytics-service",
      "createdAt": "2023-03-22",
      "lightspeed": "LS-ANALYTICS-009"
    },
    {
      "id": "gateway-svc-010",
      "name": "API Gateway",
      "type": "Spring Cloud Gateway",
      "environments": {
        "DEV": ["GT1DEV1", "SW1DEV1", "SW1DEV3"],
        "UAT": ["GT1UAT1", "SW1UAT1"],
        "PROD": ["PROD1", "SW1PROD1"]
      },
      "repository": "https://github.com/company/api-gateway",
      "createdAt": "2023-01-05",
      "lightspeed": "LS-GATEWAY-010"
    }
  ],
  "configurations": {
    "user-svc-001": {
      "tabs": [ConfigTabType.Spring, ConfigTabType.Database, ConfigTabType.MDM],
      "Spring": {
        "server.port": 8080,
        "spring.application.name": "user-service",
        "spring.datasource.url": "jdbc:postgresql://user-db:5432/users"
      },
      "Database": {
        "db.pool.size": 10,
        "db.migration.enabled": true
      },
      "MDM": {
        "mdm.endpoint": "http://mdm-service:8080",
        "mdm.cache.ttl": 3600
      }
    },
    "order-svc-002": {
      "tabs": [ConfigTabType.Spring, ConfigTabType.Database, ConfigTabType.Solace],
      "Spring": {
        "server.port": 8082,
        "spring.application.name": "order-service"
      },
      "Database": {
        "db.url": "jdbc:oracle:thin:@order-db:1521/ORCL",
        "db.schema": "order_schema"
      },
      "Solace": {
        "solace.host": "smf://solace-server:55555",
        "solace.vpn": "order-vpn"
      }
    },
    "payment-svc-003": {
      "tabs": [ConfigTabType.Mongo, ConfigTabType.Solace], // Added tabs array for consistency
      "Mongo": {
        "mongo.uri": "mongodb://payment-db:27017",
        "mongo.database": "payment_db"
      },
      "Solace": {
        "solace.queue": "PAYMENT.INBOUND"
      }
    },
    // Adding other microservices' configurations for completeness, based on "sampleConfigs"
    "inventory-svc-004": {
      "tabs": [ConfigTabType.Spring, ConfigTabType.Database],
      "Spring": { "spring.application.name": "inventory-service" },
      "Database": { "db.name": "inventory_db" }
    },
    "notification-svc-005": {
      "tabs": [ConfigTabType.Database, ConfigTabType.Spring], // Assuming these are ConfigTabTypes
      "Flask": { "DEBUG": true },
      "SMTP": { "smtp.host": "smtp.example.com" }
    },
    "reporting-svc-006": {
      "tabs": [ConfigTabType.Spring, ConfigTabType.Database],
      "Spring": { "spring.application.name": "reporting-service" },
      "Database": { "db.name": "reporting_db" }
    },
    "auth-svc-007": {
      "tabs": [ConfigTabType.Database],
      "Database": { "db.name": "auth_db" }
    },
    "search-svc-008": {
      "tabs": [ConfigTabType.Mongo],
      "Mongo": { "mongo.collection": "search_data" }
    },
    "analytics-svc-009": {
      "tabs": [ConfigTabType.Spring, ConfigTabType.Database],
      "Spring": { "spring.application.name": "analytics-service" },
      "Database": { "db.name": "analytics_db" }
    },
    "gateway-svc-010": {
      "tabs": [ConfigTabType.Spring, ConfigTabType.MDM],
      "Spring": {
        "server.port": 8090,
        "spring.application.name": "api-gateway",
        "spring.cloud.gateway.routes": "file:/config/routes.json"
      },
      "MDM": {
        "mdm.validation.enabled": true,
        "mdm.cache.size": 10000
      }
    }
  }
};


export default function MicroserviceDetails() {
  const params = useParams()
  const serviceId = params.id as string

  const [microservice, setMicroservice] = useState<Microservice | null>(null)
  const [config, setConfig] = useState<ConfigFile | null>(null)
  // selectedEnvironments will store Environment enum values (DEV, UAT, PROD, etc.)
  const [selectedEnvironments, setSelectedEnvironments] = useState<Environment[]>([])
  const [enabledTabs, setEnabledTabs] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<ConfigTabType | string>("") // Use ConfigTabType for activeTab
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      debugger
      // Initialize localStorage with appData if it's empty
      if (!localStorage.getItem("microservices")) {
        localStorage.setItem("microservices", JSON.stringify(appData.microservices));
      }
      Object.entries(appData.configurations).forEach(([id, configData]) => {
        if (!localStorage.getItem(`config-${id}`)) {
          localStorage.setItem(`config-${id}`, JSON.stringify(configData));
        }
      });

      // Load microservice data
      const storedMicroservices = localStorage.getItem("microservices")
      if (storedMicroservices) {
        const services: Microservice[] = JSON.parse(storedMicroservices)
        const service = services.find((s) => s.id === serviceId)
        if (service) {
          setMicroservice(service)
          // Initialize selectedEnvironments based on the microservice's environments
          setSelectedEnvironments(Object.keys(service.environments) as Environment[])
        } else {
          setError(`Microservice with ID "${serviceId}" not found.`)
          return
        }
      } else {
        setError("No microservice data found in storage.")
        return
      }

      // Load config data
      const configKey = `config-${serviceId}`
      const storedConfig = localStorage.getItem(configKey)
      if (storedConfig) {
        const configData: ConfigFile = JSON.parse(storedConfig)
        setConfig(configData)
        // Set first tab as active, ensuring it's a valid ConfigTabType
        // Initialize enabled tabs state, defaulting all to true
        const initialEnabledState = configData.tabs.reduce((acc, tabName) => {
          acc[tabName] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setEnabledTabs(initialEnabledState);
        setActiveTab(configData.tabs[0] || "")
      } else {
        setError(`Configuration for microservice "${serviceId}" not found.`)
      }
    } catch (err) {
      console.error("Error loading microservice or config data:", err)
      setError("Failed to load data. Please check console for more details.")
    }
  }, [serviceId])

  const handleConfigUpdate = (tabName: ConfigTabType, newConfig: Record<string, any>) => {
    if (!config) return

    try {
      const updatedConfig = {
        ...config,
        [tabName]: newConfig,
      } as ConfigFile // Assert as ConfigFile
      setConfig(updatedConfig)
      localStorage.setItem(`config-${serviceId}`, JSON.stringify(updatedConfig))
    } catch (err) {
      console.error("Error updating config:", err)
      setError("Failed to update configuration.")
    }
  }

  const handleTabEnabledChange = (tabName: ConfigTabType, isEnabled: boolean) => {
    setEnabledTabs((prev) => ({
      ...prev,
      [tabName]: isEnabled,
    }));
  };

  const handleEnvironmentToggle = (env: Environment) => {
    setSelectedEnvironments((prev) =>
      prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env]
    )
  }

  const handleExportZip = async () => {
    if (!config || selectedEnvironments.length === 0 || !microservice) {
      setError("Please select at least one environment to export or ensure data is loaded.")
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      // Pass the full microservice object to generateZip so it has access to environments
      await generateZip(microservice, config, selectedEnvironments);
      alert("Configuration ZIP generated successfully!");
    } catch (err) {
      console.error("Export error:", err)
      setError("Failed to generate ZIP file. An error occurred during export.")
    } finally {
      setIsExporting(false)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{error}</p>
          <Button asChild className="mt-4">
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!microservice || !config) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading microservice details...</p>
        </div>
      </div>
    )
  }

  // Determine the status badge variant and text
  const statusText = microservice.updatedAt ? "Active" : "New"; // Simplified status based on updatedAt
  const statusVariant = microservice.updatedAt ? "default" : "secondary";
  const statusColorClass = microservice.updatedAt ? "bg-green-600 hover:bg-green-500" : ""; // Assuming default secondary is grey

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-gray-900 flex items-center">
          <Home className="h-4 w-4 mr-1" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">{microservice.name}</span>
      </nav>

      {/* Service Details */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{microservice.name}</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="outline">{microservice.type}</Badge>
            <Badge variant={statusVariant} className={statusColorClass}>
              {statusText}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Service ID</Label>
                <p className="text-base text-gray-900 font-semibold">{microservice.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Type</Label>
                <p className="text-base text-gray-900">{microservice.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Repository</Label>
                <p className="text-base text-gray-900">
                  {microservice.repository ? (
                    <a href={microservice.repository} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Repo
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
              <div className="md:col-span-3"> {/* Span full width for environments */}
                <Label className="text-sm font-medium text-gray-600">Environments & Clusters</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {Object.entries(microservice.environments).map(([env, clusters]) => (
                    <div key={env} className="p-3 border rounded-md bg-gray-50">
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{env}</h4>
                      <div className="flex flex-wrap gap-1">
                        {clusters.length > 0 ? (
                          clusters.map((cluster) => (
                            <Badge key={cluster} variant="secondary" className="bg-blue-100 text-blue-800">
                              {cluster}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">No clusters defined for {env}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {Object.keys(microservice.environments).length === 0 && (
                    <p className="text-sm text-gray-500 md:col-span-3">No environments configured for this microservice.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {config.tabs && config.tabs.length > 0 ? (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ConfigTabType)}>
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  {config.tabs.map((tab) => (
                    <TabsTrigger key={tab} value={tab}>
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {config.tabs.map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-6">
                    <ConfigEditor
                      tabName={tab}
                      config={config[tab] || {}}
                      onConfigUpdate={(newConfig) => handleConfigUpdate(tab, newConfig)}
                      isEnabled={enabledTabs[tab] ?? true}
                      onEnabledChange={(isEnabled) => handleTabEnabledChange(tab, isEnabled)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-10 w-10 mx-auto mb-3" />
                <p>No configuration tabs available for this microservice.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Select Environments to Export Configs
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                {Object.keys(microservice.environments).length > 0 ? (
                  Object.keys(microservice.environments).map((envKey) => {
                    const env = envKey as Environment; // Cast to Environment enum
                    return (
                      <div key={env} className="flex items-center space-x-2">
                        <Checkbox
                          id={`export-${env}`}
                          checked={selectedEnvironments.includes(env)}
                          onCheckedChange={() => handleEnvironmentToggle(env)}
                        />
                        <Label htmlFor={`export-${env}`} className="text-sm font-medium">
                          {env} ({microservice.environments[env]?.length || 0} Clusters)
                        </Label>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 col-span-full">No environments available for export.</p>
                )}
              </div>
            </div>

            <Separator />

            <Button
              onClick={handleExportZip}
              disabled={selectedEnvironments.length === 0 || isExporting}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Generating..." : "Generate Config ZIP"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}