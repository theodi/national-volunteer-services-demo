"use client";

export interface StepProgressStep {
  id: number;
  label: string;
  active?: boolean;
}

interface StepProgressProps {
  /** Steps to show (id, label). Active state is derived from currentStep when provided. */
  steps: readonly StepProgressStep[];
  /** 1-based current step (e.g. 2 = step 2 active). When set, connectors before completed steps use activeColor. */
  currentStep?: number;
  /** Tailwind class for the connector line when it leads to the active/completed step (default blue-custom) */
  activeConnectorClass?: string;
}

const DEFAULT_ACTIVE_CONNECTOR = "bg-blue-custom";

export function StepProgress({
  steps,
  currentStep,
  activeConnectorClass = DEFAULT_ACTIVE_CONNECTOR,
}: StepProgressProps) {
  const activeStepId = currentStep ?? steps.find((s) => s.active)?.id;
  return (
    <div className="flex items-center gap-2.5">
      {steps.map((step, index) => {
        const isActive =
          step.active ??
          (activeStepId != null && step.id <= activeStepId);
        const isConnectorActive =
          activeStepId != null && activeStepId > (steps[index]?.id ?? 0);
        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex items-center gap-1">
              <div
                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isActive
                    ? "bg-blue-custom text-white font-bold"
                    : "bg-transparent border border-slate-400 text-slate-400"
                }`}
              >
                {step.id}
              </div>
              <span
                className={`text-xs font-medium sm:text-sm ${
                  isActive ? "text-blue-custom" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 min-w-[8px] flex-1 sm:mx-2 ${
                  isConnectorActive ? activeConnectorClass : "bg-gray-200"
                }`}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
