'use client';

import { useBuilderStore } from '@/lib/builder/store';
import { BRIEF_SECTIONS } from '@/lib/builder/brief-questions';

export default function StepBrief() {
  const studioInfo = useBuilderStore(s => s.studioInfo);
  const heroTitle = useBuilderStore(s => s.heroTitle);
  const heroSubtitle = useBuilderStore(s => s.heroSubtitle);
  const pricingInfo = useBuilderStore(s => s.pricingInfo);
  const updateStudioInfo = useBuilderStore(s => s.updateStudioInfo);
  const setHeroTitle = useBuilderStore(s => s.setHeroTitle);
  const setHeroSubtitle = useBuilderStore(s => s.setHeroSubtitle);
  const setPricingInfo = useBuilderStore(s => s.setPricingInfo);

  const selectedBlocks = useBuilderStore(s => s.selectedBlocks);

  // Map brief field IDs to state
  const getValue = (sectionId: string, questionId: string): string => {
    if (sectionId === 'studio') return (studioInfo as any)[questionId] || '';
    if (sectionId === 'social') return (studioInfo as any)[questionId] || '';
    if (sectionId === 'hero' && questionId === 'heroTitle') return heroTitle;
    if (sectionId === 'hero' && questionId === 'heroSubtitle') return heroSubtitle;
    if (sectionId === 'pricing' && questionId === 'pricingInfo') return pricingInfo;
    return '';
  };

  const setValue = (sectionId: string, questionId: string, value: string) => {
    if (sectionId === 'studio' || sectionId === 'social') {
      updateStudioInfo({ [questionId]: value });
    } else if (sectionId === 'hero' && questionId === 'heroTitle') {
      setHeroTitle(value);
    } else if (sectionId === 'hero' && questionId === 'heroSubtitle') {
      setHeroSubtitle(value);
    } else if (sectionId === 'pricing' && questionId === 'pricingInfo') {
      setPricingInfo(value);
    }
  };

  // Filter sections: show pricing only if pricing block is selected
  const sections = BRIEF_SECTIONS.filter(s => {
    if (s.id === 'pricing') return selectedBlocks.includes('pricing');
    return true;
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Расскажите о студии</h1>
        <p className="text-zinc-400">Заполните информацию — мы используем её для текстов на сайте</p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 className="mb-1 text-lg font-semibold">{section.title}</h2>
            <p className="mb-4 text-sm text-zinc-500">{section.description}</p>

            <div className="space-y-4">
              {section.questions.map((q) => (
                <div key={q.id}>
                  <label className="mb-1 block text-sm font-medium text-zinc-300">
                    {q.label}
                    {q.required && <span className="text-rose-500"> *</span>}
                  </label>
                  {q.type === 'textarea' ? (
                    <textarea
                      value={getValue(section.id, q.id)}
                      onChange={(e) => setValue(section.id, q.id, e.target.value)}
                      placeholder={q.placeholder}
                      rows={4}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-rose-500/50"
                    />
                  ) : (
                    <input
                      type={q.type === 'phone' ? 'tel' : q.type === 'email' ? 'email' : 'text'}
                      value={getValue(section.id, q.id)}
                      onChange={(e) => setValue(section.id, q.id, e.target.value)}
                      placeholder={q.placeholder}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-rose-500/50"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
