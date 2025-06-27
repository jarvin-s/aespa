'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
    Trophy,
    Image as ImageIcon,
    LayoutDashboard,
    Menu,
    X,
    ChevronsRight,
    ChevronsLeft,
    MessageCircleQuestionIcon,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setIsMobileOpen(false)
    }, [pathname])

    const navItems = [
        {
            href: '/dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
        },
        {
            href: '/quiz',
            icon: MessageCircleQuestionIcon,
            label: 'Quiz',
        },
        {
            href: '/leaderboard',
            icon: Trophy,
            label: 'Leaderboard',
        },
        {
            href: '/photocards',
            icon: ImageIcon,
            label: 'Photocards',
        },
    ]

    return (
        <>
            <button
                onClick={() => {
                    setIsMobileOpen(!isMobileOpen)
                    if (!isMobileOpen) {
                        setIsCollapsed(false)
                    }
                }}
                className='fixed top-4 left-4 z-50 rounded-lg p-2 text-white backdrop-blur-lg transition-all hover:text-white/60 md:hidden'
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div
                className={cn(
                    'fixed top-0 left-0 z-40 h-screen flex-col bg-purple-700/10 backdrop-blur-[10px] transition-all duration-300 md:flex',
                    isMobileOpen ? 'flex' : 'hidden md:flex',
                    isCollapsed ? 'w-auto' : 'w-[360px] md:w-[300px]'
                )}
            >
                <div className='absolute top-4 left-28 items-center px-4 md:left-16 md:flex'>
                    {!isCollapsed && (
                        <span className='text-lg font-bold text-white'>
                            <Image
                                src='/images/logo.png'
                                alt='aespa logo'
                                width={125}
                                height={125}
                            />
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        'absolute top-4 hidden cursor-pointer rounded-md p-2 text-white transition-all duration-150 hover:bg-gray-200/20 md:block',
                        isCollapsed ? 'right-1/2 translate-x-1/2' : 'right-2'
                    )}
                >
                    {isCollapsed ? (
                        <ChevronsRight size={20} />
                    ) : (
                        <ChevronsLeft size={20} />
                    )}
                </button>

                <div className='mt-24 flex flex-col gap-2 p-4'>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-4 rounded-lg p-3 text-white transition-all hover:bg-white/10',
                                    isActive && 'bg-white/10'
                                )}
                            >
                                <Icon />
                                {!isCollapsed && (
                                    <span className='text-sm font-medium'>
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {isMobileOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileOpen(false)}
                    className='fixed inset-0 z-30 bg-black/90 md:hidden'
                />
            )}
        </>
    )
}
