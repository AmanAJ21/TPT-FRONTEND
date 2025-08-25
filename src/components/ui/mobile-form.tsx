"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

interface MobileFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

const MobileForm = React.forwardRef<HTMLFormElement, MobileFormProps>(
  ({ className, children, ...props }, ref) => (
    <form
      ref={ref}
      className={cn("space-y-6", className)}
      {...props}
    >
      {children}
    </form>
  )
)
MobileForm.displayName = "MobileForm"

interface MobileFormFieldProps {
  children: React.ReactNode
  className?: string
  error?: string
  success?: string
}

const MobileFormField = React.forwardRef<HTMLDivElement, MobileFormFieldProps>(
  ({ className, children, error, success, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    >
      {children}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}
    </div>
  )
)
MobileFormField.displayName = "MobileFormField"

interface MobileFormLabelProps extends React.ComponentProps<typeof Label> {
  required?: boolean
  icon?: React.ReactNode
}

const MobileFormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  MobileFormLabelProps
>(({ className, required, icon, children, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("text-sm font-medium flex items-center gap-2", className)}
    {...props}
  >
    {icon}
    {children}
    {required && <span className="text-destructive">*</span>}
  </Label>
))
MobileFormLabel.displayName = "MobileFormLabel"

interface MobileFormInputProps extends React.ComponentProps<typeof Input> {
  icon?: React.ReactNode
  showPasswordToggle?: boolean
}

const MobileFormInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  MobileFormInputProps
>(({ className, icon, showPasswordToggle, type, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const inputType = showPasswordToggle && type === "password" 
    ? (showPassword ? "text" : "password") 
    : type

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={inputType}
        className={cn(
          "h-12 text-base border-2 transition-all duration-200",
          "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
          "hover:border-border/80",
          icon && "pl-10",
          showPasswordToggle && "pr-12",
          className
        )}
        {...props}
      />
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      {showPasswordToggle && (
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-accent transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  )
})
MobileFormInput.displayName = "MobileFormInput"

interface MobileFormButtonProps extends React.ComponentProps<typeof Button> {
  fullWidth?: boolean
  loading?: boolean
  loadingText?: string
}

const MobileFormButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  MobileFormButtonProps
>(({ className, fullWidth = true, loading, loadingText, children, disabled, ...props }, ref) => (
  <Button
    ref={ref}
    disabled={disabled || loading}
    className={cn(
      fullWidth && "w-full",
      "h-12 text-base font-medium transition-all duration-300",
      "hover:shadow-lg active:scale-[0.98]",
      className
    )}
    {...props}
  >
    {loading ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
        {loadingText || "Loading..."}
      </>
    ) : (
      children
    )}
  </Button>
))
MobileFormButton.displayName = "MobileFormButton"

interface MobileFormGroupProps {
  children: React.ReactNode
  className?: string
  direction?: "row" | "column"
}

const MobileFormGroup = React.forwardRef<HTMLDivElement, MobileFormGroupProps>(
  ({ className, children, direction = "column", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex gap-4",
        direction === "column" ? "flex-col" : "flex-col sm:flex-row",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
MobileFormGroup.displayName = "MobileFormGroup"

interface MobileFormStepperProps {
  steps: string[]
  currentStep: number
  className?: string
}

const MobileFormStepper = React.forwardRef<HTMLDivElement, MobileFormStepperProps>(
  ({ steps, currentStep, className, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-3">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className={cn(
                "relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                currentStep > index + 1 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : currentStep === index + 1
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground"
              )}>
                {currentStep > index + 1 ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  index + 1
                )}
                {currentStep === index + 1 && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-1 rounded-full transition-all duration-300",
                  currentStep > index + 1 ? "bg-primary" : "bg-muted"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mb-8 px-2">
        {steps.map((step, index) => (
          <span 
            key={index}
            className={currentStep >= index + 1 ? 'text-primary font-medium' : ''}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  )
)
MobileFormStepper.displayName = "MobileFormStepper"

export {
  MobileForm,
  MobileFormField,
  MobileFormLabel,
  MobileFormInput,
  MobileFormButton,
  MobileFormGroup,
  MobileFormStepper,
}