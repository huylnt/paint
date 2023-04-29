import { useLayoutEffect, useState } from 'react'
import { RoughCanvas } from 'roughjs/bin/canvas'
import { originCanvasContext } from 'context/CanvasContext'
import { useContext } from 'react'

const Canvas = ({ object, color, penWidth, penStrokeType, refresher, setRefresher }) => {
  const canvasContext = useContext(originCanvasContext)
  const { figures, setFigures } = canvasContext

  const [isDrawing, setIsDrawing] = useState(false)
  let roughCanvas

  const corConverter = (mouseX1, mouseY1, mouseX2, mouseY2) => {
    return {
      canvasX1: mouseX1,
      canvasY1: mouseY1,
      canvasX2: mouseX2,
      canvasY2: mouseY2
    }
  }

  const strokeTypeConverter = (strokeType) => {
    if (strokeType === 'CONTINUOUS') return []
    else if (strokeType === 'DASH_DASH') return [5, 15]
    else if (strokeType === 'DASH_DOT_DASH') return [5, 15, 1, 15, 5, 15, 1, 15]
  }

  const ensureHighQuality = (canvas, canvasContext) => {
    // Get the DPR and size of the canvas
    const dpr = window.devicePixelRatio;
    const rect = canvas.getBoundingClientRect();

    // Set the "actual" size of the canvas
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale the context to ensure correct drawing operations
    canvasContext.scale(dpr, dpr);

    // Set the "drawn" size of the canvas
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas')
    const canvasContext = canvas.getContext('2d')

    ensureHighQuality(canvas, canvasContext)

    canvasContext.clearRect(0, 0, canvas.width, canvas.height)

    if (figures.length < 1) return

    if (object === 'EMPTY') {
      figures.length = 0
      return
    }

    roughCanvas = new RoughCanvas(canvas)
    console.log('Still')
    figures.forEach(({ objectType, strokeColor, penWidth, strokeLineStyle, mouseX1, mouseY1, mouseX2, mouseY2 }) => {
      const { canvasX1, canvasY1, canvasX2, canvasY2 } = corConverter(mouseX1, mouseY1, mouseX2, mouseY2)
      if (objectType === 'LINE') {
        roughCanvas.line(canvasX1, canvasY1, canvasX2, canvasY2, { stroke: strokeColor, strokeWidth: penWidth, strokeLineDash: strokeLineStyle })
      }
      else if (objectType === 'RECTANGLE') {
        const width = canvasX2 - canvasX1
        const height = canvasY2 - canvasY1
        roughCanvas.rectangle(canvasX1, canvasY1, width, height, { stroke: strokeColor, strokeWidth: penWidth, strokeLineDash: strokeLineStyle })
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