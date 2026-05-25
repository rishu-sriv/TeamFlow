export default function InfoTooltip({ text, position = 'top' }) {
  const popupCls =
    position === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      : 'top-full left-1/2 -translate-x-1/2 mt-2'
  const arrowCls =
    position === 'top'
      ? 'top-full left-1/2 -translate-x-1/2 border-t-gray-800'
      : 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800'

  return (
    <div className="relative group inline-flex items-center">
      <span className="w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 text-[9px] font-bold flex items-center justify-center cursor-help select-none border border-gray-200 hover:bg-gray-200 transition-colors">
        i
      </span>
      <div className={`absolute ${popupCls} w-52 bg-gray-800 text-white text-[10px] rounded-xl px-3 py-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-lg`}>
        {text}
        <div className={`absolute border-4 border-transparent ${arrowCls}`} />
      </div>
    </div>
  )
}
