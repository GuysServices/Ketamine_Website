"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Palette } from "lucide-react"
import { updateResellerProfile } from "@/app/actions/reseller-profile"
import { toast } from "@/components/ui/use-toast"

const PRESET_COLORS = [
    "#5865F2", // Discord blurple
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#a855f7", // purple
    "#06b6d4", // cyan
    "#ec4899", // pink
    "#cd7f32", // bronze
]

export function ProfileForm({
    initial,
}: {
    initial: {
        displayName: string | null
        bannerColor: string | null
        paymentInfo: string | null
        username: string
    }
}) {
    const [isPending, startTransition] = useTransition()
    const [displayName, setDisplayName] = useState(initial.displayName ?? "")
    const [bannerColor, setBannerColor] = useState(initial.bannerColor ?? "")
    const [paymentInfo, setPaymentInfo] = useState(initial.paymentInfo ?? "")

    const onSave = () => {
        startTransition(async () => {
            try {
                await updateResellerProfile({ displayName, bannerColor, paymentInfo })
                toast({ title: "Profile saved" })
            } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" })
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Live preview */}
            <Card
                className="border-2 transition-colors"
                style={bannerColor ? { borderColor: `${bannerColor}80` } : undefined}
            >
                <CardContent
                    className="p-6 rounded-t-lg"
                    style={{
                        background: bannerColor
                            ? `linear-gradient(135deg, ${bannerColor}33 0%, ${bannerColor}11 100%)`
                            : undefined,
                    }}
                >
                    <p className="text-xs text-muted-foreground mb-1">Preview</p>
                    <h2 className="text-2xl font-bold">
                        {displayName.trim() || initial.username}
                    </h2>
                    {paymentInfo && (
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{paymentInfo}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Display Name</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                        Override your Discord username on your dashboard. Max 50 chars.
                    </Label>
                    <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={initial.username}
                        maxLength={50}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Palette className="h-4 w-4" /> Banner Color
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setBannerColor(c)}
                                className={`h-9 w-9 rounded-full border-2 transition-all ${bannerColor === c ? "border-white scale-110" : "border-white/20 hover:border-white/40"}`}
                                style={{ backgroundColor: c }}
                                aria-label={`Set color ${c}`}
                            />
                        ))}
                        <button
                            type="button"
                            onClick={() => setBannerColor("")}
                            className={`h-9 px-3 rounded-full border-2 text-xs transition-all ${!bannerColor ? "border-white" : "border-white/20 hover:border-white/40"}`}
                        >
                            None
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground flex-shrink-0">Custom hex:</Label>
                        <Input
                            value={bannerColor}
                            onChange={(e) => setBannerColor(e.target.value)}
                            placeholder="#5865F2"
                            className="font-mono"
                            maxLength={7}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Payment Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                        Optional: how customers can pay you (Discord tag, PayPal link, crypto address). Shown on your dashboard. Max 500 chars.
                    </Label>
                    <textarea
                        value={paymentInfo}
                        onChange={(e) => setPaymentInfo(e.target.value)}
                        placeholder={"Discord: yourname#1234\nPayPal: paypal.me/yourname\nCrypto: 0x..."}
                        rows={5}
                        maxLength={500}
                        className="w-full rounded-md border border-white/10 bg-black/40 p-3 text-sm focus:outline-none focus:border-primary/50 font-mono"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {paymentInfo.length} / 500
                    </p>
                </CardContent>
            </Card>

            <Button onClick={onSave} disabled={isPending} size="lg" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isPending ? "Saving..." : "Save Changes"}
            </Button>
        </div>
    )
}
