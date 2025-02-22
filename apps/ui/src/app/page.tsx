'use client'

import Image from "next/image";
import { HTMLAttributes, PropsWithChildren, StyleHTMLAttributes, useState } from "react";

import Chats from '../components/Chats';
import Conversation from '../components/Conversation';

export default function Home() {

  const [ loaded, setLoaded ] = useState(false)
  let ready = 0
  let componentReady = (name: string) => {
    return () => {
      console.log(`${name} Service Ready`)
      ready ++;
      if (ready === 2) setLoaded(true)
    }
  }

  return (
    <main className="bg-transparent w-full h-full m-none flex flex-row">
      {
        !loaded ? (<div className="w-full h-full bg-[#20242c] inline-block flex items-center justify-center absolute top-0 left-0 z-[1000]" style={{
          background: "radial-gradient(#030409 0%, #071025 50%, #363c64 100%)",
          backgroundPosition: '50%',
          backgroundSize: '250%',
          opacity: 1
        }}>
          <Image src="/logo.png" className="select-none" width="100" height="100" alt="AnyGPT Logo" />
        </div>) : (<div className="w-full h-full bg-[#20242c] inline-block flex items-center justify-center absolute top-0 left-0 z-[1000]" style={{
          background: "radial-gradient(#030409 0%, #071025 50%, #363c64 100%)",
          backgroundPosition: '50%',
          backgroundSize: '250%',
          animation: 'fadeOut 0.1s ease-in forwards',
          opacity: 0
        }}>
          <Image src="/logo.png" className="select-none" width="100" height="100" alt="AnyGPT Logo" />
        </div>)
      }
      <div className="w-full h-[150%] absolute z-[-1] top-[-50%] left-0" style={{
        background: "radial-gradient(#030409 0%, #071025 50%, #363c64 100%)",
        backgroundPosition: '50%',
        backgroundSize: '400%'
      }}></div>
      <Chats ready={componentReady('Chat')} />
      <Conversation ready={componentReady('Conversation')} />
    </main>
  );
}
