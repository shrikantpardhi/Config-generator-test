"use client"

import React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ChevronRight, Home, Save, Server, GitBranch, Lightbulb } from "lucide-react"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Microservice, Environment, Cluster, ConfigTabType, ENVIRONMENT_CLUSTERS } from "@/types"

// --- Zod Schema Definition ---
const formSchema = z.object({
  id: z.string().min(3, {
    message: "Service ID must be at least 3 characters.",
  }).max(50, {
    message: "Service ID must not exceed 50 characters."
  }).regex(/^[a-z0-9-]+$/, {
    message: "Service ID can only contain lowercase letters, numbers, and hyphens.",
  }),
  name: z.string().min(3, {
    message: "Service Name must be at least 3 characters.",
  }).max(100, {
    message: "Service Name must not exceed 100 characters."
  }),
  type: z.string().min(1, {
    message: "Please select a service type.",
  }),
  // Environments can be an empty object if no environments are selected.
  // If an environment is selected, its array of clusters must have at least one cluster.
  environments: z.record(z.nativeEnum(Environment), z.array(z.nativeEnum(Cluster)))
    .optional()
    .transform(val => val || {}), // Ensure it defaults to an empty object if undefined
  repository: z.string().url({ message: "Invalid URL format." }).optional().or(z.literal('')),
  lightspeed: z.string().optional(),
})

type NewMicroserviceFormValues = z.infer<typeof formSchema>

export default function AddMicroservice() {
  const router = useRouter()

  const form = useForm<NewMicroserviceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      type: "",
      environments: {},
      repository: "",
      lightspeed: "",
    },
  })

  const serviceTypes = ["Spring Boot", "Node.js", "Python", ".NET Core", "Go"]
  const allEnvironments = Object.values(Environment)

  async function onSubmit(values: NewMicroserviceFormValues) {
    // Load existing microservices from localStorage
    const stored = localStorage.getItem("microservices")
    const existing: Microservice[] = stored ? JSON.parse(stored) : []

    // Check if ID already exists
    if (existing.some((service) => service.id === values.id)) {
      form.setError("id", {
        type: "manual",
        message: "Service ID already exists.",
      })
      return
    }

    // Filter out environments that are unchecked or have no selected clusters
    const environmentsWithSelectedClusters: Partial<Record<Environment, Cluster[]>> = {};
    for (const envKey in values.environments) {
      // Ensure the property belongs to the object itself, not its prototype chain
      if (values.environments.hasOwnProperty(envKey)) {
        const env = envKey as Environment; // Cast key to Environment enum type
        const clusters = values.environments[env];
        // Only include environment if its corresponding array of clusters exists and is not empty
        if (clusters && clusters.length > 0) {
          environmentsWithSelectedClusters[env] = clusters;
        }
      }
    }

    // Prepare the new microservice object to match the Microservice interface
    const newMicroservice: Microservice = {
      ...values,
      environments: environmentsWithSelectedClusters, // Use the filtered environments
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save the updated microservices list
    const updated = [...existing, newMicroservice]
    localStorage.setItem("microservices", JSON.stringify(updated))

    // Create and save default configuration for the new microservice
    const defaultConfig = {
      tabs: [ConfigTabType.Spring, ConfigTabType.Database], // Example default tabs
      [ConfigTabType.Spring]: {
        "service.name": newMicroservice.name,
        "service.type": newMicroservice.type,
        "service.version": "1.0.0",
        "spring.application.name": newMicroservice.name.toLowerCase().replace(/\s/g, "-"),
      },
      [ConfigTabType.Database]: {
        "db.url": "jdbc:mysql://localhost:3306/mydb",
        "db.username": "user",
        "db.password": "password",
      },
    }
    localStorage.setItem(`config-${newMicroservice.id}`, JSON.stringify(defaultConfig))

    // Redirect to the dashboard
    router.push("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
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
            <CardTitle>Register a new microservice</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* --- General Information Section --- */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center text-gray-800">
                    <Lightbulb className="w-5 h-5 mr-2 text-blue-500" /> General Information
                  </h2>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <FormField
                      control={form.control}
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service ID *</FormLabel>
                          <FormControl>
                            <Input placeholder="user-auth-svc" {...field} />
                          </FormControl>
                          <FormDescription>
                            Unique identifier (lowercase, numbers, hyphens only).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="User Authentication Service" {...field} />
                          </FormControl>
                          <FormDescription>
                            Human-readable name for the microservice.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Programming language or framework used.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* --- Deployment Configuration Section (Two Columns) --- */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center text-gray-800">
                    <Server className="w-5 h-5 mr-2 text-green-500" /> Deployment Configuration
                  </h2>
                  <Separator />
                  <FormItem>
                    <FormLabel className="text-base font-medium text-gray-700 block mb-2">Environments & Clusters</FormLabel>
                    <FormDescription>
                      Select environments and specific clusters for deployment. At least one cluster must be chosen for each selected environment.
                    </FormDescription>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {allEnvironments.map((env) => (
                        <div key={env} className="p-4 rounded-md border bg-gray-50">
                          {/* Environment Checkbox */}
                          <FormField
                            control={form.control}
                            name={`environments.${env}`}
                            render={({ field }) => {
                              const isEnvironmentChecked = form.watch(`environments.${env}`)?.length !== undefined; // Check if the array exists (meaning env is selected)
                              return (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 pb-3 border-b border-gray-200 mb-3">
                                  <FormControl>
                                    <Checkbox
                                      id={`env-${env}`}
                                      checked={isEnvironmentChecked}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          // When checking, initialize with an empty array.
                                          // Zod's .min(1) will then require user to select clusters.
                                          field.onChange([]);
                                        } else {
                                          // When unchecking, remove the environment entry from formData
                                          field.onChange(undefined);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel htmlFor={`env-${env}`} className="font-semibold text-base cursor-pointer">
                                    {env} Environment
                                  </FormLabel>
                                  {/* FormMessage for environment-level errors (e.g., if a selected env has no clusters) */}
                                  {form.formState.errors.environments?.[env] && (
                                    <p className="text-sm font-medium text-destructive ml-auto">
                                      {form.formState.errors.environments[env]?.message as string}
                                    </p>
                                  )}
                                </FormItem>
                              );
                            }}
                          />

                          {/* Cluster selection for the current environment, only if environment is checked */}
                          {form.watch(`environments.${env}`) && (
                            <div className="space-y-2 mt-4">
                              <Label className="text-sm font-medium text-gray-600 block mb-2">Select Clusters:</Label>
                              {ENVIRONMENT_CLUSTERS[env].length > 0 ? (
                                <div className="grid grid-cols-1 gap-y-2">
                                  {ENVIRONMENT_CLUSTERS[env].map((cluster) => (
                                    <FormField
                                      key={cluster}
                                      control={form.control}
                                      name={`environments.${env}`}
                                      render={({ field }) => {
                                        const currentClusters = Array.isArray(field.value) ? field.value : [];
                                        const isClusterChecked = currentClusters.includes(cluster);

                                        return (
                                          <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                            <FormControl>
                                              <Checkbox
                                                checked={isClusterChecked}
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    field.onChange([...currentClusters, cluster]);
                                                  } else {
                                                    field.onChange(currentClusters.filter((c) => c !== cluster));
                                                  }
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm">
                                              {cluster}
                                            </FormLabel>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No clusters defined for this environment.</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </FormItem>
                </div>

                {/* --- Optional Details Section --- */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center text-gray-800">
                    <GitBranch className="w-5 h-5 mr-2 text-purple-500" /> Optional Details
                  </h2>
                  <Separator />
                  <FormField
                    control={form.control}
                    name="repository"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repository URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/my-org/user-svc" {...field} />
                        </FormControl>
                        <FormDescription>
                          Link to the service's code repository (e.g., GitHub, GitLab).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lightspeed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lightspeed ID</FormLabel>
                        <FormControl>
                          <Input placeholder="LS-12345" {...field} />
                        </FormControl>
                        <FormDescription>
                          Internal identifier for tracking purposes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Form Action Buttons */}
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
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}