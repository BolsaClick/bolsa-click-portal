"use client";

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
    <main className="min-h-screen bg-white">
      <Header />
      <Mission />
      <Stats />
      <Timeline />
      <Values />
      {/* <Team /> */}
      <CallToAction />
    </main>
  );
}