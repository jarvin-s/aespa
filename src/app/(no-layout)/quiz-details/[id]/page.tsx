import QuizDetails from '@/components/quiz/quiz-details'
import React from 'react'

const QuizDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    return <QuizDetails id={id} />
}

export default QuizDetailsPage
