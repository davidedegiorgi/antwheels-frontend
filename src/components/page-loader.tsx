export default function PageLoader() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center px-8">
      <div className="h-px w-full max-w-sm overflow-hidden bg-white/10">
        <div className="h-full w-1/2 bg-white animate-loader-line" />
      </div>
    </div>
  )
}
