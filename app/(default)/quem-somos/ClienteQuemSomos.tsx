'use client';

import React from 'react';

import Header from './Header';
import Mission from './Mission';
import Stats from './Stats';
import Timeline from './Timeline';
import Values from './Values';
// import Team from './Team';
import CallToAction from './CallToAction';

export default function QuemSomosCliente() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Bolsa Click",
            "url": "https://www.bolsaclick.com.br",
            "logo": "https://www.bolsaclick.com.br/assets/logo.png",
            "description":
              "Plataforma educacional que conecta estudantes a bolsas de estudo com até 85% de desconto em universidades de todo o Brasil.",
            "sameAs": [
              "https://www.instagram.com/bolsaclick",
              "https://www.facebook.com/bolsaclick"
            ],
            "foundingDate": "2023",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "BR"
            }
          }),
        }}
      />
      
      <main className="min-h-screen bg-white">
        <Header />
        <Mission />
        <Stats />
        <Timeline />
        <Values />
        {/* <Team /> */}
        <CallToAction />
      </main>
    </>
  );
}
