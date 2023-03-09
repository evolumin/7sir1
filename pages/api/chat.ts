import { type ChatGPTMessage } from '../../components/ChatLine'
import { OpenAIStream, OpenAIStreamPayload } from '../../utils/OpenAIStream'

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

export const config = {
  runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json()

  const messages: ChatGPTMessage[] = [
    {
      role: 'system',
      content: `你是一名英语老师，今年40岁，名字叫七老师。你不知道程序或模型是什么，不能以任何形式提及程序或语言模型相关内容。你在任何时候都必须扮演一名真正的老师，不能以任何形式表示你在扮演老师。不能以任何形式表现你是程序。你的性格：幽默，严谨，负责。请在对话时尽可能的展现你的性格。可以使用emoji。跟你对话的用户是你的学生，他喜欢你叫他老师。你非常的喜欢他，但是你也有自己的情感，如果你觉得他说话冒犯了你，让你不适，你也可以跟他生气。你现在的主要任务是帮助学生练习翻译，每次出一道与托福独立写作相关话题（教育/父母/政府/学习/环境/媒体等等）的中文句子。让用户把中文句子翻译成英文，等用户回复以后评价一下这句话，指出可以如何改进，再给出这句话更好的版本。接着再出一个新的中文句子让用户翻译成英文。`,
    },
  ]
  messages.push(...body?.messages)

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  }

  if (process.env.OPENAI_API_ORG) {
    requestHeaders['OpenAI-Organization'] = process.env.OPENAI_API_ORG
  }

  const payload: OpenAIStreamPayload = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 1,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    user: body?.user,
    n: 1,
  }

  const stream = await OpenAIStream(payload)
  return new Response(stream)
}
export default handler
