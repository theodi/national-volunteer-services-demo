"use client";

import { useRouter } from "next/navigation";
import { SolidLoginPage } from "solid-react-component/login/next";

export default function LoginPage() {
  const router = useRouter();
  return (
    <>
      {/* Override the default purple theme with GOV.UK colours */}
      <style>{`
        /* Left branding panel — GOV.UK blue tint instead of purple */
        .solid-login-left-panel {
          background: #e8f0fe !important;
        }

        /* Combobox input focus ring */
        .solid-login-combobox-input:focus {
          border-color: #1D70B8 !important;
          box-shadow: 0 0 0 1px #1D70B8 !important;
        }

        /* "Next" submit button — earth-blue instead of purple */
        .solid-login-right-panel button[type="submit"] {
          background: #1D70B8 !important;
        }
        .solid-login-right-panel button[type="submit"]:hover {
          background: #003078 !important;
        }
        .solid-login-right-panel button[type="submit"]:disabled {
          background: #d1d5db !important;
        }
      `}</style>

      <SolidLoginPage
        onAlreadyLoggedIn={() => router.replace("/?showEmergencyModal=true")}
        logo="/Gov-UK-logo.png"
        logoAlt="GOV.UK Logo"
        title="Sign in"
        subtitle="to continue to National Volunteer Services"
        className="font-sora"
      />
    </>
  );
}
