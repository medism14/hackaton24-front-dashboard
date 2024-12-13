import React from 'react'

const Loader = () => {
  return (
    <div className="flex flex-1 items-center justify-center h-full">
      <div className="relative">
        {/* Cercle principal */}
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#2ECC71]"></div>
        
        {/* Cercle secondaire */}
        <div className="absolute top-2 left-2 animate-spin rounded-full h-28 w-28 border-t-2 border-b-2 border-[#27AE60] animation-delay-150"></div>
        
        {/* Cercle tertiaire */}
        <div className="absolute top-4 left-4 animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-[#219653] animation-delay-300"></div>
        
        {/* Message de chargement */}
        <div className="absolute w-full text-center mt-[15px] text-[#2ECC71] font-medium">
          Chargement...
        </div>
      </div>
    </div>
  )
}

export default Loader