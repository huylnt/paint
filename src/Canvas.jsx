import { useLayoutEffect, useState, useRef, useContext } from 'react'
import { RoughCanvas } from 'roughjs/bin/canvas'
import { originCanvasContext } from 'context/CanvasContext'
import SelectionHighlighterCard from 'component/SelectionHighlighterCard'
import { Textarea, useToast } from '@chakra-ui/react'
import { writeData } from 'localFile'

const handleSaveLocally = async (figures, toast) => {
  const response = await writeData('figures.json', figures)
  toast({
    title: 'Your process has been successfully saved locally',
    variant: 'subtle',
    status: 'success',
    position: 'bottom-right',
    colorScheme: 'blue',
    duration: 3000,
  })

}

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
  if (figure.action !== 'DRAWING_LINE') return false
  const a = { x: figure.mouseX1, y: figure.mouseY1 }
  const b = { x: figure.mouseX2, y: figure.mouseY2 }
  const c = { x: mouseX, y: mouseY }
  const offset = distance(a, b) - (distance(a, c) + distance(b, c))
  const result = Math.abs(offset) < 1 ? true : false
  return result
}

const isWithinRectangle = (figure, mouseX, mouseY) => {
  if (figure.action !== 'DRAWING_RECTANGLE') return false
  const minX = Math.min(figure.mouseX1, figure.mouseX2)
  const maxX = Math.max(figure.mouseX1, figure.mouseX2)
  const minY = Math.min(figure.mouseY1, figure.mouseY2)
  const maxY = Math.max(figure.mouseY1, figure.mouseY2)
  const result = mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY
  return result
}

const isWithinEllipse = (figure, mouseX, mouseY) => {
  if (figure.action !== 'DRAWING_ELLIPSE') return false
  const origin = { x: figure.mouseX1, y: figure.mouseY1 }
  const mouse = { x: mouseX, y: mouseY }
  const boudaryWidth = { x: figure.mouseX2 - figure.mouseX1, y: figure.mouseY1 }
  const boundaryHeight = { x: figure.mouseX1, y: figure.mouseY2 - figure.mouseY1 }

  const result = distance(origin, mouse) <= distance(origin, boundaryHeight) || (distance(origin, mouse) > distance(origin, boundaryHeight) && distance(origin, mouse) <= distance(origin, boudaryWidth))
  return result
}

const wrapText = (context, text, fromLeft, fromTop, maxWidth) => {
  const lineHeight = 35
  var words = text.split('');
  var line = '';

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + '';
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;

    if ((testWidth > maxWidth) && n > 0) {
      context.fillText(line, fromLeft, fromTop);
      line = words[n] + '';
      fromTop += lineHeight;
    }
    else {
      line = testLine;
    }
  }
  context.fillText(line, fromLeft, fromTop);
}

const Canvas = ({ action, color, penWidth, penStrokeType, refresher, setRefresher }) => {
  const canvasContext = useContext(originCanvasContext)
  const { figures, setFigures, selectedElement, setSelectedElement } = canvasContext

  const [mouseDown, setMouseDown] = useState(false)
  const selectedElementIndex = useRef(-1)
  const [offsetMouse, _] = useState({
    x: 0,
    y: 0
  })

  const toast = useToast()  

  let roughCanvas

  const isWithinElement = (mouseX, mouseY) => {
    const selectedElement = figures.find(figure => isWithinLine(figure, mouseX, mouseY) || isWithinRectangle(figure, mouseX, mouseY) || isWithinEllipse(figure, mouseX, mouseY))
    return selectedElement
  }

  const transitElement = (clientX, clientY) => {
    if (selectedElement.action === 'DRAWING_LINE') {
      const distanceX = selectedElement.mouseX2 - selectedElement.mouseX1
      const distanceY = selectedElement.mouseY2 - selectedElement.mouseY1
      selectedElement.mouseX1 = clientX - offsetMouse.x
      selectedElement.mouseY1 = clientY - offsetMouse.y
      selectedElement.mouseX2 = clientX - offsetMouse.x + distanceX
      selectedElement.mouseY2 = clientY - offsetMouse.y + distanceY
    }

    else if (selectedElement.action === 'DRAWING_RECTANGLE') {
      const width = selectedElement.mouseX2 - selectedElement.mouseX1
      const height = selectedElement.mouseY2 - selectedElement.mouseY1
      selectedElement.mouseX1 = clientX - offsetMouse.x
      selectedElement.mouseY1 = clientY - offsetMouse.y
      selectedElement.mouseX2 = clientX - offsetMouse.x + width
      selectedElement.mouseY2 = clientY - offsetMouse.y + height
    }

    else if (selectedElement.action === 'DRAWING_ELLIPSE') {
      const width = (selectedElement.mouseX2 - selectedElement.mouseX1)
      const height = (selectedElement.mouseY2 - selectedElement.mouseY1)
      selectedElement.mouseX1 = clientX - offsetMouse.x
      selectedElement.mouseY1 = clientY - offsetMouse.y
      selectedElement.mouseX2 = clientX - offsetMouse.x + width
      selectedElement.mouseY2 = clientY - offsetMouse.y + height
    }
  }

  const removeEmptyTextBox = () => {
    const filteredFigures = figures.filter(figure => !(figure.isJustText && !figure.text))
    setFigures(filteredFigures)
  }

  const renderAllFigures = (canvasContext) => {
    const lineHeight = 35

    figures.forEach(({ action, strokeColor, penWidth, strokeLineStyle, fillColor, mouseX1, mouseY1, mouseX2, mouseY2, text }) => {
      const { canvasX1, canvasY1, canvasX2, canvasY2 } = corConverter(mouseX1, mouseY1, mouseX2, mouseY2)
      if (action === 'DRAWING_LINE') {
        roughCanvas.line(canvasX1, canvasY1, canvasX2, canvasY2, { stroke: (fillColor) ? fillColor : strokeColor, strokeWidth: penWidth, strokeLineDash: strokeLineStyle })
        if (text) canvasContext.fillText(text, canvasX1, canvasY1)
      }
      else if (action === 'DRAWING_RECTANGLE') {
        const width = canvasX2 - canvasX1
        const height = canvasY2 - canvasY1
        roughCanvas.rectangle(canvasX1, canvasY1, width, height, { stroke: strokeColor, strokeWidth: penWidth, strokeLineDash: strokeLineStyle, fill: fillColor, fillWeight: 5 })
        if (text) {
          const maxWidth = 0.8 * width
          const fromLeft = canvasX1 + 0.1 * width
          const fromTop = canvasY1 + 40
          wrapText(canvasContext, text, fromLeft, fromTop, maxWidth)
        }
      }
      else if (action === 'DRAWING_ELLIPSE') {
        const width = (canvasX2 - canvasX1) * 2
        const height = (canvasY2 - canvasY1) * 2
        roughCanvas.ellipse(canvasX1, canvasY1, width, height, { stroke: strokeColor, strokeWidth: penWidth, strokeLineDash: strokeLineStyle, fill: fillColor })
        if (text) {
          const maxWidth = 0.8 * width
          const fromLeft = canvasX1 - 0.4 * width
          const fromTop = canvasY1 - 0.2 * height
          wrapText(canvasContext, text, fromLeft, fromTop, maxWidth)
        }
      }
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Delete') {
      console.log(selectedElement)
      setFigures(figures.filter(figure => figure !== selectedElement))
      setSelectedElement(undefined)
      setRefresher(prev => prev + 1)
    }
  }

  useLayoutEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    const canvas = document.getElementById('canvas')
    const canvasContext = canvas.getContext('2d')

    ensureHighQuality(canvas, canvasContext)

    canvasContext.clearRect(0, 0, canvas.width, canvas.height)
    canvasContext.font = "30px Arial"

    if (figures.length < 1) return

    if (action === 'SAVE_LOCALLY') {
      handleSaveLocally(figures, toast)
    }

    if (action !== 'SELECTING' && action !== 'TYPING_TEXT' && action !== 'FILLING') setSelectedElement(undefined)

    if (action !== 'TYPING_TEXT') selectedElementIndex.current = -1

    if (action === 'CLEARING_ALL') {
      figures.length = 0
      setMouseDown(false)
      selectedElementIndex.current = -1
      setRefresher(prev => prev + 1)
      return
    }



    roughCanvas = new RoughCanvas(canvas)

    renderAllFigures(canvasContext)

  }, [refresher, action, figures])

  const handleMouseDown = (event) => {
    setMouseDown(true)
    const { clientX, clientY } = event

    if (action === 'DRAWING_LINE' || action === 'DRAWING_RECTANGLE' || action === 'DRAWING_ELLIPSE')
      setFigures(prev => [...prev, {
        id: figures.length,
        mouseX1: clientX,
        mouseY1: clientY,
        mouseX2: undefined,
        mouseY2: undefined,
        action: action,
        strokeColor: color,
        penWidth: penWidth,
        strokeLineStyle: strokeTypeConverter(penStrokeType),
        fillColor: undefined,
        text: undefined
      }])

    else {
      const tempSelectedElement = isWithinElement(clientX, clientY)

      if (tempSelectedElement) {

        if (action === 'FILLING') {
          tempSelectedElement.fillColor = color
          setRefresher(prev => prev + 1)
        }

        else if (action === 'TYPING_TEXT') {

          if (tempSelectedElement.action !== 'DRAWING_LINE') selectedElementIndex.current = tempSelectedElement.id
          else {
            setRefresher(prev => prev + 1)
            return
          }
        }

        setSelectedElement(tempSelectedElement)
        offsetMouse.x = clientX - tempSelectedElement.mouseX1
        offsetMouse.y = clientY - tempSelectedElement.mouseY1
        setRefresher(prev => prev + 1)
      }

      else if (action === 'TYPING_TEXT') {
        const filteredFigures = figures.filter(figure => !(figure.isJustText && !figure.text))

        const tempFigure = {
          id: filteredFigures.length,
          mouseX1: clientX,
          mouseY1: clientY,
          mouseX2: clientX + 200,
          mouseY2: clientY + 80,
          action: 'DRAWING_RECTANGLE',
          strokeColor: 'gray',
          penWidth: 1,
          strokeLineStyle: strokeTypeConverter('DASH_DASH'),
          fillColor: 'transparent',
          text: undefined,
          isJustText: true
        }

        filteredFigures.push(tempFigure)
        setFigures(filteredFigures)
        setSelectedElement(tempFigure)
        selectedElementIndex.current = filteredFigures.length - 1

        setRefresher(prev => prev + 1)
      }

    }

  }

  const handleMouseMove = (event) => {
    if (!mouseDown) return

    const { clientX, clientY } = event

    if (action === 'SELECTING') {
      if (selectedElement) {
        if ((selectedElement.isJustText && selectedElement.text) || !selectedElement.isJustText) {
          transitElement(clientX, clientY)
        }
        else {
          removeEmptyTextBox()
          selectedElementIndex.current = -1
        }
      }
      setRefresher(prev => prev + 1)
    }

    else if (action === 'DRAWING_LINE' || action === 'DRAWING_RECTANGLE' || action === 'DRAWING_ELLIPSE') {
      figures[figures.length - 1].mouseX2 = clientX
      figures[figures.length - 1].mouseY2 = clientY
      setRefresher(prev => prev + 1)
    }


  }

  const handleMouseUp = (event) => {
    setMouseDown(false)
  }

  const handleTextareaChanged = (event) => {
    const textarea = event.target
    selectedElement.text = textarea.value
    setRefresher(prev => prev + 1)
  }

  const handleTextareaBlur = (event) => {
    event.target.value = ''
  }

  return (
    <>
      <canvas
        id='canvas'
        style={{ width: '100vw', height: '100vh' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>

      {(selectedElementIndex.current >= 0) && <Textarea placeholder='Type something here' onChange={handleTextareaChanged} onBlur={handleTextareaBlur} position='fixed' left={selectedElement.mouseX1} top={selectedElement.mouseY1 - 70} width={`${selectedElement.mouseX2 - selectedElement.mouseX1}px`} />}
      {(selectedElement) && <SelectionHighlighterCard refresher={refresher} />}
    </>

  )
}

export default Canvas