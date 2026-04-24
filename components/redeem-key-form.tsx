"use client"

import { useActionState } from "react"
import { redeemLicenseKey, type RedeemResult } from "@/app/actions/redeem"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

const initialState: RedeemResult = {}

export function RedeemKeyForm({ currentKey }: { currentKey?: string | null }) {
    const [state, formAction, isPending] = useActionState(redeemLicenseKey, initialState)

    return (
        <form action={formAction} className="space-y-4">
            {currentKey && (
                <div className="text-xs text-slate-400">
                    Current key:{" "}
                    <span className="font-mono text-slate-300">
                        {currentKey.slice(0, 6)}…{currentKey.slice(-4)}
                    </span>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="licenseKey" className="text-sm font-medium text-white">
                    New License Key
                </Label>
                <Input
                    id="licenseKey"
                    name="licenseKey"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    required
                    autoComplete="off"
                    className="bg-black/40 border-white/10 text-white font-mono placeholder:text-slate-500 focus-visible:ring-purple-500"
                />
                <p className="text-xs text-slate-500">
                    Paste a KeyAuth license key to replace your current one. You will not need to create a new account.
                </p>
            </div>

            {state?.error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-300">{state.error}</p>
                </div>
            )}

            {state?.success && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-green-300">
                        License redeemed successfully
                        {state.expiresAt
                            ? ` — expires ${new Date(state.expiresAt).toLocaleDateString()}`
                            : ""}
                        .
                    </p>
                </div>
            )}

            <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying…
                    </>
                ) : (
                    <>
                        <KeyRound className="w-4 h-4 mr-2" />
                        Redeem Key
                    </>
                )}
            </Button>
        </form>
    )
}
