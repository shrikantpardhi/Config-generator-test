import JSZip from "jszip"
import * as yaml from "js-yaml"

interface ConfigData {
  tabs: string[]
  [key: string]: any
}

export async function generateZip(config: ConfigData, environments: string[], serviceName: string) {
  const zip = new JSZip()

  // Create configuration object without the tabs array
  const configObject = { ...config }
  delete configObject.tabs

  // Generate YAML content
  const yamlContent = yaml.dump(configObject, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  })

  // Add config.yaml to each selected environment folder
  environments.forEach((env) => {
    zip.folder(env)?.file("config.yaml", yamlContent)
  })

  // Generate and download the ZIP file
  try {
    const content = await zip.generateAsync({ type: "blob" })
    const url = window.URL.createObjectURL(content)
    const link = document.createElement("a")
    link.href = url
    link.download = `${serviceName.toLowerCase().replace(/\s+/g, "-")}-config.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error generating ZIP file:", error)
    alert("Error generating ZIP file. Please try again.")
  }
}
