"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Home, Save } from "lucide-react"

interface NewMicroservice {
  id: string
  name: string
  type: string
  environments: string[]
  clustered: boolean
  status: "active" | "inactive"
}

export default function AddMicroservice() {
  const router = useRouter()
  const [formData, setFormData] = useState<NewMicroservice>({
    id: "",
    name: "",
    type: "",
    environments: [],
    clustered: false,
    status: "active",
  })

  const serviceTypes = ["Spring Boot", "Node.js", "Python", ".NET Core", "Go"]
  const allEnvironments = ["GT1", "GT2", "GT3"]

  const handleEnvironmentToggle = (env: string) => {
    setFormData((prev) => ({
      ...prev,
      environments: prev.environments.includes(env)
        ? prev.environments.filter((e) => e !== env)
        : [...prev.environments, env],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.id || !formData.name || !formData.type) {
      alert("Please fill in all required fields")
      return
    }

    // Load existing microservices
    const stored = localStorage.getItem("microservices")
    const existing = stored ? JSON.parse(stored) : []

    // Check if ID already exists
    if (existing.some((service: any) => service.id === formData.id)) {
      alert("Service ID already exists")
      return
    }

    // Add new microservice
    const updated = [...existing, formData]
    localStorage.setItem("microservices", JSON.stringify(updated))

    // Create default config
    const defaultConfig = {
      tabs: ["General"],
      General: {
        "service.name": formData.name,
        "service.type": formData.type,
        "service.version": "1.0.0",
      },
    }
    localStorage.setItem(`config-${formData.id}`, JSON.stringify(defaultConfig))

    router.push("/")
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
        <span className="text-gray-900 font-medium">Add Microservice</span>
      </nav>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Microservice</h1>

        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id">Service ID *</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, id: e.target.value }))}
                    placeholder="user-svc"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="User Service"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Service Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Environments</Label>
                <div className="flex space-x-6">
                  {allEnvironments.map((env) => (
                    <div key={env} className="flex items-center space-x-2">
                      <Checkbox
                        id={env}
                        checked={formData.environments.includes(env)}
                        onCheckedChange={() => handleEnvironmentToggle(env)}
                      />
                      <Label htmlFor={env} className="text-sm font-medium">
                        {env}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clustered"
                  checked={formData.clustered}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, clustered: checked as boolean }))}
                />
                <Label htmlFor="clustered" className="text-sm font-medium">
                  Clustered Service
                </Label>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Create Microservice
                </Button>
                <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="/">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
