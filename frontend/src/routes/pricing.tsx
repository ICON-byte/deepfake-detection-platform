import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { PageShell } from '@/components/PageShell';
import { plans } from '@/mock/plans';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/axiosClient';
import { Loader2, Check } from 'lucide-react';

export const Route = createFileRoute('/pricing')({
  component: PricingPage,
});

function PricingPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setError(null);
  };

  const handleProceed = async () => {
    if (!selectedPlanId) return;
    
    // 1. Force authorization check redirect if visitor is a guest
    if (!user) {
      navigate({ 
        to: '/register', 
        search: { redirect: `/pricing?selectedPlan=${selectedPlanId}` } as any 
      });
      return;
    }

    // 2. Identify if they selected the Free Base Tier
    if (selectedPlanId === 'free' || selectedPlanId === 'starter') {
      setLoading(true);
      try {
        await api.post('/subscription/set-free-tier', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate({ to: '/detect' });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Could not provision free account profile limits.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. Paid plans: Initialize standard payment window redirect hooks
    setLoading(true);
    try {
      const response = await api.post('/subscription/initialize-checkout', {
        planId: selectedPlanId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Redirect out directly to the checkout portal (Paystack / Stripe Checkout URL)
      if (response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        // Fallback or backup route if auto-credited via admin hooks
        navigate({ to: '/detect' });
      }
    } catch (err: any) {
      console.error('🔴 Checkout Initializer Pipeline Crash:', err);
      setError(err.response?.data?.message || 'Payment processing gateway failed to start.');
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (planId: string) => selectedPlanId === planId;

  return (
    <PageShell>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-[#6699FF]/30 text-xs font-medium text-gray-300 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6699FF]" />
            <span>Secure Cloud Billing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h1>
          <p className="text-gray-400 mt-3 max-w-md mx-auto text-sm">
            Choose the diagnostic processing threshold that perfectly scales with your media analysis operations.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card p-6 flex flex-col transition-all relative overflow-hidden ${
                isSelected(plan.id)
                  ? 'ring-2 ring-[#6699FF] transform scale-[1.02] bg-white/[0.03]'
                  : 'hover:scale-[1.01] opacity-80 hover:opacity-100'
              }`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                <span className="text-xs text-gray-400">/ month</span>
              </div>
              <div className="text-xs font-medium text-[#6699FF] mt-2 bg-[#6699FF]/10 inline-block px-2.5 py-1 rounded-md self-start">
                {plan.scansPerMonth === 'unlimited'
                  ? 'Unlimited Scans'
                  : `${plan.scansPerMonth} Media Scans`}
              </div>

              <ul className="mt-6 space-y-3 flex-1 border-t border-white/5 pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-300 flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#6699FF] mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPlan(plan.id);
                }}
                className={`mt-8 w-full py-2.5 rounded-xl font-semibold text-sm transition ${
                  isSelected(plan.id) ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {isSelected(plan.id) ? 'Selected Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Action Button */}
        {selectedPlanId && (
          <div className="mt-12 text-center">
            <button 
              onClick={handleProceed} 
              disabled={loading}
              className="btn-primary px-10 py-3.5 text-base font-semibold shadow-lg shadow-[#6699FF]/10 min-w-[240px] inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : user ? (
                <span>Activate Selected Plan</span>
              ) : (
                <span>Create Account & Continue</span>
              )}
            </button>
          </div>
        )}
      </section>
    </PageShell>
  );
}