import './App.css'
import { useState, useLayoutEffect } from 'react'


import { Tabs, Tab, TabPanels, TabPanel, TabList, Flex, Box, Image, Button, Menu, MenuButton, MenuList, MenuItem, Tooltip, Divider } from '@chakra-ui/react'
import { FaRegSave } from 'react-icons/fa'
import { AiOutlineFormatPainter } from 'react-icons/ai'
import { BsPencil } from 'react-icons/bs'
import { CiText } from 'react-icons/ci'

import { CanvasContext } from 'context/CanvasContext'
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
  const [action, setAction] = useState()
  const [color, setColor] = useState()
  const [penWidth, setPenWidth] = useState(1)
  const [strokeType, setStrokeType] = useState('CONTINUOUS')
  const [dialogContext, setDialogContext] = useState()
  const [refresher, setRefresher] = useState(0)

  useLayoutEffect(() => {
    if (!action) {
      setAction('DRAWING_LINE')
      setColor('black')
    }
  }, [])

  return (
    <ChakraProvider theme={theme}>
      <CanvasContext>
        <Box>
          <Flex justify='space-between' align='center' marginBottom='15px' position='fixed' width='100%' padding='20px 20px 30px 20px' boxShadow='1px 12px 24px 9px rgba(57,128,146,0.27)' borderRadius='20px' zIndex='1' bg='white'>
            <Tabs variant='soft-rounded' colorScheme='blue' size='lg' defaultIndex={0} height='18vh'>
              <TabList paddingBottom='5px'>
                <Tab>Objects</Tab>
                <Tab>Options</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Flex gap='30px'>
                    <Box as='button' padding='10px' bg='white' borderRadius='full' width='fit-content' height='fit-content' boxShadow='dark-lg' borderWidth='3px' opacity={(action === 'DRAWING_LINE') ? '1' : '0.5'} borderColor={(action === 'DRAWING_LINE' ? 'accent' : 'white')} onClick={() => setAction('DRAWING_LINE')}>
                      <Tooltip label='Line' bg='accent' borderRadius='full'>
                        <Image src='icon_line.png' boxSize='30px' />
                      </Tooltip>
                    </Box>

                    <Box as='button' padding='10px' bg='white' borderRadius='full' width='fit-content' height='fit-content' boxShadow='dark-lg' borderWidth='3px' opacity={(action === 'DRAWING_RECTANGLE') ? '1' : '0.5'} borderColor={(action === 'DRAWING_RECTANGLE' ? 'accent' : 'white')} onClick={() => setAction('DRAWING_RECTANGLE')}>
                      <Tooltip label='Rectangle' bg='accent' borderRadius='full'>
                        <Image src='icon_rectangle.png' boxSize='30px' />
                      </Tooltip>
                    </Box>

                    <Box as='button' padding='10px' bg='white' borderRadius='full' width='fit-content' height='fit-content' boxShadow='dark-lg' borderWidth='3px' opacity={(action === 'DRAWING_ELLIPSE') ? '1' : '0.5'} borderColor={(action === 'DRAWING_ELLIPSE' ? 'accent' : 'white')} onClick={() => setAction('DRAWING_ELLIPSE')}>
                      <Tooltip label='Ellipse' bg='accent' borderRadius='full'>
                        <Image src='icon_ellipse.png' boxSize='30px' />
                      </Tooltip>
                    </Box>

                    <Box as='button' padding='10px' bg='white' borderRadius='full' width='fit-content' height='fit-content' boxShadow='dark-lg' borderWidth='3px' opacity={(action === 'TYPING_TEXT') ? '1' : '0.5'} borderColor={(action === 'TYPING_TEXT' ? 'accent' : 'white')} onClick={() => setAction('TYPING_TEXT')}>
                      <Tooltip label='Text' bg='accent' borderRadius='full'>
                        <div>
                          <CiText size='30px' />
                        </div>
                      </Tooltip>
                    </Box>

                    <Divider orientation='vertical' width='5px' height='55px' bg='primary' />

                    <Box as='button' padding='10px' bg='white' borderRadius='full' width='fit-content' height='fit-content' boxShadow='dark-lg' borderWidth='3px' opacity={(action === 'SELECTING') ? '1' : '0.5'} borderColor={(action === 'SELECTING' ? 'accent' : 'white')} onClick={() => setAction('SELECTING')}>
                      <Tooltip label='Select' bg='accent' borderRadius='full'>
                        <Image src='icon_select.png' boxSize='30px' />
                      </Tooltip>
                    </Box>

                    <Box as='button' padding='10px' bg='white' borderRadius='full' width='fit-content' height='fit-content' boxShadow='dark-lg' borderWidth='3px' opacity={(action === 'FILLING') ? '1' : '0.5'} borderColor={(action === 'FILLING' ? 'accent' : 'white')} onClick={() => setAction('FILLING')}>
                      <Tooltip label='Fill' bg='accent' borderRadius='full'>
                        <div>
                          <AiOutlineFormatPainter size='30px' />
                        </div>
                      </Tooltip>
                    </Box>

                    <Divider orientation='vertical' width='5px' height='55px' bg='primary' />

                    <Box as='Button' padding='10px' bg='white' borderRadius='full' width='fit-content' height='fit-content' boxShadow='dark-lg' borderWidth='3px' onClick={() => {
                      setAction('CLEARING_ALL')
                      setRefresher(prev => prev + 1)
                    }}>
                      <Tooltip label='Clear all' bg='accent' borderRadius='full'>
                        <Image src='icon_clear.png' boxSize='30px' />
                      </Tooltip>
                    </Box>
                  </Flex>




                </TabPanel>
                <TabPanel>
                  <Flex gap='30px' marginTop='10px'>
                    <Menu>
                      <MenuButton as={Button} variant='outline' colorScheme='blue' leftIcon={<BsPencil />}>Configure pen</MenuButton>
                      <MenuList boxShadow='2xl'>
                        <MenuItem onClick={() => setDialogContext("PEN_WIDTH")}>Change pen width</MenuItem>
                        <MenuItem onClick={() => setDialogContext("PEN_STROKE_TYPE")}>Change stroke type</MenuItem>
                      </MenuList>
                    </Menu>

                    <Menu>
                      <MenuButton as={Button} variant='outline' colorScheme='blue' leftIcon={<FaRegSave />}>Save</MenuButton>
                      <MenuList boxShadow='2xl'>
                        <MenuItem onClick={() => setAction('SAVE_LOCALLY')}>Save locally</MenuItem>
                        <MenuItem onClick={() => setAction('SAVE_AS_PNG')}>Save to .png file</MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>

                </TabPanel>
              </TabPanels>
            </Tabs>

            <Flex flexFlow='column' gap='10px' align='center'>
              <Box fontFamily='Alkatra'>Selected color</Box>
              <Box as='button' bg={color} borderRadius='full' padding='20px 50px' onClick={() => setDialogContext("PEN_COLOR")}></Box>
            </Flex>

          </Flex>

          <Canvas action={action} color={color} penWidth={penWidth} penStrokeType={strokeType} refresher={refresher} setRefresher={setRefresher} />
        </Box>

        {dialogContext === 'PEN_COLOR' && <Dialog context={dialogContext} setOpened={setDialogContext} color={color} setColor={setColor} />}
        {dialogContext === 'PEN_WIDTH' && <Dialog context={dialogContext} setOpened={setDialogContext} penWidth={penWidth} setPenWidth={setPenWidth} />}
        {dialogContext === 'PEN_STROKE_TYPE' && <Dialog context={dialogContext} setOpened={setDialogContext} strokeType={strokeType} setStrokeType={setStrokeType} />}
      </CanvasContext>
    </ChakraProvider>
  )
}

export default App
