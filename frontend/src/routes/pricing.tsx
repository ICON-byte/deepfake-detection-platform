import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { plans } from '@/mock/plans';
import { useAuth } from '@/contexts/AuthContext';

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
});

function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleProceed = () => {
    if (!selectedPlanId) return;
    if (!user) {
      // Not logged in: go to register, then come back to pricing
      navigate({ to: '/register', search: { redirect: '/pricing' } });
      return;
    }
    // Logged in: just go to dashboard (no actual upgrade yet)
    // In the future, you can call an API to update the user's plan here.
    navigate({ to: '/dashboard' });
  };

  const isSelected = (planId: string) => selectedPlanId === planId;

  return (
    <PageShell>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-400 mt-3">Choose the plan that fits your needs</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card p-6 flex flex-col transition-all cursor-pointer ${
                isSelected(plan.id)
                  ? 'ring-2 ring-[#6699FF] transform scale-[1.02]'
                  : 'hover:scale-[1.01]'
              }`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
              <div className="mt-4 text-3xl font-bold text-white">{plan.price}</div>
              <div className="text-xs text-gray-400 mt-1">
                {plan.scansPerMonth === 'unlimited'
                  ? 'Unlimited scans'
                  : `${plan.scansPerMonth} scans / month`}
              </div>
              <ul className="mt-6 space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-300 flex items-center gap-2">
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPlan(plan.id);
                }}
                className={`mt-6 w-full py-2 rounded-full font-semibold transition ${
                  isSelected(plan.id) ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {isSelected(plan.id) ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Proceed button */}
        {selectedPlanId && (
          <div className="mt-10 text-center">
            <button onClick={handleProceed} className="btn-primary px-8 py-3 text-lg">
              {user ? 'Proceed to Dashboard' : 'Create Account & Continue'}
            </button>
          </div>
        )}
      </section>
    </PageShell>
  );
}