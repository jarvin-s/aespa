'use client'

import { Bebas_Neue } from 'next/font/google'
import Image from 'next/image'
import { motion } from 'motion/react'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const bebas_neue = Bebas_Neue({
    subsets: ['latin'],
    weight: ['400'],
})

const Members = () => {
    const members = [
        {
            name: 'Karina',
            hangul: '카리나',
            image: '/images/members/karina.png',
            roles: ['Leader', 'Dancer', 'Rapper', 'Visual'],
            description:
                "Karina, born on April 11, 2000, in Suwon, South Korea, is the leader of aespa. Known for her sharp dance moves, powerful rap, and striking visuals, she also takes on vocal duties in the unit GOT the beat. Charismatic and commanding on stage, Karina plays a key role in shaping aespa's bold image. She has also gained attention for her AI-like visuals and strong presence in both music and fashion.",
        },
        {
            name: 'Giselle',
            hangul: '지젤',
            image: '/images/members/giselle.png',
            roles: ['Rapper', 'Vocalist'],
            description:
                'Giselle, born Uchinaga Eri (Japanese: 内永 枝利) / Kim Aeri (김애리), is a South Korean-Japanese member of the girl group aespa. She was born in Seoul and raised in Tokyo, where she attended international schools and became fluent in Korean, Japanese, and English. Before debuting, she was part of her school choir, showing early interest in music and performance.',
        },
        {
            name: 'Winter',
            hangul: '윈트',
            image: '/images/members/winter.png',
            roles: ['Vocalist', 'Dancer', 'Visual'],
            description:
                'Winter was born on January 1, 2001 (age 24) in Busan, South Korea. She is a vocalist, dancer and visual of the girl group aespa and a vocalist and the maknae of the unit GOT the beat. A talented performer known for her clear vocals, graceful dance, and striking visuals, Winter has also contributed to various OSTs and earned global ambassador roles with brands like Polo Ralph Lauren.',
        },
        {
            name: 'Ningning',
            hangul: '닝닝',
            image: '/images/members/ningning.png',
            roles: ['Vocalist', 'Maknae'],
            description:
                'Ningning (Ning Yizhuo; Chinese: 宁艺卓), born October 23, 2002, in Harbin, China, is the main vocalist and maknae of aespa. Known for her powerful voice and vocal stability, she trained under SM Entertainment for several years before debuting in 2020. She also serves as a global ambassador for Versace and Maybelline, highlighting her growing influence in music and fashion.',
        },
    ]

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
    const [nextBtnDisabled, setNextBtnDisabled] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index)
        },
        [emblaApi]
    )

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
        setPrevBtnDisabled(!emblaApi.canScrollPrev())
        setNextBtnDisabled(!emblaApi.canScrollNext())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on('select', onSelect)
        emblaApi.on('reInit', onSelect)
    }, [emblaApi, onSelect])

    const Badge = ({ children }: { children: React.ReactNode }) => {
        return (
            <div className='rounded-full bg-purple-700 px-4 py-1 text-base text-white lg:px-6 lg:py-2 lg:text-xl'>
                {children}
            </div>
        )
    }

    return (
        <div className='members relative min-h-screen overflow-hidden'>
            {/* Navigation Arrows */}
            <button
                onClick={scrollPrev}
                disabled={prevBtnDisabled}
                className={`absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all lg:left-8 lg:p-4 ${
                    prevBtnDisabled
                        ? 'cursor-not-allowed opacity-30'
                        : 'hover:bg-white/20'
                }`}
            >
                <ChevronLeft className='h-6 w-6 text-white lg:h-8 lg:w-8' />
            </button>

            <button
                onClick={scrollNext}
                disabled={nextBtnDisabled}
                className={`absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all lg:right-8 lg:p-4 ${
                    nextBtnDisabled
                        ? 'cursor-not-allowed opacity-30'
                        : 'cursor-pointer hover:bg-white/20'
                }`}
            >
                <ChevronRight className='h-6 w-6 text-white lg:h-8 lg:w-8' />
            </button>

            {/* Slide Indicators */}
            <div className='absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2'>
                {members.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`h-2 w-8 rounded-full transition-all ${
                            index === selectedIndex
                                ? 'bg-white'
                                : 'bg-white/30 hover:bg-white/50'
                        }`}
                    />
                ))}
            </div>

            {/* Embla Carousel */}
            <div className='embla select-none' ref={emblaRef}>
                <div className='embla__container flex'>
                    {members.map((member, index) => (
                        <div
                            key={index}
                            className='embla__slide flex-[0_0_100%]'
                        >
                            {/* Mobile Layout */}
                            <div className='flex flex-col items-center p-4 lg:hidden'>
                                <div className='w-full max-w-sm p-6'>
                                    <div className='relative mb-6 overflow-hidden'>
                                        <Image
                                            src={member.image}
                                            alt={member.name.toLowerCase()}
                                            width={2000}
                                            height={2000}
                                            loading='lazy'
                                        />
                                    </div>
                                    <div className='space-y-4'>
                                        <div className='text-center'>
                                            <h6 className='text-2xl text-white/60'>
                                                {member.hangul}
                                            </h6>
                                            <h1
                                                className={`${bebas_neue.className} text-5xl text-white`}
                                            >
                                                {member.name.toUpperCase()}
                                            </h1>
                                        </div>
                                        <div
                                            className={`${bebas_neue.className} flex flex-wrap justify-center gap-2`}
                                        >
                                            {member.roles.map(
                                                (role, roleIndex) => (
                                                    <Badge key={roleIndex}>
                                                        {role}
                                                    </Badge>
                                                )
                                            )}
                                            <p className='my-4 text-center text-2xl text-white/60'>
                                                {member.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <motion.div
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className='hidden lg:block'
                            >
                                <div className='relative mx-auto mt-10 flex max-w-7xl justify-center gap-20 px-4'>
                                    <div className='flex flex-col'>
                                        <Image
                                            src={member.image}
                                            alt={member.name.toLowerCase()}
                                            width={2000}
                                            height={2000}
                                            loading='lazy'
                                        />
                                    </div>
                                    <div className='flex w-full flex-col'>
                                        <h6 className='text-right text-5xl text-white/60'>
                                            {member.hangul}
                                        </h6>
                                        <h1
                                            className={`${bebas_neue.className} text-right text-[16rem] leading-none text-white`}
                                        >
                                            {member.name.toUpperCase()}
                                        </h1>
                                        <div
                                            className={`${bebas_neue.className} flex flex-wrap justify-end gap-4`}
                                        >
                                            {member.roles.map(
                                                (role, roleIndex) => (
                                                    <Badge key={roleIndex}>
                                                        {role}
                                                    </Badge>
                                                )
                                            )}
                                            <p className='mt-4 text-right text-3xl text-white/60'>
                                                {member.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Members
