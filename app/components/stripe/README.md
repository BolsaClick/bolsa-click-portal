# Stripe Elements – Pagamento com cartão

Integração com **Stripe Elements** para pagamento com cartão de crédito no fluxo de checkout.

## Pacotes

Já instalados no projeto:

- `@stripe/stripe-js` – carrega o Stripe.js
- `@stripe/react-stripe-js` – componentes React (Elements, PaymentElement, etc.)

## Variável de ambiente

No `.env.local` (ou no arquivo de env que o Next carrega):

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxx
```

Use a chave **pública** (publishable) do Stripe. Nunca commite a chave secreta no front.

## Fluxo

1. **Dados pessoais** – Usuário preenche nome, CPF, email, telefone.
2. **Criar checkout** – `POST /api/checkout` com `paymentMethod: "card"`.
3. **Resposta da API (Elysium)** – O portal chama `POST /api/checkout` (que repassa ao Elysium). Exemplo de resposta para `paymentMethod: "card"`:
   ```json
   {
     "success": true,
     "transactionId": "d6945c70-1660-4250-8e94-fe55f1795bfa",
     "paymentMethod": "card",
     "clientSecret": "pi_xxx_secret_xxx",
     "paymentIntentId": "pi_xxx",
     "amount": 1000,
     "originalAmount": 1000,
     "discountApplied": 0
   }
   ```
   - `amount`: valor em **centavos** (ex.: 1000 = R$ 10,00).
   - Base URL do Elysium: configurar `NEXT_PUBLIC_ELYSIUM_API` (ex.: `https://elysium-api.inovitdigital.com.br`).
4. **Formulário** – O `clientSecret` é passado para `StripeProvider`; o `CardPaymentForm` renderiza o **PaymentElement** e usa `stripe.confirmPayment()`.
5. **Sucesso** – Após confirmação, redirecionamento para a página de sucesso ou callback `onSuccess`.

## Uso

### Opção 1: componente completo `StripeCheckout`

Recebe dados do cliente e valor; chama a API, exibe o botão “Pagar com cartão” e, após criar o checkout, mostra o formulário de cartão:

```tsx
import { StripeCheckout } from '@/app/components/stripe'

<StripeCheckout
  customerData={{
    name: '...',
    cpf: '...',
    email: '...',
    phone: '...',
  }}
  amountInCents={10000}
  description="Matrícula - Curso X"
  brand="anhanguera"
  returnUrl={`${window.location.origin}/checkout/matricula/sucesso`}
  onSuccess={(paymentIntentId, transactionId) => {
    // Criar matrícula, redirecionar etc.
  }}
  onError={(msg) => toast.error(msg)}
/>
```

### Opção 2: usar só o formulário com `clientSecret` já em mãos

Se você já tem o `clientSecret` (por exemplo, de outra chamada à API):

```tsx
import { StripeProvider } from '@/app/components/stripe'
import { CardPaymentForm } from '@/app/components/stripe'

<StripeProvider clientSecret={clientSecret}>
  <CardPaymentForm
    amount={1000}
    transactionId={transactionId}
    returnUrl="/checkout/sucesso"
    onSuccess={(paymentIntentId) => { /* ... */ }}
    onError={(msg) => { /* ... */ }}
  />
</StripeProvider>
```

- `amount`: em **centavos** (igual à resposta da API).
- Se `onSuccess` for passado, o redirect pós-pagamento fica a cargo do seu código; caso contrário, o componente redireciona para `returnUrl`.

## Componentes

| Componente        | Função                                                                 |
|-------------------|------------------------------------------------------------------------|
| `StripeProvider`  | Envolve a árvore com `<Elements>` e o `clientSecret` do PaymentIntent. |
| `StripeCheckout`  | Orquestra: valida dados → POST /api/checkout → exibe formulário.        |
| `CardPaymentForm` | PaymentElement + botão de pagamento + `confirmPayment` + redirect.    |
