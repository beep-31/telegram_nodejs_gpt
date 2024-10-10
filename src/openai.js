import OpenAI from 'openai'
import config from 'config'
import {createReadStream} from 'fs';

const APIKEY = config.get('OPENAI_TOKEN');

class MyOpenAI extends OpenAI{

    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system',
    }

    constructor(){
        super({apiKey: APIKEY})
    }

    async transcription(filepath){
        try{
            const transcription = await this.audio.transcriptions.create({
                file: createReadStream(filepath),
                model: 'whisper-1'
        })
                return transcription.text
            } catch(e){
                console.log('Transcription error', e.message)
            }
        }

    async send_answer(messages){
        console.log(messages)
        try{
            const response = await this.chat.completions.create({
                messages: messages,
                model: "gpt-4o",
            })
            console.log("Response data: " ,response)
            return response.choices[0].message.content
            
        } catch(e){
            console.log('Error while generating the response!', e.message)
        }
    }
}
        



const myOpenAI = new MyOpenAI();

export {myOpenAI};



