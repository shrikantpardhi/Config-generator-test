import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Microservice, Cluster, Environment } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, FolderGit, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface GetColumnsOptions {
  hoveredRowId?: string | null;
}

export const getMicroserviceColumns = (
  options?: GetColumnsOptions
): ColumnDef<Microservice>[] => {
  const environmentColumns: ColumnDef<Microservice>[] = Object.values(
    Environment
  ).map((env) => ({
    accessorKey: `environments.${env}`,
    header: ({ column }) => (
      <div className="text-xs font-semibold text-gray-600 uppercase">{env}</div>
    ),
    cell: ({ row }) => {
      const clusters = row.original.environments?.[env as Environment] || [];
      return (
        <div className="flex flex-wrap gap-1">
          {clusters.map((cluster: Cluster) => (
            <Badge
              key={`${env}-${cluster}`}
              variant="secondary"
              className="text-xs bg-green-50 text-green-700 hover:bg-green-100"
            >
              {cluster}
            </Badge>
          ))}
        </div>
      );
    },
    size: 150,
  }));

  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          
          <Link href={`/microservice/${row.original.id}`} className="flex gap-2 items-center"><span className="font-medium">{row.original.name}</span></Link>
            
          {/* <span className="text-xs text-gray-500">{row.original.id}</span> */}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ getValue }) => (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          {String(getValue())}
        </Badge>
      ),
      size: 120,
    },
    ...environmentColumns,
    {
      id: "actions",
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link href="" className="flex gap-2 items-center"><FolderGit className="h-4 w-4" /> Repository</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="" className="flex gap-2 items-center"><ExternalLink className="h-4 w-4" /> Lightspeed</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
