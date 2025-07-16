"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import * as yaml from "js-yaml"

interface ConfigEditorProps {
  tabName: string
  config: Record<string, any>
  onConfigUpdate: (config: Record<string, any>) => void
}

export function ConfigEditor({ tabName, config, onConfigUpdate }: ConfigEditorProps) {
  const [localConfig, setLocalConfig] = useState<Record<string, any>>(config)
  const [yamlPreview, setYamlPreview] = useState<string>("")

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  useEffect(() => {
    try {
      const yamlString = yaml.dump(localConfig, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })
      setYamlPreview(yamlString)
    } catch (error) {
      setYamlPreview("# Error generating YAML preview")
    }
  }, [localConfig])

  const handleValueChange = (key: string, value: string) => {
    const newConfig = { ...localConfig }

    // Try to parse as number or boolean
    let parsedValue: any = value
    if (value === "true") parsedValue = true
    else if (value === "false") parsedValue = false
    else if (!isNaN(Number(value)) && value !== "") parsedValue = Number(value)

    newConfig[key] = parsedValue
    setLocalConfig(newConfig)
    onConfigUpdate(newConfig)
  }

  const handleAddProperty = () => {
    const newKey = `new.property.${Date.now()}`
    const newConfig = { ...localConfig, [newKey]: "" }
    setLocalConfig(newConfig)
    onConfigUpdate(newConfig)
  }

  const handleRemoveProperty = (key: string) => {
    const newConfig = { ...localConfig }
    delete newConfig[key]
    setLocalConfig(newConfig)
    onConfigUpdate(newConfig)
  }

  const handleKeyChange = (oldKey: string, newKey: string) => {
    if (newKey === oldKey || newKey in localConfig) return

    const newConfig = { ...localConfig }
    newConfig[newKey] = newConfig[oldKey]
    delete newConfig[oldKey]
    setLocalConfig(newConfig)
    onConfigUpdate(newConfig)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Editor */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{tabName} Configuration</CardTitle>
          <Button onClick={handleAddProperty} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(localConfig).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <div className="flex-1">
                <Label htmlFor={`key-${key}`} className="text-xs text-gray-600">
                  Property Key
                </Label>
                <Input
                  id={`key-${key}`}
                  value={key}
                  onChange={(e) => handleKeyChange(key, e.target.value)}
                  className="text-sm"
                  placeholder="property.key"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`value-${key}`} className="text-xs text-gray-600">
                  Value
                </Label>
                <Input
                  id={`value-${key}`}
                  value={String(value)}
                  onChange={(e) => handleValueChange(key, e.target.value)}
                  className="text-sm"
                  placeholder="value"
                />
              </div>
              <Button
                onClick={() => handleRemoveProperty(key)}
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-800 mt-5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {Object.keys(localConfig).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No configuration properties yet.</p>
              <p className="text-sm">Click "Add Property" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* YAML Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">YAML Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-4 rounded-md text-sm font-mono overflow-auto max-h-96 border">{yamlPreview}</pre>
        </CardContent>
      </Card>
    </div>
  )
}
