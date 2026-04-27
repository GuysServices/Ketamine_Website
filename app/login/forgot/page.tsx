'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Turnstile from 'react-turnstile'
import { useRouter } from 'next/navigation'
import { requestPasswordReset, confirmPasswordReset } from '@/app/actions/forgot-password'
import { Loader2, Eye, EyeOff } from 'lucide-react'

type Step = 'request' | 'verify'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('request')

    const [username, setUsername] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const [turnstileToken, setTurnstileToken] = useState('')
    const [turnstileKey, setTurnstileKey] = useState(0)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')

    const resetTurnstile = () => {
        setTurnstileToken('')
        setTurnstileKey((k) => k + 1)
    }

    const isDev = process.env.NODE_ENV !== 'production'

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setInfo('')

        if (!isDev && !turnstileToken) {
            setError('Please complete the Turnstile challenge.')
            return
        }

        try {
            setLoading(true)
            const res = await requestPasswordReset(username, turnstileToken)
            setInfo(res.message)
            setStep('verify')
            resetTurnstile()
        } catch (err: any) {
            setError(err?.message || 'Failed to request password reset')
            resetTurnstile()
        } finally {
            setLoading(false)
        }
    }

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setInfo('')

        if (!isDev && !turnstileToken) {
            setError('Please complete the Turnstile challenge.')
            return
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.')
            return
        }
        if (!/^\d{6}$/.test(code)) {
            setError('Code must be 6 digits.')
            return
        }

        try {
            setLoading(true)
            await confirmPasswordReset(username, code, newPassword, turnstileToken)
            router.push('/login?reset=1')
        } catch (err: any) {
            setError(err?.message || 'Failed to reset password')
            resetTurnstile()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>
                        {step === 'request'
                            ? 'Enter your username and we\'ll DM a reset code to your linked Discord account.'
                            : 'Enter the 6-digit code you received in Discord and choose a new password.'}
                    </CardDescription>
                </CardHeader>

                {step === 'request' ? (
                    <form onSubmit={handleRequest}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div className="flex justify-center py-2">
                                <Turnstile
                                    key={turnstileKey}
                                    sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || ''}
                                    onVerify={(token) => setTurnstileToken(token)}
                                />
                            </div>

                            {error && <p className="text-sm text-destructive">{error}</p>}
                            {info && <p className="text-sm text-green-400">{info}</p>}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2 gap-2">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </Button>
                            <p className="text-sm text-muted-foreground text-center">
                                Remembered it? <Link href="/login" className="text-primary hover:underline">Back to login</Link>
                            </p>
                        </CardFooter>
                    </form>
                ) : (
                    <form onSubmit={handleConfirm}>
                        <CardContent className="space-y-4">
                            {info && <p className="text-sm text-green-400">{info}</p>}

                            <div className="space-y-2">
                                <Label htmlFor="code">6-Digit Code</Label>
                                <Input
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    inputMode="numeric"
                                    pattern="\d{6}"
                                    maxLength={6}
                                    required
                                    className="font-mono tracking-[0.5em] text-center text-lg"
                                    placeholder="000000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword((s) => !s)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input
                                    id="confirm-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="flex justify-center py-2">
                                <Turnstile
                                    key={turnstileKey}
                                    sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || ''}
                                    onVerify={(token) => setTurnstileToken(token)}
                                />
                            </div>

                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2 gap-2">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                disabled={loading}
                                onClick={() => {
                                    setStep('request')
                                    setCode('')
                                    setNewPassword('')
                                    setConfirmPassword('')
                                    setError('')
                                    setInfo('')
                                    resetTurnstile()
                                }}
                            >
                                Resend code / change username
                            </Button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    )
}
