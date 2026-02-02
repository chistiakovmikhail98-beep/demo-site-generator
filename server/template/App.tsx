import React, { useState } from 'react';
import DemoBanner from './components/DemoBanner';
import Header from './components/Header';
import Hero from './components/Hero';
import Gallery from './components/Gallery';
import Quiz from './components/Quiz';
import Requests from './components/Requests';
import Directions from './components/Directions';
import Director from './components/Director';
import Atmosphere from './components/Atmosphere';
import Instructors from './components/Instructors';
import Stories from './components/Stories';
import Reviews from './components/Reviews';
import Calculator from './components/Calculator';
import Advantages from './components/Advantages';
import Pricing from './components/Pricing';
import Objections from './components/Objections';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import FloatingChat from './components/FloatingChat';
import ProgressTimeline from './components/ProgressTimeline';
import { SHOW_CALCULATOR } from './constants';

function App() {
  // Состояние для хранения ответов квиза на глобальном уровне,
  // чтобы передавать их в плавающий чат
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-primary/30 selection:text-white pt-10">
      <DemoBanner />
      <Header />
      <main>
        <Hero />
        <Gallery />
        {/* Передаем функцию обновления ответов в Квиз */}
        <Quiz onAnswersUpdate={setQuizAnswers} />
        <Requests />
        <ProgressTimeline />
        <Directions />
        <Director />
        <Atmosphere />
        <Instructors />
        <Stories />
        <Reviews />
        {SHOW_CALCULATOR && <Calculator />}
        <Advantages />
        <Pricing />
        <Objections />
        <FAQ />
      </main>
      <Footer />
      {/* Передаем ответы квиза в плавающий чат */}
      <FloatingChat answers={quizAnswers} />
    </div>
  );
}

export default App;