'use client';

import Image from "next/image";
import { PropsWithChildren, ReactEventHandler, StyleHTMLAttributes, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation'
import Link from "next/link";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function Chats({ ready }: any) {
  const router = useRouter();
  const pathname = usePathname()
  const [chats, setChats] = useState<any[]>([]);
  const [ loaded, setLoaded ] = useState(false);

  async function reloadChats(id?: string, name?: string) {
    if (id && name) {
      if (document.querySelector(`a[data-chat="${id}"] span`)) {
        (document.querySelector(`a[data-chat="${id}"] span`) as HTMLSpanElement).style.opacity = "0"
        await wait(100);
        (document.querySelector(`a[data-chat="${id}"] span`) as HTMLSpanElement).innerText = name;
        (document.querySelector(`a[data-chat="${id}"] span`) as HTMLSpanElement).style.opacity = "1"
        return;
      }
    }
    await fetch('/api/conversations/all')
      .then(response => response.json())
      .then(data => setChats(data))
  }

  if (typeof window !== 'undefined') {
    (window as any).reloadChats = reloadChats
  }

  async function createChat() {
    const data = await fetch('/api/conversations/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'New Chat', messages: [], model: 'gpt-4-turbo' })
    })
    .then(response => response.json())

    await reloadChats()

    router.push('/chat/' + data.id)

    return true;
  }

  useEffect(() => {
    reloadChats().then(() => {
      ready()
    });
  }, [ready]);

  return (
    <>
      <div className="bg-[#020817]/20 h-full inline-block p-[7px] flex flex-col" style={{
        flexBasis: '18%',
        minWidth: '230px'
      }}>
        <MenuItem onClick={ () => {
          createChat().then(async () => {
            await wait(50)
            const chats = document.getElementById('chats');
            if (chats) {
              chats.scrollTop = chats.scrollHeight;
            }
          })
        } } bc="#8E9CB1" className="shadow-[inset_0px_0px_0px_rgb(58_83_125)] hover:shadow-[inset_0px_0px_25px_rgb(58_83_125)]" style={{}}>
          <span className="text-[rgb(142_156_177_/_70%)]" style={{
            textShadow: '0 0 4px #666e7a',
            fontSize: '14px',
            color: '#8E9CB1'
          }}>New Chat</span>
          <svg className="ml-auto mr-4 fill-[#8E9CB1]/70"height="12"viewBox="0 0 16 16"width="12"xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd"d="M9.22601 1.27362C9.22601 0.721336 8.7783 0.273621 8.22601 0.273621C7.67373 0.273621 7.22601 0.721336 7.22601 1.27362V7.00904L1.49092 7.06115C0.938653 7.06617 0.495024 7.51793 0.500042 8.07019C0.50506 8.62246 0.956824 9.06608 1.50909 9.06107L7.22601 9.00912V14.7263C7.22601 15.2786 7.67373 15.7263 8.22601 15.7263C8.7783 15.7263 9.22601 15.2786 9.22601 14.7263V8.99095L14.9612 8.93884C15.5135 8.93382 15.9571 8.48206 15.9521 7.9298C15.9471 7.37754 15.4953 6.93391 14.9431 6.93892L9.22601 6.99087V1.27362Z"fill="#8E9CB1"fillOpacity="0.7"fillRule="evenodd"/></svg>
        </MenuItem>
        <div className="flex flex-col m-0 p-0 overflow-y-auto flex-1 scroll-smooth" id="chats">
          {
            chats.map((chat, index) => {
              var style: any = {
                textShadow: '0 0 2px #010052',
              }

              let currentChat = pathname === `/chat/${chat.id}`

              if (currentChat) {
                style.boxShadow = "inset 0px 0px 25px #1E293B";
              }

              var m = (<MenuItem href={'/chat/' + chat.id} id={chat.id} key={index} bc={currentChat ? '#323D4F' : 'transparent'} onClick={() => {
                router.push('/chat/' + chat.id)
              }} style={style}>
                <svg className="mr-2.5" width="15" height="15" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.5 17.6667C26.5 18.4034 26.2073 19.1099 25.6864 19.6309C25.1655 20.1518 24.4589 20.4444 23.7222 20.4444H7.05556L1.5 26V3.77778C1.5 3.04107 1.79266 2.33453 2.31359 1.81359C2.83453 1.29266 3.54107 1 4.27778 1H23.7222C24.4589 1 25.1655 1.29266 25.6864 1.81359C26.2073 2.33453 26.5 3.04107 26.5 3.77778V17.6667Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="opacity-1 transition duration-100">{ chat.name }</span>
              </MenuItem>)

              return m
            })
          }
        </div>
        <div className="mt-auto h-auto w-full">
          <hr className="" style={{
            "height": "2px",
            "width": "calc(100% + 14px)",
            "border": "none",
            "marginLeft": "-7px",
            "opacity": "0.6",
            "marginBottom": "6px",
            "backgroundImage": "linear-gradient(90deg, rgb(50 61 79 / 12.6%), rgb(50 61 79 / 60%) 35%, rgb(50 61 79 / 60%) 65%, rgb(50 61 79 / 12.6%))",
            "boxShadow": "0 1px 8px #1E293B, 0 20px 25px #1E293B"
          }} />
          <MenuItem bc="transparent" style={{
            fontWeight: 'normal',
            marginBottom: '2px'
          }}>
            <svg className="*:stroke-[#8E9CB1] fill-transparent mr-3" width="16" height="16" viewBox="0 0 26 29" fill="#eee" xmlns="http://www.w3.org/2000/svg"><path d="M1.32874 6.84302H3.88109H24.3" stroke="#C5C5D1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21.7476 6.84294V24.7095C21.7476 25.3864 21.4787 26.0356 21 26.5142C20.5214 26.9929 19.8722 27.2618 19.1953 27.2618H6.43346C5.75653 27.2618 5.10733 26.9929 4.62867 26.5142C4.15001 26.0356 3.8811 25.3864 3.8811 24.7095V6.84294M7.70964 6.84294V4.29058C7.70964 3.61365 7.97855 2.96445 8.45721 2.48579C8.93587 2.00713 9.58507 1.73822 10.262 1.73822H15.3667C16.0436 1.73822 16.6928 2.00713 17.1715 2.48579C17.6502 2.96445 17.9191 3.61365 17.9191 4.29058V6.84294" stroke="#C5C5D1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.2618 13.2239V20.881" stroke="#C5C5D1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.367 13.2239V20.881" stroke="#C5C5D1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="pt-0.5">
              Clear Conversations
            </span>
          </MenuItem>
          <MenuItem bc="transparent" style={{
            fontWeight: 'normal',
            marginBottom: '2px'
          }}>
            <svg className="*:stroke-[#8E9CB1] fill-transparent mr-3" width="16" height="16" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.41667 16.8333C3.2825 18.6667 2.83333 15 1 15" stroke="#8E9CB1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.5105 19.3333V15.6667C13.638 14.5183 13.3088 13.3659 12.5938 12.4583C15.3438 12.4583 18.0938 10.625 18.0938 7.41667C18.1672 6.27083 17.8463 5.14333 17.1772 4.20833C17.4338 3.15417 17.4338 2.05417 17.1772 1C17.1772 1 16.2605 1 14.4272 2.375C12.0072 1.91667 9.51385 1.91667 7.09385 2.375C5.26051 1 4.34385 1 4.34385 1C4.06885 2.05417 4.06885 3.15417 4.34385 4.20833C3.6764 5.13956 3.35244 6.27339 3.42718 7.41667C3.42718 10.625 6.17718 12.4583 8.92718 12.4583C8.56968 12.9075 8.30384 13.4208 8.14801 13.9708C7.99218 14.5208 7.94635 15.0983 8.01051 15.6667V19.3333" stroke="#8E9CB1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="pt-0.5">
              Github Organization
            </span>
          </MenuItem>
          <MenuItem bc="transparent" style={{
            fontWeight: 'normal',
            marginBottom: '2px'
          }}>
            <svg className="*:stroke-[#8E9CB1] fill-transparent mr-3" width="16" height="16" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.1666 7.04169H10.5416" stroke="#8E9CB1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.4166 16.6251H4.79163" stroke="#8E9CB1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.2916 19.5001C17.8794 19.5001 19.1666 18.2129 19.1666 16.6251C19.1666 15.0372 17.8794 13.7501 16.2916 13.7501C14.7038 13.7501 13.4166 15.0372 13.4166 16.6251C13.4166 18.2129 14.7038 19.5001 16.2916 19.5001Z" stroke="#8E9CB1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.70837 9.91669C8.29619 9.91669 9.58337 8.62951 9.58337 7.04169C9.58337 5.45387 8.29619 4.16669 6.70837 4.16669C5.12056 4.16669 3.83337 5.45387 3.83337 7.04169C3.83337 8.62951 5.12056 9.91669 6.70837 9.91669Z" stroke="#8E9CB1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="pt-0.5">
              Settings
            </span>
          </MenuItem>
          <MenuItem bc="transparent" style={{
            fontWeight: 'normal',
            marginBottom: '0px'
          }}>
            <svg className="*:stroke-[#8E9CB1] fill-transparent mr-3" width="16" height="16" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 21.8334V19.5C19 18.2624 18.5259 17.0754 17.682 16.2002C16.8381 15.325 15.6935 14.8334 14.5 14.8334H5.5C4.30653 14.8334 3.16193 15.325 2.31802 16.2002C1.47411 17.0754 1 18.2624 1 19.5V21.8334" stroke="#8E9CB1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 10.8334C11.9853 10.8334 14 8.81866 14 6.33337C14 3.84809 11.9853 1.83337 9.5 1.83337C7.01472 1.83337 5 3.84809 5 6.33337C5 8.81866 7.01472 10.8334 9.5 10.8334Z" stroke="#8E9CB1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="pt-0.5">
              Account
            </span>
          </MenuItem>
        </div>
      </div>
    </>
  );
}

function MenuItem({ children, bc, style, className, onClick, href, id }: PropsWithChildren & {bc: string, style: any, className?: string, onClick?: (e: ReactEventHandler<MouseEvent>) => void, href?: string, id?: string}) {
  return (
    <Link href={href || '#'} data-chat={id} onClick={(onClick as any) || ((e) => null)} className={"cursor-default py-3 pl-3 flex flex-row items-center mb-[6px] border-transparent hover:border-[#2D3F5E]/50 transition-all duration-100 " + (className || "")} style={{
      borderWidth: `1px`,
      borderStyle: 'solid',
      borderColor: bc.replace('transparent', ''),
      borderRadius: '6px',
      fontSize: '14px',
      ...(style || {})
    }}>
      { children }
    </Link>
  );
}

export default Chats;

{/*
<MenuItem bc="#323D4F" style={{
  boxShadow: "inset 0px 0px 25px #1E293B",
  textShadow: '0 0 2px #010052'
}}>
  <svg className="mr-2" width="17" height="17" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.5 17.6667C26.5 18.4034 26.2073 19.1099 25.6864 19.6309C25.1655 20.1518 24.4589 20.4444 23.7222 20.4444H7.05556L1.5 26V3.77778C1.5 3.04107 1.79266 2.33453 2.31359 1.81359C2.83453 1.29266 3.54107 1 4.27778 1H23.7222C24.4589 1 25.1655 1.29266 25.6864 1.81359C26.2073 2.33453 26.5 3.04107 26.5 3.77778V17.6667Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  Current Chat
  <div className="flex flex-row ml-auto mr-3">
    <svg className="mr-3" width="16" height="16" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.3589 1.98996C19.8852 1.46369 20.599 1.16803 21.3432 1.16803C21.7117 1.16803 22.0767 1.24062 22.4171 1.38164C22.7576 1.52267 23.067 1.72938 23.3275 1.98996C23.5881 2.25055 23.7948 2.55991 23.9359 2.90038C24.0769 3.24085 24.1495 3.60576 24.1495 3.97428C24.1495 4.34281 24.0769 4.70772 23.9359 5.04819C23.7948 5.38866 23.5881 5.69802 23.3275 5.95861L6.79152 22.4946L1.5 23.8175L2.82288 18.526L19.3589 1.98996Z" stroke="#C5C5D1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    <svg width="16" height="16" viewBox="0 0 26 29" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.32874 6.84302H3.88109H24.3" stroke="#C5C5D1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21.7476 6.84294V24.7095C21.7476 25.3864 21.4787 26.0356 21 26.5142C20.5214 26.9929 19.8722 27.2618 19.1953 27.2618H6.43346C5.75653 27.2618 5.10733 26.9929 4.62867 26.5142C4.15001 26.0356 3.8811 25.3864 3.8811 24.7095V6.84294M7.70964 6.84294V4.29058C7.70964 3.61365 7.97855 2.96445 8.45721 2.48579C8.93587 2.00713 9.58507 1.73822 10.262 1.73822H15.3667C16.0436 1.73822 16.6928 2.00713 17.1715 2.48579C17.6502 2.96445 17.9191 3.61365 17.9191 4.29058V6.84294" stroke="#C5C5D1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.2618 13.2239V20.881" stroke="#C5C5D1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.367 13.2239V20.881" stroke="#C5C5D1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </div>
</MenuItem>
<MenuItem bc="transparent" style={{
  textShadow: '0 0 2px #010052',
}}>
  <svg className="mr-2" width="17" height="17" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.5 17.6667C26.5 18.4034 26.2073 19.1099 25.6864 19.6309C25.1655 20.1518 24.4589 20.4444 23.7222 20.4444H7.05556L1.5 26V3.77778C1.5 3.04107 1.79266 2.33453 2.31359 1.81359C2.83453 1.29266 3.54107 1 4.27778 1H23.7222C24.4589 1 25.1655 1.29266 25.6864 1.81359C26.2073 2.33453 26.5 3.04107 26.5 3.77778V17.6667Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  Autonamed Chat?
</MenuItem>
<MenuItem bc="transparent" style={{
  textShadow: '0 0 2px #010052',
}}>
  <svg className="mr-2" width="17" height="17" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.5 17.6667C26.5 18.4034 26.2073 19.1099 25.6864 19.6309C25.1655 20.1518 24.4589 20.4444 23.7222 20.4444H7.05556L1.5 26V3.77778C1.5 3.04107 1.79266 2.33453 2.31359 1.81359C2.83453 1.29266 3.54107 1 4.27778 1H23.7222C24.4589 1 25.1655 1.29266 25.6864 1.81359C26.2073 2.33453 26.5 3.04107 26.5 3.77778V17.6667Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  old chat
</MenuItem>
<MenuItem bc="transparent" style={{
  textShadow: '0 0 2px #010052',
}}>
  <svg className="mr-2" width="17" height="17" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.5 17.6667C26.5 18.4034 26.2073 19.1099 25.6864 19.6309C25.1655 20.1518 24.4589 20.4444 23.7222 20.4444H7.05556L1.5 26V3.77778C1.5 3.04107 1.79266 2.33453 2.31359 1.81359C2.83453 1.29266 3.54107 1 4.27778 1H23.7222C24.4589 1 25.1655 1.29266 25.6864 1.81359C26.2073 2.33453 26.5 3.04107 26.5 3.77778V17.6667Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  Chat Thats Hovered Over
</MenuItem>
<MenuItem bc="transparent" style={{
  textShadow: '0 0 2px #010052',
}}>
  <svg className="mr-2" width="17" height="17" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.5 17.6667C26.5 18.4034 26.2073 19.1099 25.6864 19.6309C25.1655 20.1518 24.4589 20.4444 23.7222 20.4444H7.05556L1.5 26V3.77778C1.5 3.04107 1.79266 2.33453 2.31359 1.81359C2.83453 1.29266 3.54107 1 4.27778 1H23.7222C24.4589 1 25.1655 1.29266 25.6864 1.81359C26.2073 2.33453 26.5 3.04107 26.5 3.77778V17.6667Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  Can squirrels fly?
</MenuItem>
*/}