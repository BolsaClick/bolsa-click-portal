import React from 'react';
import { Search, UserPlus, CheckSquare, GraduationCap } from 'lucide-react';
import './style.css';
import Link from 'next/link';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ number, title, description, icon }) => {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <div className="step-icon">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-blue-950">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const HowWork: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Escolha o curso e cidade",
      description: "Utilize nosso buscador para encontrar as melhores opções de curso na sua região.",
      icon: <Search size={28} />
    },
    {
      number: 2,
      title: "Faça seu cadastro",
      description: "Preencha seus dados pessoais para ter acesso às bolsas exclusivas.",
      icon: <UserPlus size={28} />
    },
    {
      number: 3,
      title: "Escolha sua bolsa ideal",
      description: "Compare as opções e escolha a que melhor se encaixa no seu perfil.",
      icon: <CheckSquare size={28} />
    },
    {
      number: 4,
      title: "Comece a estudar",
      description: "Finalize sua matrícula na instituição e inicie seus estudos com desconto.",
      icon: <GraduationCap size={28} />
    }
  ];

  return (
    <section className="steps-section py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-emerald-600">
          Como conseguir sua bolsas de estudo
        </h2>
        
        <div className="steps-container">
          {steps.map((step) => (
            <Step
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </div>
        
        <div className="flex justify-center mt-12">
          <Link href="/curso" className="cta-button-large">
            Encontre sua bolsa agora
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowWork;