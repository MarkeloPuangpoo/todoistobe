'use client';

import { Loader2 } from 'lucide-react';
import LoginButton from '@/components/LoginButton';

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#F9FAFB] dark:bg-black transition-colors">
            <div className="relative z-10 w-full max-w-[360px] p-6">
                <div className="mb-10 text-center">
                    <div className="mx-auto mb-6 h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20" />
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                        Sign in to access your boards
                    </p>
                </div>

                <div className="flex flex-col gap-4">

                    <LoginButton />

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-slate-400 dark:text-zinc-500">OR</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
                        <button disabled className="h-10 w-full rounded-lg bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all">
                            Continue with Email
                        </button>
                        <p className="text-center text-xs text-slate-400 dark:text-zinc-500 mt-2">
                            Email login coming soon
                        </p>
                    </form>

                </div>
            </div>

            {/* Background Noise/Gradient */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 dark:opacity-20 dark:invert"></div>
                <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-500/20"></div>
                <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[100px] dark:bg-violet-500/20"></div>
            </div>
        </div>
    );
}
