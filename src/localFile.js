import { resolveResource } from '@tauri-apps/api/path'
import { writeTextFile, readTextFile } from '@tauri-apps/api/fs'

const readFile = async (fileName) => {
     const resourcePath = await resolveResource('UserPreferences/'.concat(fileName))
     const response = await readTextFile(resourcePath)
     const jsObject = JSON.parse(response)

     return jsObject.payload
}

const writeData = async (fileName, content) => {
     const resourcePath = await resolveResource('UserPreferences/'.concat(fileName))
     const response = await writeTextFile(resourcePath, JSON.stringify({
          payload: content
     }))
     return response
}

export { readFile, writeData }