import React from 'react'
import Image from 'next/image'

const Hero = () => {
    return (
        <>
            <div className='relative flex w-screen flex-col items-center justify-center overflow-x-hidden text-white'>
                <div className='mt-40 overflow-hidden'>
                    <Image
                        src='/images/logo.png'
                        alt='aespa'
                        width={600}
                        height={600}
                    />
                </div>
            </div>
            {/* AESPA VIDEO (BLACK MAMBA) */}
            <div className='absolute top-0 left-0 z-[-1] size-full'>
                <video
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload='auto'
                    className='size-full object-cover object-center'
                >
                    <source src='/videos/hero-1.mp4' type='video/mp4' />
                    <source src='/videos/hero-1.webm' type='video/webm' />
                    Your browser does not support the video tag.
                </video>
                <div className='absolute inset-0 bg-gradient-to-t from-black/100 to-transparent'></div>
            </div>
        </>
    )
}

export default Hero
