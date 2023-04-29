import './App.css'
import { useState, useLayoutEffect, useContext } from 'react'


import { Tabs, Tab, TabPanels, TabPanel, TabList, Flex, Box, Image, Button, Menu, MenuButton, MenuList, MenuItem, Tooltip, Icon } from '@chakra-ui/react'
import { FaRegSave } from 'react-icons/fa'
import { AiOutlineFormatPainter } from 'react-icons/ai'
import { FiTrash } from 'react-icons/fi'
import { BsPencil } from 'react-icons/bs'

import {originCanvasContext, CanvasContext} from 'context/CanvasContext'
import Canvas from 'Canvas'
import Dialog from 'component/Dialog'

import { extendTheme, ChakraProvider } from '@chakra-ui/react'
const colors = {
  primary: '#AFD3E2',
  secondary: '#19A7CE',
  accent: '#146C94',
  background: 'linear-gradient(138deg, rgba(223,232,235,1) 0%, rgba(200,221,231,1) 100%)'
}
const theme = extendTheme({ colors })

const App = () => {
  const [object, setObject] = useState()
  const [color, setColor] = useState()
  const [penWidth, setPenWidth] = useState(1)
  const [strokeType, setStrokeType] = useState('CONTINUOUS')
  const [dialogContext, setDialogContext] = useState()
  const [refresher, setRefresher] = useState(0)
  useLayoutEffect(() => {
    if (!object) {
      setObject('LINE')
      setColor('black')
    }
  }, [])

  return (
    <ChakraProvider theme={theme}>
      <CanvasContext>
        <Box>
          <Flex justify='space-between' align='center' marginBottom='15px' position='fixed' width='100%' padding='20px 20px 30px 20px' boxShadow='2xl' borderRadius='20px'>
            <Tabs variant='soft-rounded' colorScheme='blue' size='lg' defaultIndex={0} height='18vh'>
              <TabList paddingBottom='5px'>
                <Tab>Drawable objects</Tab>
                <Tab>Options</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Flex gap='30px'>
                    <Box as='Button' padding='10px' bg='white' borderRadius='full' width='fit-content' height='fit-content' boxShadow='dark-lg' borderWidth='3px' opacity={(object === 'LINE') ? '1' : '0.5'} borderColor={(object === 'LINE' ? 'accent' : 'white')}>
                      <Tooltip label='Line' bg='accent' borderRadius='full'>
                        <Image src='icon_line.png' boxSize='30px' onClick={() => setObject('LINE')} />
                      </Tooltip>
                    </Box>
                    <Box as='Button' padding='10px' bg='white' borderRadius='full' width='fit-content' height='fit-content' boxShadow='dark-lg' borderWidth='3px' opacity={(object === 'RECTANGLE') ? '1' : '0.5'} borderColor={(object === 'RECTANGLE' ? 'accent' : 'white')}>
                      <Tooltip label='Rectangle' bg='accent' borderRadius='full'>
                        <Image src='icon_rectangle.png' boxSize='30px' onClick={() => setObject('RECTANGLE')} />
                      </Tooltip>
                    </Box>
                    <Box as='Button' padding='10px' bg='white' borderRadius='full' width='fit-content' height='fit-content' boxShadow='dark-lg' borderWidth='3px' opacity={(object === 'ELLIPSE') ? '1' : '0.5'} borderColor={(object === 'ELLIPSE' ? 'accent' : 'white')}>
                      <Tooltip label='Ellipse' bg='accent' borderRadius='full'>
                        <Image src='icon_ellipse.png' boxSize='30px' onClick={() => setObject('ELLIPSE')} />
                      </Tooltip>
                    </Box>

                    <Box as='Button' padding='10px' bg='white' borderRadius='full' width='fit-content' height='fit-content' boxShadow='dark-lg' borderWidth='3px'>
                      <Tooltip label='Clear all' bg='accent' borderRadius='full'>
                        <Image src='icon_clear.png' boxSize='30px' onClick={() => {
                          setObject('EMPTY')
                          setRefresher(prev => prev + 1)
                        }} />
                      </Tooltip>
                    </Box>
                  </Flex>


                </TabPanel>
                <TabPanel>
                  <Flex gap='30px'>
                    <Menu>
                      <MenuButton as={Button} variant='outline' colorScheme='blue' leftIcon={<BsPencil />}>Configure pen</MenuButton>
                      <MenuList boxShadow='2xl'>
                        <MenuItem onClick={() => setDialogContext("PEN_WIDTH")}>Change pen width</MenuItem>
                        <MenuItem onClick={() => setDialogContext("PEN_STROKE_TYPE")}>Change stroke type</MenuItem>
                      </MenuList>
                    </Menu>
                    <Button leftIcon={<AiOutlineFormatPainter />} variant='outline' colorScheme='blue'>Fill object</Button>
                    <Button leftIcon={<FaRegSave />} variant='outline' colorScheme='blue' >Save to .png file</Button>
                  </Flex>

                </TabPanel>
              </TabPanels>
            </Tabs>

            <Flex flexFlow='column' gap='10px' align='center'>
              <Box fontFamily='Alkatra'>Selected color</Box>
              <Box as='Button' bg={color} borderRadius='full' padding='20px 50px' onClick={() => setDialogContext("PEN_COLOR")}></Box>
            </Flex>

          </Flex>

          <Canvas object={object} color={color} penWidth={penWidth} penStrokeType={strokeType} refresher={refresher} setRefresher={setRefresher} />
        </Box>

        {dialogContext === 'PEN_COLOR' && <Dialog context={dialogContext} setOpened={setDialogContext} color={color} setColor={setColor} />}
        {dialogContext === 'PEN_WIDTH' && <Dialog context={dialogContext} setOpened={setDialogContext} penWidth={penWidth} setPenWidth={setPenWidth} />}
        {dialogContext === 'PEN_STROKE_TYPE' && <Dialog context={dialogContext} setOpened={setDialogContext} strokeType={strokeType} setStrokeType={setStrokeType} />}
      </CanvasContext>
    </ChakraProvider>
  )
}

export default App
