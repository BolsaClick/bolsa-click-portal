interface StepProgressProps {
  currentStep: number
  totalSteps: number
}

const Step = ({ currentStep, totalSteps }: StepProgressProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="mb-6 w-full">
      <p className="text-sm text-gray-600 mb-2">
        Passo <span className="font-semibold">{currentStep}</span> de{' '}
        {totalSteps}
      </p>
      <div className="h-2 w-full bg-gray-200 rounded">
        <div
          className="h-2 bg-bolsa-secondary rounded"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  )
}

export default Step
