import { useState, createContext, useEffect } from 'react'

const originCanvasContext = createContext()

const CanvasContext = ({children}) => {
     const [figures, setFigures] = useState([])
     const [selectedElement, setSelectedElement] = useState()

     return (
          <originCanvasContext.Provider value={{ figures, setFigures, selectedElement, setSelectedElement }}>
               {children}
          </originCanvasContext.Provider>
     )
}

export {originCanvasContext, CanvasContext}
