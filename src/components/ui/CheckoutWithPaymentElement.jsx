// src/components/ui/CheckoutWithPaymentElement.jsx
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import React, { useState } from "react";

export default function CheckoutWithPaymentElement({ clientSecret, locale }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success", // ou trate no front
      },
      redirect: "if_required" // evita redirecionar para métodos que não precisam
    });

    if (error) setMsg(error.message);
    else if (paymentIntent) setMsg(`Status: ${paymentIntent.status}`);

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <PaymentElement options={{ layout: "tabs" }} />
      {msg && <div className="mt-2 text-sm text-red-500">{msg}</div>}
      <button disabled={!stripe || loading} className="pay-button mt-4">
        {loading ? "Processando..." : "Pagar"}
      </button>
    </form>
  );
}
