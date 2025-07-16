"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ExternalLink, CheckCircle, XCircle } from "lucide-react"

interface Microservice {
  id: string
  name: string
  type: string
  environments: string[]
  clustered: boolean
  status: "active" | "inactive"
}

const sampleMicroservices: Microservice[] = [
  {
    id: "user-svc",
    name: "User Service",
    type: "Spring Boot",
    environments: ["GT1", "GT2"],
    clustered: true,
    status: "active",
  },
  {
    id: "order-svc",
    name: "Order Service",
    type: "Spring Boot",
    environments: ["GT1", "GT2", "GT3"],
    clustered: false,
    status: "active",
  },
  {
    id: "payment-svc",
    name: "Payment Service",
    type: "Node.js",
    environments: ["GT1"],
    clustered: true,
    status: "inactive",
  },
  {
    id: "notification-svc",
    name: "Notification Service",
    type: "Python",
    environments: ["GT2", "GT3"],
    clustered: false,
    status: "active",
  },
]

export default function Dashboard() {
  const [microservices, setMicroservices] = useState<Microservice[]>([])

  useEffect(() => {
    // Load from localStorage or use sample data
    const stored = localStorage.getItem("microservices")
    if (stored) {
      setMicroservices(JSON.parse(stored))
    } else {
      setMicroservices(sampleMicroservices)
      localStorage.setItem("microservices", JSON.stringify(sampleMicroservices))
    }
  }, [])

  const allEnvironments = ["GT1", "GT2", "GT3"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Microservices Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your microservice configurations across environments</p>
        </div>
        <Button asChild>
          <Link href="/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Microservice
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Clustered</TableHead>
                <TableHead>GT1</TableHead>
                <TableHead>GT2</TableHead>
                <TableHead>GT3</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {microservices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/microservices/${service.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {service.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {service.clustered ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </TableCell>
                  {allEnvironments.map((env) => (
                    <TableCell key={env}>
                      {service.environments.includes(env) ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Badge
                      variant={service.status === "active" ? "default" : "secondary"}
                      className={service.status === "active" ? "bg-green-600" : ""}
                    >
                      {service.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/microservices/${service.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
