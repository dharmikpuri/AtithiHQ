import type { Metadata } from "next";
import { routes } from "@/config/routes";
import { getCopy } from "@/content";
import { LoginScreen } from "@/features/auth/login-screen";
import { publicPageMetadata } from "@/lib/seo/metadata";

const { login } = getCopy().auth;

export const metadata: Metadata = publicPageMetadata({
  title: login.metaTitle,
  description: login.metaDescription,
  path: routes.login,
});

export default function LoginPage() {
  return <LoginScreen />;
}
