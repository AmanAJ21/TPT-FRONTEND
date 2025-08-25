"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Header from '@/components/comp-577'
import Footer from "@/components/footer"
import { apiClient } from "@/lib/api"

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const response = await apiClient.requestPasswordReset(email)
            
            if (response.success) {
                setIsSubmitted(true)
            } else {
                setError(response.error || 'Failed to send reset email. Please try again.')
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center bg-background px-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                                <svg
                                    className="h-6 w-6 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <CardTitle className="text-3xl">Check your email</CardTitle>
                            <CardDescription>
                                We've sent a new password to
                            </CardDescription>
                            <p className="text-sm font-medium">{email}</p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <h3 className="text-sm font-medium mb-2">Didn't receive the email?</h3>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>• Check your spam folder</li>
                                    <li>• Make sure you entered the correct email address</li>
                                    <li>• The email with your new password may take a few minutes to arrive</li>
                                    <li>• Use the new password to log in, then change it to something memorable</li>
                                </ul>
                            </div>

                            <Button
                                onClick={() => setIsSubmitted(false)}
                                variant="outline"
                                className="w-full"
                            >
                                Try a different email
                            </Button>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-sm text-primary hover:text-primary/90"
                                >
                                    Back to sign in
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Reset your password</CardTitle>
                        <CardDescription>
                            Enter your email address and we'll send you a new password
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email address
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    'Send new password'
                                )}
                            </Button>
                        </form>

                        <div className="text-center mt-6">
                            <Link
                                href="/login"
                                className="text-sm text-primary hover:text-primary/90 inline-flex items-center"
                            >
                                <svg
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Back to sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </>
    )
}