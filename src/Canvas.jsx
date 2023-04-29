import { useLayoutEffect, useState } from 'react'
import { RoughCanvas } from 'roughjs/bin/canvas'

const Canvas = ({ object, color, penWidth, penStrokeType }) => {
  let roughCanvas
  const [isDrawing, setIsDrawing] = useState(false)
  const [figures, setFigures] = useState([])
  const [refresher, setRefresher] = useState(0)

  const corConverter = (mouseX1, mouseY1, mouseX2, mouseY2) => {
    return {
      canvasX1: mouseX1 / 4,
      canvasY1: mouseY1 / 4 - 10,
      canvasX2: mouseX2 / 4,
      canvasY2: mouseY2 / 4 - 10
    }
  }

  const strokeTypeConverter = (strokeType) => {
    console.log('stroke type', strokeType)
    if (strokeType === 'CONTINUOUS') return []
    else if (strokeType === 'DASH_DASH') return [5,15]
    else if (strokeType === 'DASH_DOT_DASH') return [5,15,1,15,5, 15, 1, 15]
  }

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas')
    const canvasContext = canvas.getContext('2d')
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)
    roughCanvas = new RoughCanvas(canvas)

    if (figures.length < 1) return

    figures.forEach(({ objectType, strokeColor, penWidth, strokeLineStyle, mouseX1, mouseY1, mouseX2, mouseY2 }) => {
      const {canvasX1, canvasY1, canvasX2, canvasY2} = corConverter(mouseX1, mouseY1, mouseX2, mouseY2)
      if (objectType === 'LINE') {
        roughCanvas.line(canvasX1, canvasY1, canvasX2, canvasY2, { stroke: strokeColor, strokeWidth: penWidth, strokeLineDash: strokeLineStyle })
      }
      else if (objectType === 'RECTANGLE') {
        const width = canvasX2 - canvasX1
        const height = canvasY2 - canvasY1
        roughCanvas.rectangle(canvasX1, canvasY1, width, height, { stroke: strokeColor, strokeWidth: penWidth, strokeLineDash: strokeLineStyle})
      }
      else if (objectType === 'ELLIPSE') {
        const width = (canvasX2 - canvasX1) * 2
        const height = (canvasY2 - canvasY1) * 2
        roughCanvas.ellipse(canvasX1, canvasY1, width, height, { stroke: strokeColor, strokeWidth: penWidth, strokeLineDash: strokeLineStyle })
      }
    })

  }, [refresher])

  const handleMouseDown = (event) => {
    setIsDrawing(true)
    const { clientX, clientY } = event

    setFigures(prev => [...prev, {
      objectType: object,
      strokeColor: color,
      penWidth: penWidth,
      strokeLineStyle: strokeTypeConverter(penStrokeType),
      mouseX1: clientX,
      mouseY1: clientY,
      mouseX2: undefined,
      mouseY2: undefined
    }])

  }

  const handleMouseMove = (event) => {
    if (!isDrawing) return
    const { clientX, clientY } = event

    figures[figures.length - 1].mouseX2 = clientX
    figures[figures.length - 1].mouseY2 = clientY

    setRefresher(prev => prev + 1)
  }

  const handleMouseUp = (event) => {
    if (!isDrawing) return

    const { clientX, clientY } = event
    console.log(clientX, clientY)

    setIsDrawing(false)
  }

  return (
    <canvas
      id='canvas'
      style={{ width: '100vw', height: '100vh' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >

    </canvas>
  )
}

export default Canvas