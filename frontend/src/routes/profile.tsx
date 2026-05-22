import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Bell, Lock, Mail, User } from "lucide-react";
import { requireAuth } from '@/utils/routeGuard';

export const Route = createFileRoute("/profile")({ 
  beforeLoad: ({ location }) => requireAuth(location),
  component: ProfilePage 
});

function ProfilePage() {
  return (
    <PageShell>
      <style>{`
        .profile-input {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(102, 153, 255, 0.2);
          border-radius: 0.75rem;
          padding: 0.625rem 1rem;
          width: 100%;
          color: white;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .profile-input:focus {
          outline: none;
          border-color: #6699FF;
        }
        .profile-input::placeholder {
          color: #6b7280;
        }
        /* Custom toggle switch */
        .toggle-switch {
          width: 2.25rem;
          height: 1.25rem;
          appearance: none;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.1);
          position: relative;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .toggle-switch:checked {
          background-color: #6699FF;
        }
        .toggle-switch::after {
          content: "";
          position: absolute;
          top: 0.125rem;
          left: 0.125rem;
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          background-color: white;
          transition: transform 0.2s;
        }
        .toggle-switch:checked::after {
          transform: translateX(1rem);
        }
      `}</style>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-[#6699FF]/30 text-xs font-medium text-gray-300 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />
          <span>Account Settings</span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold text-white mb-8"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Profile <span className="gradient-text">& Settings</span>
        </h1>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Profile summary card */}
          <div className="glass-card md:col-span-1 text-center">
            <div className="w-24 h-24 mx-auto rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-white">
              AO
            </div>
            <h2 className="font-semibold text-lg text-white mt-4">Ada Okafor</h2>
            <p className="text-xs text-gray-400">Senior Analyst · NCS</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-center">
              <div className="bg-black/40 border border-white/10 rounded-lg p-2">
                <div className="font-bold text-white">128</div>
                <div className="text-xs text-gray-400">Scans</div>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-lg p-2">
                <div className="font-bold text-white">23</div>
                <div className="text-xs text-gray-400">Fakes</div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="glass-card md:col-span-2">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#6699FF]" /> Personal Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Full Name" defaultValue="Ada Okafor" />
              <Field label="Email" defaultValue="ada@ncs.org.ng" />
              <Field label="Role" defaultValue="Senior Analyst" />
              <Field label="Organization" defaultValue="Nigeria Computer Society" />
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>

          {/* Update Password */}
          <div className="glass-card md:col-span-2">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#6699FF]" /> Update Password
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Current" type="password" placeholder="••••••••" />
              <Field label="New" type="password" placeholder="••••••••" />
              <Field label="Confirm" type="password" placeholder="••••••••" />
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn-outline">Update Password</button>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6699FF]" /> Notifications
            </h3>
            <div className="space-y-3 text-sm">
              {["Email alerts on fake detection", "Weekly summary digest", "Product updates"].map((label) => (
                <label key={label} className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="text-gray-400">{label}</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="toggle-switch"
                    aria-label={`Toggle ${label}`}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, ...props }: any) {
  return (
    <label className="block">
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      <input {...props} className="profile-input mt-1" />
    </label>
  );
}