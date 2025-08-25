"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

interface RadioGroupItemProps {
  value: string
  id?: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange }}>
        <div
          ref={ref}
          className={cn("grid gap-2", className)}
          role="radiogroup"
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, disabled, children, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    const isChecked = context.value === value

    const handleChange = () => {
      if (!disabled && context.onValueChange) {
        context.onValueChange(value)
      }
    }

    return (
      <div className="flex items-center space-x-3">
        <div className="relative">
          <input
            ref={ref}
            type="radio"
            id={id}
            value={value}
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded-full border-2 border-border bg-background transition-all duration-200 cursor-pointer",
              "hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
              isChecked && "border-primary",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            onClick={handleChange}
          >
            {isChecked && (
              <div className="h-2.5 w-2.5 rounded-full bg-primary m-0.5" />
            )}
          </div>
        </div>
        {children && (
          <label htmlFor={id} className="text-sm cursor-pointer select-none">
            {children}
          </label>
        )}
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }