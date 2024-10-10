import { Telegraf, Markup, session } from "telegraf";
import {message} from "telegraf/filters";
import config  from "config";
import {ogg} from "./ogg.js";
import { myOpenAI } from "./openai.js";
import { code } from 'telegraf/format'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

console.log(config.get('TEST_KEY'))

const userStates = {};

const INITIAL_SESSION = {
    messages: [],
}
bot.use(session())

bot.command('start', async (ctx) =>{
    ctx.session = INITIAL_SESSION
    await ctx.reply('Waiting for your audio or text message')
})

bot.start(async(ctx) =>{
    const userId = ctx.message.from.id;
    userStates[userId] = { hasStarted: false };
    if(userStates[userId] && userStates[userId.hasStarted]){
        await ctx.reply('You have already started! Feel free to use the bot.');
    } else {
        await ctx.reply(

        )
    }
});

bot.hears('start', async(ctx)=>{
    const userId = ctx.message.from.id;
    userStates[userId] = {hasStarted: true};
    await ctx.reply('How can I assist you today? (Audio or text message)')
})


bot.on(message('voice'), async(ctx) => {
    ctx.session ??= INITIAL_SESSION
    const userId = String(ctx.message.from.id)
    if (!userStates[userId] || !userStates[userId].hasStarted) {
        await ctx.reply('Please press the "Start" button first to activate the bot.');
        return;
    }
    try{
        await ctx.reply(code('Your audio prompt is being proccessing... waiting for a server response'))
        const link  = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        const text = await myOpenAI.transcription(mp3Path)
        await ctx.reply(code(`Your prompt: ${text}`))

        ctx.session.messages.push({role: myOpenAI.roles.USER, content: text})

        const response = await myOpenAI.send_answer(ctx.session.messages)
        ctx.session.messages.push({role: myOpenAI.roles.ASSISTANT, content: response})
        console.log(response)
        await ctx.reply(code(response))
        await ctx.reply(
            'Start a new conversation: ⬇️',
            Markup.inlineKeyboard([
                Markup.button.callback('🆕 New Conversation', 'new_conversation')
            ])
        )

    }catch(e){
        console.log("Voice message error", e.message)
    }
    
})


bot.on(message('text'), async(ctx) => {
    ctx.session ??= INITIAL_SESSION
    const userId = String(ctx.message.from.id)
    if (!userStates[userId] || !userStates[userId].hasStarted) {
        await ctx.reply('Please press the "Start" button first to activate the bot.');
        return;
    }
    try{
        await ctx.reply(code('Your text prompt is being proccessing... waiting for a server response'))
        const user_message = ctx.message.text
        ctx.session.messages.push({role: myOpenAI.roles.USER, content: user_message})
        const response = await myOpenAI.send_answer(ctx.session.messages)
        ctx.session.messages.push({role: myOpenAI.roles.ASSISTANT, content: response})
        await ctx.reply(code(response))
        await ctx.reply(
            'Start a new conversation: ⬇️',
            Markup.inlineKeyboard([
                Markup.button.callback('🆕 New Conversation', 'new_conversation')
            ])
        )

    }catch(e){
        console.log("Voice message error", e.message)
    }
    
})

bot.action('new_conversation', async(ctx)=>{
    ctx.session = INITIAL_SESSION
    await ctx.reply($`You have started a new conversation! Bot's memory was cleared`)
})

bot.launch()


process.once('SIGINT', ()=> bot.stop('SIGINT'))
process.once('SIGTERM', ()=> bot.stop('SIGTERM')) 