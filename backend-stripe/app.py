# backend-stripe/app.py
import os
import math
import stripe
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

@app.after_request
def add_cors_headers(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"  # ou seu domínio
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp

# Carrega a chave secreta do Stripe via variável de ambiente
VITE_STRIPE_SECRET_KEY = os.getenv("VITE_STRIPE_SECRET_KEY")
if not VITE_STRIPE_SECRET_KEY:
    raise RuntimeError("Defina VITE_STRIPE_SECRET_KEY no ambiente da sua hospedagem.")

stripe.api_key = VITE_STRIPE_SECRET_KEY

# Mapeia idiomas/moedas do front para códigos aceitos pelo Stripe
SUPPORTED_CURRENCIES = {"usd", "brl"}

@app.route("/create-payment-intent", methods=["POST"])
def create_payment_intent():
    try:
        data = request.get_json(force=True) or {}
        amount = data.get("amount",0)
        currency = (data.get("currency") or "usd").lower()

        # validações
        if amount is None:
            return jsonify({"error": "amount é obrigatório"}), 400
        if currency not in SUPPORTED_CURRENCIES:
            return jsonify({"error": f"currency inválida: {currency}"}), 400

        # Stripe espera o valor em centavos (integer)
        # seu front está mandando "total" em dólares/reais => convertemos
        amount_in_cents = int(math.floor(float(amount) * 100))

        if amount_in_cents <= 0:
            return jsonify({"error": "amount deve ser > 0"}), 400
        
        payment_method_types = [
         "card",
         "boleto",          # BRL
         "pix",             # BRL (se ativado)
         "link",            # EUA
         "us_bank_account", # EUA
         "ideal", "sofort", "giropay", # Europa (exemplo)
         # ... adicione os que você ativou no Dashboard
        ]

        # Cria o PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency=currency,       
            payment_method_types=payment_method_types,
            automatic_payment_methods={"enabled": False},
            metadata={"origin": "experience-florida"},
        )

        return jsonify({"clientSecret": intent.client_secret}), 200

    except stripe.error.StripeError as e:
        # Erros vindos do Stripe, com info estruturada
        body = e.json_body if hasattr(e, "json_body") else {}
        err = body.get("error", {})
        return jsonify({"error": err.get("message", str(e))}), 400

    except Exception as e:
        app.logger.exception("Erro ao criar PaymentIntent")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
