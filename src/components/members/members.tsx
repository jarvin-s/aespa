'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const Members = () => {
    const [openStates, setOpenStates] = useState(Array(4).fill(false))
    const members = [
        {
            name: 'Winter',
            hangul: '윈터',
            closedImage: '/images/members/winter.png',
            openImage: '/images/members/winter-open.jpg',
        },
        {
            name: 'Karina',
            hangul: '카리나',
            closedImage: '/images/members/winter.png',
            openImage: '/images/members/winter-open.jpg',
        },
        {
            name: 'Ningning',
            hangul: '닝닝',
            closedImage: '/images/members/ningning.png',
            openImage: '/images/members/ningning-open.jpg',
        },
        {
            name: 'Giselle',
            hangul: '지젤',
            closedImage: '/images/members/giselle.png',
            openImage: '/images/members/giselle-open.jpg',
        },
    ]

    const handleOpen = (index: number) => {
        setOpenStates((prev) =>
            prev.map((state, i) => (i === index ? !state : false))
        )
    }

    return (
        <div className='min-h-screen overflow-hidden'>
            <div className='absolute inset-0 z-[-1] blur-[6px]'>
                <Image
                    src='/images/members/set-bg.jpg'
                    alt='aespa members'
                    fill
                    className='object-cover'
                />
            </div>
            <div className='flex min-h-screen  justify-center py-10'>
                <motion.div className='flex flex-wrap justify-center gap-10'>
                    {members.map((member, index) => (
                        <motion.div
                            key={index}
                            className={`relative flex cursor-pointer items-start ${
                                openStates[index]
                                    ? 'min-w-[600px]'
                                    : 'w-[200px]'
                            }`}
                            onClick={() => handleOpen(index)}
                            transition={{
                                layout: {
                                    duration: 0.6,
                                    type: 'spring',
                                    bounce: 0.2,
                                },
                            }}
                        >
                            <motion.div className='flex w-full flex-col md:flex-row'>
                                <AnimatePresence mode='wait'>
                                    {!openStates[index] ? (
                                        <motion.div
                                            key={`closed-${index}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className='relative aspect-square w-[200px]'
                                        >
                                            <Image
                                                src={member.closedImage}
                                                alt={member.name}
                                                width={200}
                                                height={200}
                                                className='rounded-md object-cover'
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={`open-${index}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className='relative aspect-square w-[200px]'
                                        >
                                            <Image
                                                src={member.openImage}
                                                alt={member.name}
                                                width={200}
                                                height={200}
                                                className='rounded-md object-cover'
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {openStates[index] && (
                                        <motion.div
                                            className='flex flex-1 flex-col justify-center p-8'
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 0.3,
                                            }}
                                        >
                                            <motion.h2
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className='text-4xl font-light text-white/70'
                                            >
                                                {member.hangul}
                                            </motion.h2>
                                            <motion.h1
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className='text-6xl font-bold text-white uppercase'
                                            >
                                                {member.name}
                                            </motion.h1>
                                            <motion.p
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                                className='max-w-lg text-lg text-white/70'
                                            >
                                                Lorem ipsum dolor sit amet
                                                consectetur adipisicing elit.
                                                Quisquam voluptatum, voluptate,
                                                quibusdam, voluptas voluptatibus
                                                quas quod quae.
                                            </motion.p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

export default Members
