"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react"
import { changeOwnPassword } from "@/app/actions/user"
import { toast } from "@/components/ui/use-toast"

export function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword.length < 6) {
            toast({
                title: "Invalid Password",
                description: "New password must be at least 6 characters",
                variant: "destructive",
            })
            return
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Passwords Don't Match",
                description: "Please make sure your new password and confirmation match.",
                variant: "destructive",
            })
            return
        }

        try {
            setSaving(true)
            await changeOwnPassword(currentPassword, newPassword)
            toast({
                title: "Password Changed",
                description: "Your password has been updated successfully.",
            })
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to change password",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                    <Input
                        id="current-password"
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        required
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrent(!showCurrent)}
                    >
                        {showCurrent ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                    <Input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        required
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNew(!showNew)}
                    >
                        {showNew ? (
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
                    type={showNew ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    required
                />
            </div>

            <Button
                type="submit"
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="gap-2"
            >
                {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <ShieldCheck className="h-4 w-4" />
                )}
                {saving ? "Updating..." : "Update Password"}
            </Button>
        </form>
    )
}
