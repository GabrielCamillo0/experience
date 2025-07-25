// src/components/ui/CheckoutForm.jsx
import React, { useState, useContext } from 'react'
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js'
import '../../App.css'
import { LanguageContext } from '../../LanguageContext'

// estilos comuns para todos os Stripe Elements
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': { color: '#aab7c4' },
      padding: '12px 14px'
    },
    invalid: { color: '#9e2146' }
  }
}

export default function CheckoutForm({ totalAmount }) {
  const stripe = useStripe()
  const elements = useElements()
  const { language } = useContext(LanguageContext)

  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsLoading(true)

    // amount em centavos
    const payload = { amount: Math.round(totalAmount * 100) }
    const url = `${import.meta.env.BACKEND_URL}/create-payment-intent`

    try {
      // 1) criar o PaymentIntent no seu backend
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        // tenta extrair mensagem do corpo
        let errText
        try {
          const errJson = await res.json()
          errText = errJson.error || JSON.stringify(errJson)
        } catch {
          errText = await res.text()
        }
        throw new Error(`Erro ao criar PaymentIntent: ${errText}`)
      }

      const { clientSecret } = await res.json()

      // 2) confirmar o pagamento no front
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: { name: 'Cliente Teste' }
          }
        }
      )

      if (error) {
        setErrorMessage(error.message)
        setSuccessMessage(null)
      } else if (paymentIntent.status === 'succeeded') {
        setSuccessMessage(
          language === 'pt'
            ? 'Pagamento realizado com sucesso!'
            : 'Payment successful!'
        )
        setErrorMessage(null)
      } else {
        setErrorMessage(
          language === 'pt'
            ? `Status do pagamento: ${paymentIntent.status}`
            : `Payment status: ${paymentIntent.status}`
        )
        setSuccessMessage(null)
      }
    } catch (err) {
      console.error(err)
      setErrorMessage(
        language === 'pt'
          ? 'Erro na comunicação com o servidor de pagamento.'
          : 'Error communicating with payment server.'
      )
      setSuccessMessage(null)
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <h3 className="mb-4 text-lg font-semibold">
        {language === 'pt' ? 'Detalhes do Cartão' : 'Card Details'}
      </h3>

      <div className="field-group">
        <label>
          {language === 'pt' ? 'Número do Cartão' : 'Card Number'}
        </label>
        <CardNumberElement
          options={CARD_ELEMENT_OPTIONS}
          className="StripeElement"
        />
      </div>

      <div className="field-group">
        <label>
          {language === 'pt' ? 'Validade (MM/AA)' : 'Expiry (MM/YY)'}
        </label>
        <CardExpiryElement
          options={CARD_ELEMENT_OPTIONS}
          className="StripeElement"
        />
      </div>

      <div className="field-group">
        <label>CVC</label>
        <CardCvcElement
          options={CARD_ELEMENT_OPTIONS}
          className="StripeElement"
        />
      </div>

      {errorMessage && (
        <div className="error-message mt-2">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="success-message mt-2">{successMessage}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="pay-button mt-4"
      >
        {isLoading
          ? language === 'pt'
            ? 'Processando...'
            : 'Processing...'
          : language === 'pt'
          ? 'Pagar Agora'
          : 'Pay Now'}
      </button>
    </form>
  )
}
