import { HexColorPicker } from "react-colorful";

import {
     Modal,
     ModalOverlay,
     ModalContent,
     ModalHeader,
     ModalFooter,
     ModalBody,
     Button,
     Center
} from '@chakra-ui/react'

const ColorPickerDialog = ({ color, setColor, setOpened }) => {
     return (
          <>
               <Modal onClose={() => setOpened(false)} isOpen={true} isCentered borderRadius ='12px'>
                    <ModalOverlay />
                    <ModalContent>
                         <ModalHeader bg='secondary' color='white' borderRadius='6px'>
                              Pick a color
                         </ModalHeader>

                         <ModalBody>
                              <Center marginTop='20px'>
                                   <HexColorPicker color={color} onChange={setColor} />
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

export default ColorPickerDialog