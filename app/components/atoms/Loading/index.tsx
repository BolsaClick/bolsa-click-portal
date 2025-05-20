import './styles.css'

const LoadingBounce = () => {
  return (
    <div className=" flex justify-center items-center">
      <div className="loader  p-2 rounded-full flex space-x-3">
        <div className="w-2 h-2 bg-bolsa-secondary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-bolsa-secondary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-bolsa-secondary rounded-full animate-bounce"></div>
      </div>
    </div>
  )
}

export default LoadingBounce
