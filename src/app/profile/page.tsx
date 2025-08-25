"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    ownerName: '',
    companyName: '',
    mobileNumber: '',
    address: '',
    gstNumber: '',
    panNumber: ''
  })
  
  // Bank form state
  const [bankData, setBankData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankBranchName: ''
  })
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // UI state
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingBank, setIsLoadingBank] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [bankError, setBankError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [bankSuccess, setBankSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        ownerName: user.profile?.ownerName || '',
        companyName: user.profile?.companyName || '',
        mobileNumber: user.profile?.mobileNumber || '',
        address: user.profile?.address || '',
        gstNumber: user.profile?.gstNumber || '',
        panNumber: user.profile?.panNumber || ''
      })
      
      setBankData({
        bankName: user.bank?.bankName || '',
        accountHolderName: user.bank?.accountHolderName || '',
        accountNumber: user.bank?.accountNumber || '',
        ifscCode: user.bank?.ifscCode || '',
        bankBranchName: user.bank?.bankBranchName || ''
      })
    }
  }, [user])

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Handle bank form changes
  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Update profile
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingProfile(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      const response = await apiClient.updateProfile(user!.id, profileData)
      
      if (response.success && response.data) {
        setProfileSuccess('Profile updated successfully!')
        
        // Update local storage immediately with new data
        apiClient.setUserData(response.data)
        localStorage.setItem('user_data_timestamp', Date.now().toString())
        
        // Refresh user context with cached data (no server call)
        await refreshUser()
      } else {
        setProfileError(response.error || 'Failed to update profile')
      }
    } catch (error) {
      setProfileError('An unexpected error occurred')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Update bank details
  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingBank(true)
    setBankError('')
    setBankSuccess('')

    try {
      const response = await apiClient.updateBankDetails(user!.id, bankData)
      
      if (response.success && response.data) {
        setBankSuccess('Bank details updated successfully!')
        
        // Update local storage immediately with new data
        apiClient.setUserData(response.data)
        localStorage.setItem('user_data_timestamp', Date.now().toString())
        
        // Refresh user context with cached data (no server call)
        await refreshUser()
      } else {
        setBankError(response.error || 'Failed to update bank details')
      }
    } catch (error) {
      setBankError('An unexpected error occurred')
    } finally {
      setIsLoadingBank(false)
    }
  }

  // Update password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingPassword(true)
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match")
      setIsLoadingPassword(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long")
      setIsLoadingPassword(false)
      return
    }

    try {
      const response = await apiClient.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      )
      
      if (response.success) {
        setPasswordSuccess('Password updated successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setPasswordError(response.error || 'Failed to update password')
      }
    } catch (error) {
      setPasswordError('An unexpected error occurred')
    } finally {
      setIsLoadingPassword(false)
    }
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
          <p className="text-muted-foreground">
            Manage your account information, bank details, and security settings.
          </p>
        </div>

        {/* Account Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Account Overview
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline">{user.role}</Badge>
            </CardTitle>
            <CardDescription>
              Your account information and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique ID</p>
                <p className="text-sm font-mono">{user.uniqueid}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your business and personal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profileError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{profileError}</AlertDescription>
              </Alert>
            )}
            {profileSuccess && (
              <Alert className="mb-4">
                <AlertDescription>{profileSuccess}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium mb-2">
                    Owner Name *
                  </label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    value={profileData.ownerName}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                    Company Name *
                  </label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={profileData.companyName}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium mb-2">
                  Mobile Number *
                </label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  value={profileData.mobileNumber}
                  onChange={handleProfileChange}
                  maxLength={10}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  10-digit mobile number starting with 6-9
                </p>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-2">
                  Address *
                </label>
                <Textarea
                  id="address"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gstNumber" className="block text-sm font-medium mb-2">
                    GST Number (Optional)
                  </label>
                  <Input
                    id="gstNumber"
                    name="gstNumber"
                    value={profileData.gstNumber}
                    onChange={handleProfileChange}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </div>
                <div>
                  <label htmlFor="panNumber" className="block text-sm font-medium mb-2">
                    PAN Number (Optional)
                  </label>
                  <Input
                    id="panNumber"
                    name="panNumber"
                    value={profileData.panNumber}
                    onChange={handleProfileChange}
                    placeholder="AAAAA0000A"
                    maxLength={10}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoadingProfile}>
                {isLoadingProfile ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
            <CardDescription>
              Manage your banking information for transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bankError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{bankError}</AlertDescription>
              </Alert>
            )}
            {bankSuccess && (
              <Alert className="mb-4">
                <AlertDescription>{bankSuccess}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium mb-2">
                    Bank Name
                  </label>
                  <Input
                    id="bankName"
                    name="bankName"
                    value={bankData.bankName}
                    onChange={handleBankChange}
                    placeholder="State Bank of India"
                  />
                </div>
                <div>
                  <label htmlFor="accountHolderName" className="block text-sm font-medium mb-2">
                    Account Holder Name
                  </label>
                  <Input
                    id="accountHolderName"
                    name="accountHolderName"
                    value={bankData.accountHolderName}
                    onChange={handleBankChange}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium mb-2">
                    Account Number
                  </label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    value={bankData.accountNumber}
                    onChange={handleBankChange}
                    placeholder="123456789012345"
                  />
                </div>
                <div>
                  <label htmlFor="ifscCode" className="block text-sm font-medium mb-2">
                    IFSC Code
                  </label>
                  <Input
                    id="ifscCode"
                    name="ifscCode"
                    value={bankData.ifscCode}
                    onChange={handleBankChange}
                    placeholder="SBIN0001234"
                    maxLength={11}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bankBranchName" className="block text-sm font-medium mb-2">
                  Bank Branch Name
                </label>
                <Input
                  id="bankBranchName"
                  name="bankBranchName"
                  value={bankData.bankBranchName}
                  onChange={handleBankChange}
                  placeholder="Main Branch"
                />
              </div>

              <Button type="submit" disabled={isLoadingBank}>
                {isLoadingBank ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Bank Details'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Update */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password for security
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            {passwordSuccess && (
              <Alert className="mb-4">
                <AlertDescription>{passwordSuccess}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                  Current Password *
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                  New Password *
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm New Password *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <Button type="submit" disabled={isLoadingPassword}>
                {isLoadingPassword ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Additional account management options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Last Login</h4>
                <p className="text-sm text-muted-foreground">
                  {user.lastLogin 
                    ? new Date(user.lastLogin).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Account Status</h4>
                <p className="text-sm text-muted-foreground">
                  Your account is currently {user.isActive ? 'active' : 'inactive'}
                </p>
              </div>
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  )
}