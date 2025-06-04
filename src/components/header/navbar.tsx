'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Bebas_Neue } from 'next/font/google'
import localFont from 'next/font/local'
import { Button } from '@/components/ui/button'
import { AuthButtons } from '../auth/AuthButtons'

const bebas_neue = Bebas_Neue({
    subsets: ['latin'],
    weight: ['400'],
})

const aespaFont = localFont({
    src: '/../../../public/fonts/aespa_Regular.ttf',
    variable: '--font-aespa',
})

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <nav className='sticky top-0 z-50 w-full py-2 text-white'>
            <div className='mx-auto max-w-7xl px-4'>
                <div className='flex items-center justify-between p-4'>
                    {/* Logo */}
                    <Link href={'/'} className='flex items-center'>
                        <Image
                            src='/images/logo.png'
                            alt='aespa Logo'
                            width={128}
                            height={128}
                            className='rounded-full'
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className='hidden flex-1 md:block'>
                        <div
                            className={cn(
                                'flex items-center justify-center space-x-8 lowercase',
                                aespaFont.className
                            )}
                        >
                            <Link
                                href='/'
                                className={cn(
                                    'rounded-md px-3 py-2 text-4xl font-bold transition-colors hover:text-purple-700'
                                )}
                            >
                                Home
                            </Link>

                            <Link
                                href='/quiz'
                                className={cn(
                                    'rounded-md px-3 py-2 text-4xl font-bold transition-colors hover:text-purple-700'
                                )}
                            >
                                Quiz
                            </Link>
                        </div>
                    </div>

                    <div className='hidden items-center gap-4 md:flex'>
                        <AuthButtons />
                        {/* <Link
                        href='#'
                        className='hidden items-center rounded-lg p-2.5 md:flex'
                    >
                        <Image
                            src='/images/naevis-logo.png'
                            alt='naevis Logo'
                            width={128}
                            height={128}
                            className='rounded-full'
                        />
                    </Link> */}
                    </div>

                    {/* Mobile menu button */}
                    <div
                        className={cn(
                            'flex gap-2 md:hidden',
                            isOpen ? 'hidden' : ''
                        )}
                    >
                        {' '}
                        <AuthButtons />
                        <Button
                            className='group z-[60] flex h-10 flex-col justify-center space-y-1 duration-300 ease-in-out md:hidden'
                            onClick={toggleMenu}
                            aria-label='Toggle menu'
                            variant='ghost'
                        >
                            <div className='relative flex h-2 w-6 justify-end'>
                                <span
                                    className={`absolute block h-[2px] w-6 bg-white/60 transition-all duration-300 ${
                                        isOpen ? 'rotate-45' : ''
                                    }`}
                                ></span>
                                <span
                                    className={`absolute block h-[2px] bg-white/60 transition-all duration-300 ${
                                        isOpen
                                            ? 'w-6 -rotate-45'
                                            : 'ml-auto w-4 translate-y-[6px] group-hover:w-6'
                                    }`}
                                ></span>
                                <span
                                    className={`absolute block h-[2px] w-6 bg-white/60 transition-all duration-300 ${
                                        isOpen
                                            ? 'opacity-0'
                                            : '-translate-y-[6px] opacity-0'
                                    }`}
                                ></span>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-black transition-all duration-300 ease-in-out md:hidden',
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
            >
                <div className='flex items-center justify-between p-8'>
                    <Link href={'/'} className='flex items-center'>
                        <Image
                            src='/images/logo.png'
                            alt='aespa logo'
                            width={128}
                            height={128}
                            className='rounded-full'
                        />
                    </Link>
                    <Button
                        className='group z-[60] flex h-10 flex-col justify-center space-y-1 duration-300 ease-in-out'
                        onClick={toggleMenu}
                        aria-label='Toggle menu'
                        variant='ghost'
                    >
                        <div className='relative flex h-2 w-6 justify-end'>
                            <span
                                className={`absolute block h-[2px] w-6 bg-white/60 transition-all duration-300 ${
                                    isOpen ? 'rotate-45' : ''
                                }`}
                            ></span>
                            <span
                                className={`absolute block h-[2px] bg-white/60 transition-all duration-300 ${
                                    isOpen
                                        ? 'w-6 -rotate-45'
                                        : 'ml-auto w-4 translate-y-[6px] group-hover:w-6'
                                }`}
                            ></span>
                            <span
                                className={`absolute block h-[2px] w-6 bg-white/60 transition-all duration-300 ${
                                    isOpen
                                        ? 'opacity-0'
                                        : '-translate-y-[6px] opacity-0'
                                }`}
                            ></span>
                        </div>
                    </Button>
                </div>
                <div
                    className={`${bebas_neue.className} mt-20 flex h-full flex-col items-center space-y-8 px-4 lowercase ${aespaFont.className}`}
                >
                    <Link
                        href='/'
                        className={cn(
                            'block rounded-md px-3 py-2 text-8xl text-white hover:text-purple-700'
                        )}
                    >
                        Home
                    </Link>
                    <Link
                        href='/quiz'
                        className={cn(
                            'block rounded-md px-3 py-2 text-9xl text-white hover:text-purple-700'
                        )}
                    >
                        Quiz
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
