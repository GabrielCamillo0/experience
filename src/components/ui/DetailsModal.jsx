// src/components/ui/DetailsModal.jsx
import React from 'react'
import ReactDOM from 'react-dom'

export default function DetailsModal({ item, onClose }) {
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-48 object-cover rounded mb-4"
          />
        )}
        <p className="mb-2">{item.description}</p>
        <p className="mb-1"><strong>Local:</strong> {item.location}</p>
        {item.hours && <p className="mb-1"><strong>Horário:</strong> {item.hours}</p>}
        <p className="mb-1"><strong>Preço:</strong> {item.price}</p>
        <p className="mb-1"><strong>Rating:</strong> {item.rating}</p>
      </div>
    </div>,
    document.body
  )
}
