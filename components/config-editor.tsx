"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"
import * as yaml from "js-yaml"

interface ConfigEditorProps {
  tabName: string
  config: Record<string, any>
  onConfigUpdate: (config: Record<string, any>) => void
  isEnabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

// Helper function to un-flatten dot-notation keys into a nested object
function unflatten(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const keys = key.split('.');
      let current = result;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = current[keys[i]] || {};
      }
      current[keys[keys.length - 1]] = data[key];
    }
  }
  return result;
}

// Helper function to parse string input into boolean, number, or its original string form.
function parseInputValue(value: string): any {
  const trimmedValue = value.trim();

  if (trimmedValue.toLowerCase() === 'true') return true;
  if (trimmedValue.toLowerCase() === 'false') return false;

  // Check if it's a valid number, but don't convert empty/whitespace string to 0.
  // It correctly handles integers, floats, and hex values via Number().
  if (trimmedValue !== '' && !isNaN(Number(trimmedValue))) {
    return Number(trimmedValue);
  }
  return value; // Return original string if not a clear boolean or number
}

export function ConfigEditor({ tabName, config, onConfigUpdate, isEnabled, onEnabledChange }: ConfigEditorProps) {
  const [localConfig, setLocalConfig] = useState<Record<string, any>>(config)
  const [yamlPreview, setYamlPreview] = useState<string>("")
  const [newPropKey, setNewPropKey] = useState("")
  const [newPropValue, setNewPropValue] = useState("")
  const [keyError, setKeyError] = useState<string | null>(null)
  
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [tempKey, setTempKey] = useState("")
  const [tempValue, setTempValue] = useState("")
  const [editError, setEditError] = useState<string | null>(null)

  const switchId = `enable-${tabName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  useEffect(() => {
    try {
      const nestedConfig = unflatten(localConfig);
      const yamlString = yaml.dump(nestedConfig, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })
      setYamlPreview(yamlString)
    } catch (error) {
      console.error("Error generating YAML:", error)
      setYamlPreview("# Error generating YAML preview")
    }
  }, [localConfig])

  const handleAddProperty = () => {
    const trimmedKey = newPropKey.trim()
    if (trimmedKey === "") {
      setKeyError("Key cannot be empty.")
      return
    }
    if (trimmedKey in localConfig) {
      setKeyError("This key already exists.")
      return
    }

    setKeyError(null)
    const newConfig = { ...localConfig, [trimmedKey]: parseInputValue(newPropValue) }
    setLocalConfig(newConfig)
    onConfigUpdate(newConfig)
    setNewPropKey("")
    setNewPropValue("")
  }

  const handleRemoveProperty = (key: string) => {
    const newConfig = { ...localConfig }
    delete newConfig[key]
    setLocalConfig(newConfig)
    onConfigUpdate(newConfig)
  }

  const handleEdit = (key: string, value: any) => {
    setEditingKey(key)
    setTempKey(key)
    setTempValue(String(value))
    setEditError(null)
  }

  const handleCancel = () => {
    setEditingKey(null)
    setTempKey("")
    setTempValue("")
    setEditError(null)
  }

  const handleSave = (oldKey: string) => {
    const newKey = tempKey.trim()
    if (newKey === "") {
      setEditError("Key cannot be empty.")
      return
    }
    if (newKey !== oldKey && newKey in localConfig) {
      setEditError("This key already exists.")
      return
    }

    const newConfigEntries = Object.entries(localConfig).map(([k, v]) => {
      if (k === oldKey) {
        return [newKey, parseInputValue(tempValue)]
      }
      return [k, v]
    })

    const newConfig = Object.fromEntries(newConfigEntries)

    setLocalConfig(newConfig)
    onConfigUpdate(newConfig)
    handleCancel()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Editor */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{tabName} Configuration</CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor={switchId} className="text-sm text-muted-foreground">
                {isEnabled ? "Enabled" : "Disabled"}
              </Label>
              <Switch
                id={switchId}
                checked={isEnabled}
                onCheckedChange={onEnabledChange}
              />
            </div>
          </div>
          <CardDescription>
            {isEnabled ? "View properties below or click the pencil icon to edit." : "This configuration tab is currently disabled."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset
            key={isEnabled ? 'enabled' : 'disabled'}
            disabled={!isEnabled}
            className="disabled:opacity-50 transition-opacity"
          >
          {Object.keys(localConfig).length > 0 ? (
            <>
              <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-x-2 mb-1">
                <Label className="text-xs font-medium text-gray-500">Property Key</Label>
                <Label className="text-xs font-medium text-gray-500">Value</Label>
                <div className="w-9" /> {/* Spacer for delete button */}
              </div>
              <div className="space-y-3">
                {Object.entries(localConfig).map(([key, value]) => {
                  const isEditing = editingKey === key
                  return isEditing ? (
                    <div key={key} className="grid grid-cols-[1fr_1fr_auto] items-start gap-x-2 p-2 bg-blue-50/50 border border-blue-200 rounded-lg">
                      <div>
                        <Input
                          value={tempKey}
                          onChange={(e) => {
                            setTempKey(e.target.value)
                            if (editError) setEditError(null)
                          }}
                          className={`text-sm h-9 ${editError ? 'border-red-500' : ''}`}
                          placeholder="property.key"
                        />
                        {editError && <p className="text-xs text-red-600 mt-1">{editError}</p>}
                      </div>
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="text-sm h-9"
                        placeholder="value"
                      />
                      <div className="flex items-center space-x-1">
                        <Button onClick={() => handleSave(key)} size="icon" variant="ghost" className="h-9 w-9 text-green-600 hover:bg-green-50 hover:text-green-700">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleCancel} size="icon" variant="ghost" className="h-9 w-9 text-gray-500 hover:bg-gray-100">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div key={key} className="grid grid-cols-[1fr_1fr_auto] items-center gap-x-2 group">
                      <p className="text-sm font-mono px-3 py-2 h-9 flex items-center truncate bg-gray-50/50 rounded-md border border-transparent group-hover:border-gray-200">
                        {key}
                      </p>
                      <p className="text-sm px-3 py-2 h-9 flex items-center truncate bg-gray-50/50 rounded-md border border-transparent group-hover:border-gray-200">
                        {String(value)}
                      </p>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => handleEdit(key, value)} size="icon" variant="ghost" className="h-9 w-9 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleRemoveProperty(key)} size="icon" variant="ghost" className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No configuration properties yet.</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <h4 className="text-md font-semibold mb-3">Add New Property</h4>
            <div className="grid grid-cols-[1fr_1fr_auto] items-start gap-x-2">
              <div>
                <Input
                  value={newPropKey}
                  onChange={(e) => {
                    setNewPropKey(e.target.value)
                    if (keyError) setKeyError(null)
                  }}
                  placeholder="new.property.key"
                  className={`text-sm ${keyError ? 'border-red-500' : ''}`}
                />
                {keyError && <p className="text-xs text-red-600 mt-1">{keyError}</p>}
              </div>
              <Input
                value={newPropValue}
                onChange={(e) => setNewPropValue(e.target.value)}
                placeholder="value"
                className="text-sm"
              />
              <Button onClick={handleAddProperty} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          </fieldset>
        </CardContent>
      </Card>

      {/* YAML Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">YAML Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-4 rounded-md text-sm font-mono overflow-auto max-h-96 border whitespace-pre-wrap">
            {yamlPreview}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
