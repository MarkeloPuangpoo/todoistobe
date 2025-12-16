'use client'
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <button
            onClick={handleLogout}
            className="glass-button flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md text-xs font-medium transition-colors border border-destructive/20"
            title="Sign Out"
        >
            <LogOut size={14} />
            <span>Logout</span>
        </button>
    )
}
