import {unlink} from 'fs/promises'


export async function removeFile(path) {
    try{
        await unlink(path)
    } catch(e){
        console.log("Error occured  while removing the file", e.message)
    }
}