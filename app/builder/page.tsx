'use client';

import { useBuilderStore } from '@/lib/builder/store';
import BuilderProgress from '@/components/builder/BuilderProgress';
import StepNiche from '@/components/builder/steps/StepNiche';
import StepBlocks from '@/components/builder/steps/StepBlocks';
import StepBrief from '@/components/builder/steps/StepBrief';
import StepDesign from '@/components/builder/steps/StepDesign';
import StepPreview from '@/components/builder/steps/StepPreview';
import StepRegister from '@/components/builder/steps/StepRegister';
import StepPayment from '@/components/builder/steps/StepPayment';
import { getRequiredBlocks } from '@/lib/builder/block-definitions';

const STEP_COMPONENTS = [
  StepNiche,
  StepBlocks,
  StepBrief,
  StepDesign,
  StepPreview,
  StepRegister,
  StepPayment,
];

export default function BuilderPage() {
  const step = useBuilderStore(s => s.step);
  const setStep = useBuilderStore(s => s.setStep);
  const nextStep = useBuilderStore(s => s.nextStep);
  const prevStep = useBuilderStore(s => s.prevStep);

  const StepComponent = STEP_COMPONENTS[step];
  const isPreviewStep = step === 4;

  // Validation per step
  const canGoNext = useCanGoNext(step);

  return (
    <div className="flex min-h-screen flex-col">
      <BuilderProgress currentStep={step} onStepClick={(s) => s < step && setStep(s)} />

      {/* Step content */}
      <main className={isPreviewStep ? '' : 'flex-1 px-4 py-8 sm:px-6 sm:py-12'}>
        <StepComponent />
      </main>

      {/* Navigation */}
      {!isPreviewStep && step < 6 && (
        <div className="sticky bottom-0 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white disabled:invisible"
            >
              ← Назад
            </button>

            <button
              onClick={nextStep}
              disabled={!canGoNext}
              className={`
                rounded-xl px-6 py-2.5 text-sm font-bold transition-all
                ${canGoNext
                  ? 'bg-rose-500 text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/20'
                  : 'cursor-not-allowed bg-zinc-800 text-zinc-600'
                }
              `}
            >
              Далее →
            </button>
          </div>
        </div>
      )}

      {/* Preview step has its own navigation */}
      {isPreviewStep && (
        <div className="sticky bottom-0 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <button
              onClick={prevStep}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            >
              ← Назад к редактированию
            </button>
            <button
              onClick={nextStep}
              className="rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-rose-600"
            >
              Всё выглядит отлично →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function useCanGoNext(step: number): boolean {
  const niche = useBuilderStore(s => s.niche);
  const selectedBlocks = useBuilderStore(s => s.selectedBlocks);
  const studioInfo = useBuilderStore(s => s.studioInfo);
  const regEmail = useBuilderStore(s => s.regEmail);
  const regPhone = useBuilderStore(s => s.regPhone);

  switch (step) {
    case 0: return niche !== null;
    case 1: return selectedBlocks.length >= 3;
    case 2: return !!(studioInfo.name && studioInfo.city);
    case 3: return true; // design always passable
    case 4: return true; // preview always passable
    case 5: return !!(regEmail && (regPhone || studioInfo.phone));
    case 6: return false; // payment is the last step
    default: return false;
  }
}
