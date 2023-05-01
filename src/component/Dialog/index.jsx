import {Modal,ModalOverlay,ModalContent,ModalHeader,ModalFooter,ModalBody,Button,Center,Select} from '@chakra-ui/react'
import {NumberInput,NumberInputField,NumberInputStepper,NumberIncrementStepper,NumberDecrementStepper} from '@chakra-ui/react'
import { HexColorPicker } from "react-colorful"

const Dialog = ({ context, setOpened, color, setColor, penWidth, setPenWidth, strokeType, setStrokeType }) => {
     return (
          <>
               <Modal onClose={() => setOpened(false)} isOpen={true} isCentered borderRadius='12px'>
                    <ModalOverlay />
                    <ModalContent>
                         <ModalHeader bg='secondary' color='white' borderRadius='6px'>
                              {(context === 'PEN_COLOR') && 'Pick a color'}
                              {(context === 'PEN_WIDTH') && 'Change pen width'}
                              {(context === 'PEN_STROKE_TYPE') && 'Change pen stroke type'}
                         </ModalHeader>

                         <ModalBody>
                              <Center marginTop='20px'>
                                   {(context === 'PEN_COLOR') && <HexColorPicker color={color} onChange={setColor} />}

                                   {(context === 'PEN_WIDTH') && <NumberInput defaultValue={penWidth} min={1} max={5} onChange={(value) => setPenWidth(value)}>
                                        <NumberInputField />
                                        <NumberInputStepper>
                                             <NumberIncrementStepper />
                                             <NumberDecrementStepper />
                                        </NumberInputStepper>
                                   </NumberInput>}

                                   {(context === 'PEN_STROKE_TYPE') && <Select placeholder='Select option' onChange={(e) => setStrokeType(e.target.options[e.target.selectedIndex].value)}>
                                        <option value='CONTINUOUS'>Continuous</option>
                                        <option value='DASH_DASH'>Dash dash</option>
                                        <option value='DASH_DOT_DASH'>Dash dot dash</option>
                                   </Select>}
                              </Center>

                         </ModalBody>

                         <ModalFooter>
                              <Button onClick={() => setOpened(false)}>Close</Button>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </>
     )
}

export default Dialog