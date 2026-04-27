"use client";

import { ProfileForm } from "@/components/features/profile/ProfileForm";
import { PasswordForm } from "@/components/features/profile/PasswordForm";
import { EmailForm } from "@/components/features/profile/EmailForm";
import { PageTransition } from "@/components/animations/PageTransition";
import { Separator } from "@/components/ui/separator";

export default function ProfileClient() {
  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground lg:text-4xl">Profil</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hesap bilgilerinizi yönetin
          </p>
        </div>

        <div className="max-w-2xl space-y-8">
          <ProfileForm />
          <Separator />
          <EmailForm />
          <Separator />
          <PasswordForm />
        </div>
      </div>
    </PageTransition>
  );
}
