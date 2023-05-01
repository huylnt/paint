import { useState, createContext, useEffect } from 'react'
import { readFile } from 'localFile'
const originCanvasContext = createContext()

const CanvasContext = ({children}) => {
     const [figures, setFigures] = useState([])
     const [selectedElement, setSelectedElement] = useState()

     const restoreLastCanvas = async () => {
          const content = await readFile('figures.json')
          setFigures(content)
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
