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
import { ConfigEditor } from "@/components/config-editor"
import { generateZip } from "@/lib/zip-generator"

interface Microservice {
  id: string
  name: string
  type: string
  environments: string[]
  clustered: boolean
  status: "active" | "inactive"
}

interface ConfigData {
  tabs: string[]
  [key: string]: any
}

const sampleConfigs: Record<string, ConfigData> = {
  "user-svc": {
    tabs: ["Spring", "Database"],
    Spring: {
      "server.port": 8080,
      "spring.profiles.active": "dev",
      "spring.datasource.driver-class-name": "org.postgresql.Driver",
      "logging.level.com.example": "DEBUG",
    },
    Database: {
      url: "jdbc:postgresql://localhost:5432/users",
      username: "admin",
      password: "secret",
      "pool.max-size": 20,
    },
  },
  "order-svc": {
    tabs: ["Spring", "Redis", "Kafka"],
    Spring: {
      "server.port": 8081,
      "spring.profiles.active": "prod",
    },
    Redis: {
      host: "localhost",
      port: 6379,
      timeout: 2000,
    },
    Kafka: {
      "bootstrap.servers": "localhost:9092",
      "group.id": "order-service",
    },
  },
  "payment-svc": {
    tabs: ["Express", "Database"],
    Express: {
      port: 3000,
      env: "development",
      "cors.origin": "*",
    },
    Database: {
      host: "localhost",
      port: 5432,
      database: "payments",
    },
  },
  "notification-svc": {
    tabs: ["Flask", "SMTP"],
    Flask: {
      DEBUG: true,
      SECRET_KEY: "dev-secret",
      PORT: 5000,
    },
    SMTP: {
      host: "smtp.gmail.com",
      port: 587,
      username: "notifications@company.com",
    },
  },
}

export default function MicroserviceDetails() {
  const params = useParams()
  const serviceId = params.id as string

  const [microservice, setMicroservice] = useState<Microservice | null>(null)
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("")
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Load microservice data
      const stored = localStorage.getItem("microservices")
      if (stored) {
        const services = JSON.parse(stored)
        const service = services.find((s: Microservice) => s.id === serviceId)
        setMicroservice(service || null)
      }

      // Load config data
      const configKey = `config-${serviceId}`
      const storedConfig = localStorage.getItem(configKey)
      if (storedConfig) {
        const configData = JSON.parse(storedConfig)
        setConfig(configData)
        setActiveTab(configData.tabs[0] || "")
      } else if (sampleConfigs[serviceId]) {
        setConfig(sampleConfigs[serviceId])
        setActiveTab(sampleConfigs[serviceId].tabs[0] || "")
        localStorage.setItem(configKey, JSON.stringify(sampleConfigs[serviceId]))
      }
    } catch (err) {
      console.error("Error loading microservice data:", err)
      setError("Failed to load microservice data")
    }
  }, [serviceId])

  const handleConfigUpdate = (tabName: string, newConfig: Record<string, any>) => {
    if (!config) return

    try {
      const updatedConfig = {
        ...config,
        [tabName]: newConfig,
      }
      setConfig(updatedConfig)
      localStorage.setItem(`config-${serviceId}`, JSON.stringify(updatedConfig))
    } catch (err) {
      console.error("Error updating config:", err)
      setError("Failed to update configuration")
    }
  }

  const handleEnvironmentToggle = (env: string) => {
    setSelectedEnvironments((prev) => (prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env]))
  }

  const handleExportZip = async () => {
    if (!config || selectedEnvironments.length === 0) return

    setIsExporting(true)
    setError(null)

    try {
      await generateZip(config, selectedEnvironments, microservice?.name || serviceId)
    } catch (err) {
      console.error("Export error:", err)
      setError("Failed to generate ZIP file. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
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
            <Badge
              variant={microservice.status === "active" ? "default" : "secondary"}
              className={microservice.status === "active" ? "bg-green-600" : ""}
            >
              {microservice.status}
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
                <p className="text-sm text-gray-900">{microservice.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Type</Label>
                <p className="text-sm text-gray-900">{microservice.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Clustered</Label>
                <p className="text-sm text-gray-900">{microservice.clustered ? "Yes" : "No"}</p>
              </div>
              <div className="md:col-span-3">
                <Label className="text-sm font-medium text-gray-600">Environments</Label>
                <div className="flex space-x-2 mt-1">
                  {microservice.environments.map((env) => (
                    <Badge key={env} variant="outline">
                      {env}
                    </Badge>
                  ))}
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                  />
                </TabsContent>
              ))}
            </Tabs>
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
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Select Environments to Export</Label>
              <div className="flex space-x-6">
                {["GT1", "GT2", "GT3"].map((env) => (
                  <div key={env} className="flex items-center space-x-2">
                    <Checkbox
                      id={env}
                      checked={selectedEnvironments.includes(env)}
                      onCheckedChange={() => handleEnvironmentToggle(env)}
                    />
                    <Label htmlFor={env} className="text-sm font-medium">
                      {env}
                    </Label>
                  </div>
                ))}
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
