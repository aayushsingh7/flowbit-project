import { useEffect, useState } from "react";

export default function VannaEmbedded() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://img.vanna.ai/vanna-components.js";
    document.body.appendChild(script);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          className="text-gray-500 flex items-center justify-center px-6 py-4 rounded-full shadow-lg text-xl bg-white border-[2px] border-gray-400 font-bold"
          onClick={() => setIsOpen(true)}
        >
           <img src="/chat.png" alt={`chat-icon`} className="w-7 h-7 mr-[15px]"/> Chat with Data
        </button>
      )}

      {isOpen && (
        <div className="vanna-chat-parent w-[100%] h-[100%] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          <button
            className="self-end text-gray-500 p-2 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
          {/* @ts-ignore */}
          <vanna-chat
            id="vanna-chat"
            api-base={`${process.env.NEXT_PUBLIC_VANNA_API_URL}`}
            sse-endpoint={`${process.env.NEXT_PUBLIC_VANNA_API_URL}/api/vanna/v2/chat_sse`}
            ws-endpoint={`${process.env.NEXT_PUBLIC_VANNA_API_URL}/api/vanna/v2/chat_websocket`}
            poll-endpoint={`${process.env.NEXT_PUBLIC_VANNA_API_URL}/api/vanna/v2/chat_poll`}
            class="flex-1 vanna-chat"  /* adapt styling */
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      )}
    </div>
  );
}
