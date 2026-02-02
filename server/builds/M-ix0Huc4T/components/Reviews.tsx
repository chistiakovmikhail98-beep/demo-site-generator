
import React from 'react';
import Section from './Section';
import { Star, MapPin } from 'lucide-react';

const REVIEWS = [
  {
    name: "Никита Рассказов",
    source: "Онлайн-консультация",
    text: "Сначала ходил в студию на занятия, затем не смог прийти - решил взять онлайн-консультацию. В итоге оба формата мне очень понравились, Виктория все объясняет очень понятно, а упражнения, действительно, помогают. В том числе и на онлайн-занятиях Виктория внимательно смотрит по веб-камере за выполнением упражнения, корректирует его и помогает разобраться - как делать правильно)"
  },
  {
    name: "Анна Скрементова",
    source: "Индивидуальные занятия",
    text: "Спасибо Виктории за индивидуальные занятия по йоге! После них я чувствую себя пушинкой, тело говорит \"спасибо\". В студии такая атмосфера,что хочется вытворять самые сложные задания 😆, потому что достаточно места, отличный ковролин, светло и конечно же, учитель отмечающий прогресс твоих стараний 💪"
  },
  {
    name: "Ирина В.",
    source: "Отзыв",
    text: "Посетили с мужем студию Виктории. Замечательная, располагающая обстановка, прекрасные девушки. Все занятия на высшем уровне, спасибо огромное за помощь,подбор упражнений и грамотный подход к нашей \"проблемке\".🤗"
  },
  {
    name: "Анастасия Н.",
    source: "Отзыв",
    text: "Ходим с дочерью заниматься в эту студию. И это не просто зал для тренировок, это очень уютное и атмосферное пространство для занятий. Какие чудесные тренера - грамотные и внимательные. Много интересных мероприятий проходит. Так что можно подтянуть тело, отдохнуть душой и наполниться энергией."
  },
  {
    name: "Наталия Т.",
    source: "Отзыв",
    text: "Очень уютная студия, прям уходить не хочется, сделана с любовью. Атмосфера прекрасная, потому что создана руками мастера своего дела Викторией. Вика поможет в любом вопросе касаемо вашего тела, расскажет, покажет, объяснит. Если у вас есть проблеммы в теле, обязательно приходите к Виктории, она вам поможет 🙂"
  }
];

const Reviews: React.FC = () => {
  return (
    <Section className="bg-zinc-50 overflow-hidden !py-24">
       <style>{`
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-right {
          animation: marquee-right 80s linear infinite;
        }
        .hover-pause:hover .animate-marquee-right {
          animation-play-state: paused;
        }
      `}</style>

      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-zinc-900 uppercase tracking-tight mb-4">
          Отзывы <span className="text-primary">наших учеников</span>
        </h2>
        <p className="text-zinc-500 text-lg">
           Мы ценим доверие каждого гостя нашей студии
        </p>
      </div>

      <div className="relative w-full hover-pause">
        <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-zinc-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-zinc-50 to-transparent z-10 pointer-events-none"></div>

        <div className="flex overflow-hidden">
          <div className="flex gap-6 animate-marquee-right w-max px-3">
            {[...REVIEWS, ...REVIEWS].map((review, idx) => (
              <div 
                key={idx} 
                className="w-[400px] bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-zinc-100 flex flex-col gap-4 flex-shrink-0 hover:shadow-xl transition-all duration-300"
              >
                 <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-zinc-900 text-lg">{review.name}</h4>
                        <div className="flex items-center gap-1 text-xs font-medium text-zinc-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="underline decoration-primary/30 decoration-wavy underline-offset-2">{review.source}</span>
                        </div>
                    </div>
                    <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                    </div>
                 </div>
                 <p className="text-zinc-600 leading-relaxed text-sm italic">
                    «{review.text}»
                 </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Reviews;
