// src/components/ChatButton.jsx
import React from 'react'
import { LifeBuoy } from 'lucide-react'

// Seu número no formato internacional sem "+" nem espaços
const WHATSAPP_NUMBER = '+14076356700'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

export default function ChatButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="chat-button"
      aria-label="Chat WhatsApp"
    >
      <LifeBuoy className="w-6 h-6 text-white" />
    </a>
  )
}
