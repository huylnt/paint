import { useLayoutEffect, useRef, useState, useContext } from "react"
import { originCanvasContext } from "context/CanvasContext"
import { Box } from "@chakra-ui/react"

const SelectionHighlighterCard = ({ refresher }) => {
     const canvasContext = useContext(originCanvasContext)
     const { selectedElement } = canvasContext

     const { action, mouseX1, mouseX2, mouseY1, mouseY2 } = selectedElement
     const top = useRef()
     const left = useRef()
     const width = useRef()
     const height = useRef()
     const [_, setRefresher] = useState(0)

     useLayoutEffect(() => {

          if (action === 'DRAWING_RECTANGLE') {
               top.current = mouseY1 - 20
               left.current = mouseX1 - 20
               width.current = mouseX2 - mouseX1 + 40
               height.current = mouseY2 - mouseY1 + 40
          }

          else if (action === 'DRAWING_LINE') {
               top.current = Math.min(mouseY1, mouseY2) - 20
               left.current = Math.min(mouseX1, mouseX2) - 20
               width.current = Math.abs(mouseX2 - mouseX1) + 40
               height.current = Math.abs(mouseY2 - mouseY1) + 40
          }

          else if (action === 'DRAWING_ELLIPSE') {
               width.current = Math.abs(mouseX2 - mouseX1) * 2 + 40
               height.current = Math.abs(mouseY2 - mouseY1) * 2 + 40
               top.current = mouseY1 - height.current / 2
               left.current = mouseX1 - width.current / 2
          }

          setRefresher(prev => prev + 1)

     }, [refresher])

     return (
          <Box position='fixed' zIndex='-1' left={left.current} top={top.current}
               boxShadow='rgba(0, 0, 0, 0.4) 0px 30px 90px'
               borderRadius='10px'
               width={width.current}
               height={height.current}>
          </Box>
     )
}

export default SelectionHighlighterCard