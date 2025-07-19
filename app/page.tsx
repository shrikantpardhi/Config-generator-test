"use client";

import { useMemo } from "react"; // Import useMemo
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getMicroserviceColumns } from "./columns";
import { DataTable } from "./data-table";
import { Microservice, Cluster } from "@/types"; 
import { microservices } from "@/data/ms-data.json"; 

export default function Dashboard() {
  const processedServiceData: Microservice[] = useMemo(() => {
    const rawServices = Array.isArray(microservices) ? microservices : [];

    return rawServices.map((ms: any) => {
      const environments: Partial<Record<string, Cluster[]>> = {};
      if (ms.environments && typeof ms.environments === 'object') {
        for (const envKey in ms.environments) {
          if (Object.prototype.hasOwnProperty.call(ms.environments, envKey)) {
            const rawClusters = ms.environments[envKey];
            if (Array.isArray(rawClusters)) {
              environments[envKey] = rawClusters.map((cluster: string) => cluster as Cluster);
            }
          }
        }
      }

      return {
        ...ms,
        environments: environments as Partial<Record<keyof typeof Cluster, Cluster[]>>,
      } as Microservice; 
    });
  }, [microservices]); 

  const columns = useMemo(() => getMicroserviceColumns(), []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Microservices Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your microservice configurations across environments
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Microservice
          </Link>
        </Button>
      </div>

       <DataTable columns={columns} data={processedServiceData} cardTitle="Service Overview" />
    </div>
  );
}