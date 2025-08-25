"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Header from '@/components/comp-577'
import Footer from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import {
  Eye,
  EyeOff,
  Loader2
} from "lucide-react"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    profile: {
      ownerName: "",
      companyName: "",
      mobileNumber: "",
      address: "",
      gstNumber: "",
      panNumber: "",
    },
    bank: {
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankBranchName: "",
    }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState(1)

  const { register } = useAuth()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.startsWith('profile.')) {
      const profileField = name.replace('profile.', '')
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }))
    } else if (name.startsWith('bank.')) {
      const bankField = name.replace('bank.', '')
      setFormData(prev => ({
        ...prev,
        bank: {
          ...prev.bank,
          [bankField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    const { ownerName, companyName, mobileNumber, address } = formData.profile
    if (!ownerName || !companyName || !mobileNumber || !address) {
      setError("Please fill in all required profile fields")
      return false
    }

    return true
  }

  const handleNext = () => {
    setError("")
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    setError("")
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Clean up empty bank fields
      const cleanBankData = Object.fromEntries(
        Object.entries(formData.bank).filter(([_, value]) => value.trim() !== '')
      )

      // Clean up empty profile fields (keep required fields, clean optional ones)
      const cleanProfileData = {
        ownerName: formData.profile.ownerName.trim(),
        companyName: formData.profile.companyName.trim(),
        mobileNumber: formData.profile.mobileNumber.trim(),
        address: formData.profile.address.trim(),
        ...(formData.profile.gstNumber.trim() && { gstNumber: formData.profile.gstNumber.trim().toUpperCase() }),
        ...(formData.profile.panNumber.trim() && { panNumber: formData.profile.panNumber.trim().toUpperCase() })
      }

      const registrationData = {
        email: formData.email.trim(),
        password: formData.password,
        profile: cleanProfileData,
        ...(Object.keys(cleanBankData).length > 0 && { bank: cleanBankData })
      }



      const result = await register(registrationData)

      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Create your account</CardTitle>
            <CardDescription>
              Join us today and get started in minutes
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  1
                </div>
                <div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  2
                </div>
                <div className={`w-8 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  3
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Step 1: Account Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium">Account Details</h3>
                    <p className="text-sm text-muted-foreground">Create your login credentials</p>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a password"
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Must be at least 6 characters long
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                      Confirm password *
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button type="button" onClick={handleNext} className="w-full">
                    Next: Profile Information
                  </Button>
                </div>
              )}

              {/* Step 2: Profile Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium">Profile Information</h3>
                    <p className="text-sm text-muted-foreground">Tell us about your business</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="profile.ownerName" className="block text-sm font-medium mb-2">
                        Owner Name *
                      </label>
                      <Input
                        id="profile.ownerName"
                        name="profile.ownerName"
                        type="text"
                        required
                        value={formData.profile.ownerName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="profile.companyName" className="block text-sm font-medium mb-2">
                        Company Name *
                      </label>
                      <Input
                        id="profile.companyName"
                        name="profile.companyName"
                        type="text"
                        required
                        value={formData.profile.companyName}
                        onChange={handleInputChange}
                        placeholder="Doe Enterprises"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="profile.mobileNumber" className="block text-sm font-medium mb-2">
                      Mobile Number *
                    </label>
                    <Input
                      id="profile.mobileNumber"
                      name="profile.mobileNumber"
                      type="tel"
                      required
                      value={formData.profile.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter mobile number"
                      className="w-full"
                    />

                  </div>

                  <div>
                    <label htmlFor="profile.address" className="block text-sm font-medium mb-2">
                      Address *
                    </label>
                    <Textarea
                      id="profile.address"
                      name="profile.address"
                      required
                      value={formData.profile.address}
                      onChange={handleInputChange}
                      placeholder="123 Business Street, City, State - 123456"
                      className="w-full"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="profile.gstNumber" className="block text-sm font-medium mb-2">
                        GST Number (Optional)
                      </label>
                      <Input
                        id="profile.gstNumber"
                        name="profile.gstNumber"
                        type="text"
                        value={formData.profile.gstNumber}
                        onChange={handleInputChange}
                        placeholder="Enter GST number"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="profile.panNumber" className="block text-sm font-medium mb-2">
                        PAN Number (Optional)
                      </label>
                      <Input
                        id="profile.panNumber"
                        name="profile.panNumber"
                        type="text"
                        value={formData.profile.panNumber}
                        onChange={handleInputChange}
                        placeholder="Enter PAN number"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button type="button" onClick={handleBack} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button type="button" onClick={handleNext} className="flex-1">
                      Next: Bank Details
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Bank Details & Terms */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium">Bank Details</h3>
                    <p className="text-sm text-muted-foreground">Optional: Add your banking information</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bank.bankName" className="block text-sm font-medium mb-2">
                        Bank Name
                      </label>
                      <Input
                        id="bank.bankName"
                        name="bank.bankName"
                        type="text"
                        value={formData.bank.bankName}
                        onChange={handleInputChange}
                        placeholder="State Bank of India"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="bank.accountHolderName" className="block text-sm font-medium mb-2">
                        Account Holder Name
                      </label>
                      <Input
                        id="bank.accountHolderName"
                        name="bank.accountHolderName"
                        type="text"
                        value={formData.bank.accountHolderName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bank.accountNumber" className="block text-sm font-medium mb-2">
                        Account Number
                      </label>
                      <Input
                        id="bank.accountNumber"
                        name="bank.accountNumber"
                        type="text"
                        value={formData.bank.accountNumber}
                        onChange={handleInputChange}
                        placeholder="Enter account number"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="bank.ifscCode" className="block text-sm font-medium mb-2">
                        IFSC Code
                      </label>
                      <Input
                        id="bank.ifscCode"
                        name="bank.ifscCode"
                        type="text"
                        value={formData.bank.ifscCode}
                        onChange={handleInputChange}
                        placeholder="Enter IFSC code"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bank.bankBranchName" className="block text-sm font-medium mb-2">
                      Bank Branch Name
                    </label>
                    <Input
                      id="bank.bankBranchName"
                      name="bank.bankBranchName"
                      type="text"
                      value={formData.bank.bankBranchName}
                      onChange={handleInputChange}
                      placeholder="Main Branch"
                      className="w-full"
                    />
                  </div>

                  {/* Terms and conditions */}
                  <div className="flex items-start">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={setAgreedToTerms}
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-muted-foreground cursor-pointer">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:text-primary/90">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:text-primary/90">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <Button type="button" onClick={handleBack} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Creating account...
                        </>
                      ) : (
                        'Create account'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/90 font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  )
}