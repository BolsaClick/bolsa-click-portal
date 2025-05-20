'use client'
import React from 'react';
import { CreditCard, ShieldCheck, Lock, HelpCircle } from 'lucide-react';
import Image from 'next/image';

export const SecureFooter: React.FC = () => {
  const theme = process.env.NEXT_PUBLIC_THEME
  const central = theme === 'anhanguera'
    ? 'https://ajuda.anhangueracursos.com.br/pt-br/'
    : 'https://ajuda.bolsaclick.com.br/pt-br/'

  return (
    <footer className="bg-white border-t border-gray-200 py-8 w-full">
      <div className="container mx-auto px-4">

        {/* Payment Methods */}
        <div className="flex justify-center items-center w-full  mb-8">
          <div className="grid grid-cols-3 sm:grid-cols-6  gap-4 justify-center">
            <Image src="/assets/payment/visa.svg" alt="Visa" width={50} height={50} />
            <Image src="/assets/payment/master.svg" alt="Mastercard" width={50} height={50} />
            <Image src="/assets/payment/elo.svg" alt="Elo" width={50} height={50} />
            <Image src="/assets/payment/hyper.svg" alt="Hipercard" width={50} height={50} />
            <Image src="/assets/payment/pix.svg" alt="PIX" width={50} height={50} />
          </div>
        </div>

        {/* Security Info */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8 text-gray-600">
          <div className="flex md:hidden items-center gap-2">
            <Lock className="w-5 h-5" />
            <span className="text-sm text-green-600">Ambiente Protegido</span>
          </div>
          <div className="flex items-center gap-2">

            <CreditCard className="w-5 h-5" />
            <span className="text-sm">Pagamento Seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm">Ambiente Protegido</span>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm">Suporte 24h</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-600 text-center">
          <a href={central} target="_blank" className="hover:text-gray-900">Central de ajuda</a>
          <a href="/ajuda/termos-de-uso" className="hover:text-gray-900">Termos e Condições</a>
          <a href="/ajuda/politica-de-privacidade" className="hover:text-gray-900">Política de privacidade</a>
          <a href="/ajuda/politica-de-cookies" className="hover:text-gray-900">Política de cookies</a>
          <a href="#" className="hover:text-gray-900">Imprensa</a>
          <a href="#" className="hover:text-gray-900">Torne-se um parceiro</a>
        </div>
      </div>
    </footer>
  );
};
