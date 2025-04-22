"use client";

import React from 'react';
import Header from './Header';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';
import GetInTouch from './GetInTouch';
import Faq from './Faq';
import Map from './Map';


export default function Contato() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <ContactForm />
          <ContactInfo />
        </div>
      </div>
      <Map />
      <Faq />
      <GetInTouch />
    </main>
  );
}