'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, Download, Loader2, ArrowRight } from 'lucide-react';
import { shareBoardData, getSharedData } from '@/app/actions/share';
import { Column, Task } from '@/types/kanban';

interface ShareImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'share' | 'import';
    tasks: Task[];
    columns: Column[];
    onImportSuccess: (data: { tasks: Task[]; columns?: Column[] }) => void;
}

export function ShareImportModal({
    isOpen,
    onClose,
    initialMode = 'share',
    tasks,
    columns,
    onImportSuccess,
}: ShareImportModalProps) {
    const [mode, setMode] = useState<'share' | 'import'>(initialMode);
    const [shareCode, setShareCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [importCode, setImportCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Confirmation State
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmInput, setConfirmInput] = useState('');
    const [pendingImportData, setPendingImportData] = useState<{ tasks: Task[]; columns?: Column[] } | null>(null);

    useEffect(() => {
        if (isOpen && initialMode) {
            setMode(initialMode);
            resetState();
        }
    }, [isOpen, initialMode]);

    const resetState = () => {
        setShareCode(null);
        setError(null);
        setImportCode('');
        setIsLoading(false);
        setIsConfirming(false);
        setConfirmInput('');
        setPendingImportData(null);
    };

    if (!isOpen) return null;

    const handleCopy = async () => {
        if (shareCode) {
            await navigator.clipboard.writeText(shareCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleGenerateCode = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await shareBoardData({ tasks, columns });
            if (result.success && result.code) {
                setShareCode(result.code);
            } else {
                setError('Failed to generate code. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while generating the code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (importCode.length !== 6) {
            setError('Code must be 6 characters long.');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await getSharedData(importCode);
            if (result.success && result.data) {
                setPendingImportData(result.data);
                setIsConfirming(true);
            } else {
                setError(result.message || 'Failed to import. Check the code.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during import.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalImport = () => {
        if (confirmInput !== 'CONFIRM') return;

        if (pendingImportData) {
            onImportSuccess(pendingImportData);
            onClose();
        }
    };

    const handleBackFromConfirm = () => {
        setIsConfirming(false);
        setPendingImportData(null);
        setConfirmInput('');
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header / Tabs */}
                <div className="flex items-center justify-between p-2 border-b border-border/50">
                    <div className="flex p-1 bg-muted rounded-xl w-full max-w-[240px]">
                        <button
                            onClick={() => { setMode('share'); resetState(); }}
                            disabled={isConfirming}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${mode === 'share'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                } ${isConfirming ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Share2 size={14} />
                            Share
                        </button>
                        <button
                            onClick={() => { setMode('import'); resetState(); }}
                            disabled={isConfirming}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${mode === 'import'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                } ${isConfirming ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Download size={14} />
                            Import
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {mode === 'share' ? (
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Share this Board
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-[280px]">
                                    Generate a temporary code to share your current board state with others.
                                </p>
                            </div>

                            {shareCode ? (
                                <div className="w-full space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                                    <div
                                        onClick={handleCopy}
                                        className="group relative flex items-center justify-center h-20 bg-muted/50 rounded-xl border-2 border-dashed border-border hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 cursor-pointer transition-all duration-200"
                                    >
                                        <span className="text-3xl font-mono font-bold tracking-wider text-foreground group-hover:scale-105 transition-transform">
                                            {shareCode}
                                        </span>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-muted-foreground" />}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Code expires in 30 minutes
                                    </p>
                                    <button
                                        onClick={handleCopy}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/10"
                                    >
                                        {copied ? 'Copied!' : 'Copy Code'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleGenerateCode}
                                    disabled={isLoading}
                                    className="group relative w-full h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-muted/50 to-muted/80 border border-border rounded-xl hover:shadow-md transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                    ) : (
                                        <>
                                            <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200">
                                                <Share2 className="w-6 h-6 text-indigo-500" />
                                            </div>
                                            <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">Generate New Code</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : isConfirming ? (
                        <div className="flex flex-col space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-500">
                                    ⚠️ Overwrite Warning
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    This will permanently delete your current board data and replace it with the imported data.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase text-center">
                                        Type "CONFIRM" to proceed
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmInput}
                                        onChange={(e) => setConfirmInput(e.target.value)}
                                        placeholder="CONFIRM"
                                        className="w-full text-center text-xl font-bold py-3 bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-200 dark:border-rose-800 rounded-xl focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 placeholder:text-rose-200 dark:placeholder:text-rose-800/50 text-rose-600 dark:text-rose-500 transition-all"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleBackFromConfirm}
                                        className="flex-1 py-3 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleFinalImport}
                                        disabled={confirmInput !== 'CONFIRM'}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                                    >
                                        Overwrite
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-6 animate-in slide-in-from-left-4 duration-300">
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Import Board
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Enter a 6-character code to import a board configuration.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={importCode}
                                        onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER CODE"
                                        className="w-full text-center text-2xl font-mono font-bold tracking-[0.5em] py-4 bg-muted/50 border-2 border-border rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 placeholder:text-muted-foreground/50 transition-all uppercase"
                                    />
                                    {error && (
                                        <p className="mt-2 text-xs text-center text-rose-500 font-medium animate-in slide-in-from-top-1">
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleVerifyCode}
                                    disabled={isLoading || importCode.length !== 6}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            <span>Verify Code</span>
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
