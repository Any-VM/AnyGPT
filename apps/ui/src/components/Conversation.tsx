'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const defaultChat = (<>
  <div className="flex flex-row w-[45%] justify-between items-center gap-5 mb-5 select-none">
    <div className="cursor-pointer flex flex-row rounded-md border-[1px] border-[#9A9B9F] flex-1 py-1 px-2 items-center">
      <div className="flex flex-col">
        <span className="text-[#8E9CB1] text-[13px] mb-[-5px]">Model</span>
        <span className="text-whites text-[14px]">Gemini</span>
      </div>
      <svg className="ml-auto" width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M18.1186 10.1241C18.1186 9.79277 17.85 9.52414 17.5186 9.52414C17.1872 9.52414 16.9186 9.79277 16.9186 10.1241V17.5999H9.44299C9.11162 17.5999 8.84299 17.8685 8.84299 18.1999C8.84299 18.5312 9.11162 18.7999 9.44299 18.7999H16.9186V26.2755C16.9186 26.6069 17.1872 26.8755 17.5186 26.8755C17.85 26.8755 18.1186 26.6069 18.1186 26.2755V18.7999H25.5944C25.9258 18.7999 26.1944 18.5312 26.1944 18.1999C26.1944 17.8685 25.9258 17.5999 25.5944 17.5999H18.1186V10.1241Z" fill="#C5C5D1"/></svg>
    </div>
    <div className="cursor-pointer flex flex-row rounded-md border-[1px] border-[#9A9B9F] flex-1 py-1 px-2 items-center">
      <div className="flex flex-col">
        <span className="text-[#8E9CB1] text-[13px] mb-[-5px]">Check out</span>
        <span className="text-whites text-[14px]">AnyWeb</span>
      </div>
      <svg className="ml-auto" width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 15.4667V21.8667C17 22.4325 16.7752 22.9751 16.3752 23.3752C15.9751 23.7752 15.4325 24 14.8667 24H3.13333C2.56754 24 2.02492 23.7752 1.62484 23.3752C1.22476 22.9751 1 22.4325 1 21.8667V10.1333C1 9.56754 1.22476 9.02492 1.62484 8.62484C2.02492 8.22476 2.56754 8 3.13333 8H9.53333" stroke="#C5C5D1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 5H20V11" stroke="#C5C5D1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 17L20 5" stroke="#C5C5D1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  </div>
  <div className="flex flex-col items-center">
    <span>
      anyGPT
    </span>
    <span className="text-[#8E9CB1]">
      placeholder
    </span>
  </div>
</>);

function Conversation({ ready }: any) {
  const pathname = usePathname()
  const router = useRouter()
  const [ chatData, setChatData ] = useState<Conversation>()
  const [ chat, setChat ] = useState(
    defaultChat
  )
  
  function saveChatData(data: Conversation) {
    fetch('/api/conversations/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
  }

  function apiMessages(messages: Message[]) {
    const newData = []

    for (let message of messages) {
      newData.push({
        content: message.content,
        role: message.sender
      })
    }

    return newData
  }

  const sendChat: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const input = form.querySelector("input");
    if (!input) return;
  
    const prompt = input.value;
    input.value = "";

    const senderMsg: Message = {
      id: messageID(),
      content: prompt,
      sender: 'user',
      timestamp: Date.now()
    }

    let nameRequest: Promise<Response> | null = null;

    if (!chatData!.messages.length) {
      nameRequest = fetch('https://gpt.anyvm.tech/v1/chat/completions', {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sk-WNOUdA3K6M5wzTMARv9ceEyUsXlogWDfup34PR4gDSANCeOw"
        },
        method: "POST",
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: 'user',
              content: `Using this message, give me a boring name for this conversation that will sum it up to a simple phrase. Only respond with the name. Message: ${prompt}`
            }
          ],
          stream: false
        })
      });
    }

    let newData: Conversation = Object.assign({}, chatData) as any;

    newData.messages.push(senderMsg)
    newData.lastMessage = Date.now()

    setChatData(newData)
    saveChatData(newData)
    loadChat(newData)
  
    const req = fetch('https://gpt.anyvm.tech/v1/chat/completions', {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-WNOUdA3K6M5wzTMARv9ceEyUsXlogWDfup34PR4gDSANCeOw"
      },
      method: "POST",
      body: JSON.stringify({
        model: chatData!.model,
        messages: apiMessages(chatData!.messages),
        stream: true
      })
    });
  
    const stream = new ReadableStream({
      start(controller) {
        req.then(async (res) => {
          const reader = res.body?.getReader();
          if (!reader) return;
  
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
  
          controller.close();
        });
      }
    });
  
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = [];

    const mid = messageID();
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
  
      const text = decoder.decode(value, { stream: true });
  
      for (let line of text.split("\n")) {
        if (!line) continue;
        
        try {
          line = JSON.parse(line.replace(/^data:\s/, ""));
  
          buffer.push(line)
        } catch {}
      }

      let tempData: Conversation = Object.assign({}, chatData) as any;
      tempData.messages = [...tempData.messages]

      const streamMsg: Message = {
        id: mid,
        content: buffer.map((chunk: any) => chunk.choices[0].delta.content).join(''),
        sender: 'system',
        timestamp: Date.now()
      }

      tempData.messages.push(streamMsg)

      loadChat(tempData)
    }

    const content = buffer.map((chunk: any) => chunk.choices[0].delta.content).join('');

    const resMsg: Message = {
      id: mid,
      content,
      sender: 'system',
      timestamp: Date.now()
    }

    let newerData: Conversation = Object.assign({}, chatData) as any;

    newerData.messages.push(resMsg)
    newerData.lastMessage = Date.now()

    if (nameRequest) {
      const data = await nameRequest.then(res => res.json())
      const suggestion = data.choices[0].message.content;
      if (suggestion) newerData.name = suggestion.replace(/['"`]/gi, "")
      if (typeof window !== 'undefined' && typeof (window as any).reloadChats == 'function') {
        (window as any).reloadChats(chatData?.id, suggestion)
      }
    }

    setChatData(newerData)
    saveChatData(newerData)
    loadChat(newerData)
  }

  function messageID() {
    const gen = () => Math.floor(Math.random() * 1e+12).toString(36)

    return `msg-${Array.from('*'.repeat(4)).map(e => gen()).join("")}`;
  }

  function loadChat(data: Conversation) {
    if (!data.messages.length) {
      return setChat(
        defaultChat
      )
    }

    setChat(
      <>
        {
          data.messages.map(e => {
            return JSON.stringify(e)
          })
        }
      </>
    )

    const chats = document.getElementById('chat');
    if (chats) {
      chats.scrollTop = chats.scrollHeight;
    }
  }

  useEffect(() => {
    if (location.pathname.match(/^\/chat\/[a-zA-Z0-9\-]+/)) {
      const id = location.pathname.match(/^\/chat\/([a-zA-Z0-9\-]+)/)?.[1]

      fetch('/api/conversations/get', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          id
        })
      }).then(res => res.json()).then(data => {
        setChatData(data)
        loadChat(data)
        ready()
      })
    }
  }, [pathname, ready])

  return (
    <>
      <div className="bg-[#293C5B]/30 h-full flex-1 p-3 justify-end inline-flex flex-col items-center">
        <div className="m-0 p-0 mb-5 w-full flex flex-col items-center overflow-y-auto break-all" id="chat">
          { chat }
        </div>
        <form onSubmit={(e) => sendChat(e)} className="w-[70%] flex flex-row items-center justify-center border-[2px] rounded-md border-[#8E9CB1] bg-[#1E293B]/30">
          <input required className="outline-none bg-transparent rounded-md p-2 flex-1 placeholder:text-[#8E9CB1]/70" placeholder="Prompt..." style={{
            textShadow: "0 0 1px #8E9CB1"
          }} />
          <button className="bg-transparent rounded-md p-2 text-[14px] flex items-center justify-center mr-1">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="17px" width="17px" xmlns="http://www.w3.org/2000/svg"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"></path></svg>
          </button>
        </form>
      </div>
    </>
  )
}

export default Conversation;