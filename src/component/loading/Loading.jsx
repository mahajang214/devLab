import React from 'react'
import { ScaleLoader, RiseLoader, HashLoader } from "react-spinners";

function Loading({ loaderType, loadingStyle }) {
  return (
    <div className={`absolute  inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-gray-900 ${loadingStyle || ''}`}>
      {loaderType === "editor" && (
        <ScaleLoader
          color="#3B82F6"
          height={55}
          width={5}
          margin={2}
          radius={50}
          speedMultiplier={0.8}
        />
      )}
      {loaderType === "ai" && (
        <RiseLoader
          color="#3B82F6"
          size={15}
          margin={2}
          speedMultiplier={1}
        />
      )}
      {loaderType === "chat" && (
        <HashLoader
          color="#3B82F6"
          size={50}
          speedMultiplier={1}
        />
      )}
    </div>
  )
}

export default Loading