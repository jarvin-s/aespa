'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Lightning from '@/app/components/Lightning/Lightning'

const Members = () => {
    const [openStates, setOpenStates] = useState(Array(4).fill(false))
    const members = [
        {
            name: 'Winter',
            hangul: '윈터',
            closedImage: '/images/members/winter-closed.jpg',
            openImage: '/images/members/winter-open.jpg',
        },
        {
            name: 'Karina',
            hangul: '카리나',
            closedImage: '/images/members/karina-closed.jpg',
            openImage: '/images/members/karina-open.jpg',
        },
        {
            name: 'Ningning',
            hangul: '닝닝',
            closedImage: '/images/members/ningning-closed.jpg',
            openImage: '/images/members/ningning-open.jpg',
        },
        {
            name: 'Giselle',
            hangul: '지젤',
            closedImage: '/images/members/giselle-closed.jpg',
            openImage: '/images/members/giselle-open.jpg',
        },
    ]

    const handleOpen = (index: number) => {
        setOpenStates((prev) =>
            prev.map((state, i) => (i === index ? !state : false))
        )
    }

    const isAnyOpen = openStates.some((state) => state)

    return (
        <div className='min-h-screen overflow-hidden'>
            <div className='fixed inset-0 z-[-1]'>
                <Lightning />
            </div>
            <motion.div className='flex flex-col items-center justify-center gap-8 lg:flex-row'>
                {members.map((member, index) => (
                    <motion.div
                        key={index}
                        className={`relative flex cursor-pointer items-start`}
                        onClick={() => handleOpen(index)}
                    >
                        <motion.div className='flex w-full flex-col lg:flex-row'>
                            <AnimatePresence mode='wait'>
                                {!openStates[index] ? (
                                    <motion.div
                                        key={`closed-${index}`}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: isAnyOpen ? 0.8 : 1,
                                        }}
                                        exit={{ opacity: 0, y: 40 }}
                                        transition={{ duration: 0.5 }}
                                        className='relative aspect-square'
                                    >
                                        <Image
                                            src={member.closedImage}
                                            alt={member.name}
                                            width={300}
                                            height={300}
                                            className={`rounded-md object-cover ${isAnyOpen && !openStates[index] ? 'opacity-50' : ''}`}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={`open-${index}`}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 40 }}
                                        transition={{ duration: 0.5 }}
                                        className='flex justify-center'
                                    >
                                        <Image
                                            src={member.openImage}
                                            alt={member.name}
                                            width={300}
                                            height={300}
                                            className='rounded-md object-cover'
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {openStates[index] && (
                                    <motion.div
                                        className='flex flex-1 flex-col justify-center p-12'
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
    )
}

export default Members
