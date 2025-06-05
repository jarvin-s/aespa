import QuizSummary from '@/components/quiz/summary'
import React from 'react'

const QuizSummaryPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {
    const { id } = await params
    return <QuizSummary id={id} />
}

export default QuizSummaryPage
