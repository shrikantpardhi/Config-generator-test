"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"
import { Environment } from "@/types"

interface AppContextType {
  selectedEnvironment: Environment
  setSelectedEnvironment: (env: Environment) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>(Environment.DEV)

  return <AppContext.Provider value={{ selectedEnvironment, setSelectedEnvironment }}>{children}</AppContext.Provider>
}
