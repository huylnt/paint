import { useState, createContext, useEffect } from 'react'
const originCanvasContext = createContext()

const CanvasContext = ({children}) => {
     const [figures, setFigures] = useState([])
     const [selectedElement, setSelectedElement] = useState()

     const restoreLastCanvas = () => {
          const content = localStorage?.getItem('figures')
          if (content) setFigures(JSON.parse(content))
     }

     useEffect(() => {
          restoreLastCanvas()
     }, [])
     
     return (
          <originCanvasContext.Provider value={{ figures, setFigures, selectedElement, setSelectedElement }}>
               {children}
          </originCanvasContext.Provider>
     )
}

export {originCanvasContext, CanvasContext}
