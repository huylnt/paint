import { useLayoutEffect, useState } from 'react'
import { RoughCanvas } from 'roughjs/bin/canvas'
import { originCanvasContext } from 'context/CanvasContext'
import { useContext } from 'react'

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

const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))

const isWithinLine = (figure, mouseX, mouseY) => {
  const a = { x: figure.mouseX1, y: figure.mouseY1 }
  const b = { x: figure.mouseX2, y: figure.mouseY2 }
  const c = { x: mouseX, y: mouseY }
  const offset = distance(a, b) - (distance(a, c) + distance(b, c))
  return Math.abs(offset) < 1 ? true : false
}

const isWithinRectangle = (figure, mouseX, mouseY) => {
  const minX = Math.min(figure.mouseX1, figure.mouseX2)
  const maxX = Math.max(figure.mouseX1, figure.mouseX2)
  const minY = Math.min(figure.mouseY1, figure.mouseY2)
  const maxY = Math.max(figure.mouseY1, figure.mouseY2)
  return mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY
}

const isWithinEllipse = (figure, mouseX, mouseY) => {
  const origin = { x: figure.mouseX1, y: figure.mouseY1 }
  const mouse = { x: mouseX, y: mouseY }
  const boudaryWidth = { x: figure.mouseX2 - figure.mouseX1, y: figure.mouseY1 }
  const boundaryHeight = { x: figure.mouseX1, y: figure.mouseY2 - figure.mouseY1 }

  return distance(origin, mouse) < distance(origin, boudaryWidth) && distance(origin, mouse) < distance(origin, boundaryHeight)
}

const Canvas = ({ object, color, penWidth, penStrokeType, refresher, setRefresher }) => {
  const canvasContext = useContext(originCanvasContext)
  const { figures, setFigures } = canvasContext

  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedElement, setSelectedElement] = useState()
  let roughCanvas
  const [offsetMouse, _] = useState({
    x: 0,
    y: 0
  })

  const isWithinElement = (mouseX, mouseY) => {
    const selectedElement = figures.find(figure => isWithinLine(figure, mouseX, mouseY) || isWithinRectangle(figure, mouseX, mouseY) || isWithinEllipse(figure, mouseX, mouseY))
    return selectedElement
  }

  const transitElement = (clientX, clientY) => {
    if (selectedElement.objectType === 'LINE') {
      const distanceX = selectedElement.mouseX2 - selectedElement.mouseX1
      const distanceY = selectedElement.mouseY2 - selectedElement.mouseY1
      selectedElement.mouseX1 = clientX - offsetMouse.x
      selectedElement.mouseY1 = clientY - offsetMouse.y
      selectedElement.mouseX2 = clientX - offsetMouse.x + distanceX
      selectedElement.mouseY2 = clientY - offsetMouse.y + distanceY
    }

    else if (selectedElement.objectType === 'RECTANGLE') {
      const width = selectedElement.mouseX2  - selectedElement.mouseX1
      const height = selectedElement.mouseY2 - selectedElement.mouseY1
      selectedElement.mouseX1 = clientX - offsetMouse.x
      selectedElement.mouseY1 = clientY - offsetMouse.y
      selectedElement.mouseX2 = clientX - offsetMouse.x + width
      selectedElement.mouseY2 = clientY - offsetMouse.y + height
    }

    else if (selectedElement.objectType === 'ELLIPSE') {
      const width = (selectedElement.mouseX2  - selectedElement.mouseX1)
      const height = (selectedElement.mouseY2 - selectedElement.mouseY1)
      selectedElement.mouseX1 = clientX - offsetMouse.x
      selectedElement.mouseY1 = clientY - offsetMouse.y
      selectedElement.mouseX2 = clientX - offsetMouse.x + width
      selectedElement.mouseY2 = clientY - offsetMouse.y + height
    }
  }

  const fillElement = () => {
    selectedElement.fillColor = color
    // setRefresher(prev => prev + 1)
  }

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas')
    const canvasContext = canvas.getContext('2d')

    ensureHighQuality(canvas, canvasContext)

    canvasContext.clearRect(0, 0, canvas.width, canvas.height)

    if (figures.length < 1) return

    if (object === 'TRASH') {
      figures.length = 0
      return
    }

    roughCanvas = new RoughCanvas(canvas)

    figures.forEach(({ objectType, strokeColor, penWidth, strokeLineStyle, fillColor, mouseX1, mouseY1, mouseX2, mouseY2 }) => {
      const { canvasX1, canvasY1, canvasX2, canvasY2 } = corConverter(mouseX1, mouseY1, mouseX2, mouseY2)
      if (objectType === 'LINE') {
        roughCanvas.line(canvasX1, canvasY1, canvasX2, canvasY2, { stroke: (fillColor) ? fillColor : strokeColor, strokeWidth: penWidth, strokeLineDash: strokeLineStyle })
      }
      else if (objectType === 'RECTANGLE') {
        const width = canvasX2 - canvasX1
        const height = canvasY2 - canvasY1
        roughCanvas.rectangle(canvasX1, canvasY1, width, height, { stroke: strokeColor, strokeWidth: penWidth, strokeLineDash: strokeLineStyle, fill: fillColor, fillWeight: 5 })
      }
      else if (objectType === 'ELLIPSE') {
        const width = (canvasX2 - canvasX1) * 2
        const height = (canvasY2 - canvasY1) * 2
        roughCanvas.ellipse(canvasX1, canvasY1, width, height, { stroke: strokeColor, strokeWidth: penWidth, strokeLineDash: strokeLineStyle, fill: fillColor })
      }
    })
  }, [refresher])

  const handleMouseDown = (event) => {
    setIsDrawing(true)
    const { clientX, clientY } = event

    if (object === 'LINE' || object === 'RECTANGLE' || object === 'ELLIPSE')
      setFigures(prev => [...prev, {
        id: figures.length,
        objectType: object,
        strokeColor: color,
        penWidth: penWidth,
        strokeLineStyle: strokeTypeConverter(penStrokeType),
        fillColor: undefined,
        mouseX1: clientX,
        mouseY1: clientY,
        mouseX2: undefined,
        mouseY2: undefined
      }])

    else {
      const tempSelectedElement = isWithinElement(clientX, clientY)
      if (tempSelectedElement) {
        setSelectedElement(tempSelectedElement)
        offsetMouse.x = clientX - tempSelectedElement.mouseX1
        offsetMouse.y = clientY - tempSelectedElement.mouseY1

        if (object === 'FILL') {
          tempSelectedElement.fillColor = color
          setRefresher(prev => prev + 1)
        }
      }
    }

  }

  const handleMouseMove = (event) => {
    if (!isDrawing) return
    const { clientX, clientY } = event

    if (object === 'SELECT') {
      if (selectedElement) transitElement(clientX, clientY)
    }

    else if (object === 'LINE' || object === 'RECTANGLE' || object === 'ELLIPSE') {
      figures[figures.length - 1].mouseX2 = clientX
      figures[figures.length - 1].mouseY2 = clientY
    }

    setRefresher(prev => prev + 1)
  }

  const handleMouseUp = (event) => {
    setIsDrawing(false)
  }

  return (
    <canvas
      id='canvas'
      style={{ width: '100vw', height: '100vh' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    ></canvas>
  )
}

export default Canvas