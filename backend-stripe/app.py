import os
import stripe
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 1. Configure sua chave secreta do Stripe:
stripe.api_key = os.environ['STRIPE_SECRET_KEY']
    

@app.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    try:
        data = request.get_json(force=True)
        amount   = data['amount']
        currency = data.get('currency', 'usd')
        if amount is None:
            return jsonify({'error': 'Amount is required'}), 400

        # 2. Cria o PaymentIntent no Stripe
        intent = stripe.PaymentIntent.create(
            amount=int(amount),   # valor em centavos
            currency=currency,
            payment_method_types=[
          'card',
          'boleto',       # Brasil
          'ideal',        # Europa, se quiser
          'sofort',       # Europa
        ],
            metadata={'integration_checksum': 'manual_integration'},
        )

        return jsonify({'clientSecret': intent.client_secret})
    except Exception as e:
        # 3. Log completo para ajudar no debug
        app.logger.exception("Error creating payment intent:")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0',port=port, debug=True)
