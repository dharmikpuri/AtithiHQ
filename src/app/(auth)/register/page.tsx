import type { Metadata } from "next";
import { routes } from "@/config/routes";
import { getCopy } from "@/content";
import { LoginScreen } from "@/features/auth/login-screen";
import { publicPageMetadata } from "@/lib/seo/metadata";

const { register } = getCopy().auth;

export const metadata: Metadata = publicPageMetadata({
  title: register.metaTitle,
  description: register.metaDescription,
  path: routes.register,
});

/** "Get started": verify a mobile number, then the registration form. */
export default function RegisterPage() {
  return <LoginScreen mode="register" />;
}
