import { useState, createContext } from 'react'

const originCanvasContext = createContext()

const CanvasContext = ({children}) => {
     const [figures, setFigures] = useState([])
     
     return (
          <originCanvasContext.Provider value={{ figures, setFigures }}>
               {children}
          </originCanvasContext.Provider>
     )
}

export {originCanvasContext, CanvasContext}
