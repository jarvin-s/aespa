'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'

const Hero = () => {
    useEffect(() => {
        const video = document.getElementById('hero-video') as HTMLVideoElement
        if (video) {
            setTimeout(() => {
                video.play().catch((error) => {
                    console.error('Video playback failed:', error)
                })
            }, 2800)
        }
    }, [])

    return (
        <>
            <div className='relative flex w-screen flex-col items-center justify-center overflow-x-hidden text-white'>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 2.5, delay: 0.5 }}
                    className='flex h-[80vh] items-center justify-center overflow-hidden'
                >
                    <Image
                        src='/images/logo.png'
                        alt='aespa logo'
                        width={1000}
                        height={1000}
                    />
                </motion.div>
            </div>

            {/* AESPA VIDEO */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 2.5 }}
                className='absolute top-0 left-0 z-[-1] size-full'
            >
                <video
                    muted
                    loop
                    playsInline
                    preload='auto'
                    id='hero-video'
                    className='size-full object-cover object-center'
                >
                    <source src='/videos/hero-1.webm' type='video/webm' />
                    <source src='/videos/hero-1.mp4' type='video/mp4' />
                    Your browser does not support the video tag.
                </video>
                <div className='absolute inset-0 bg-gradient-to-t from-black/100 via-black/40 to-black' />
            </motion.div>
        </>
    )
}

export default Hero
