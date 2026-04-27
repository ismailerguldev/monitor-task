"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { changeEmail } from "@/store/slices/authSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emailSchema = z.object({
  newEmail: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre zorunludur"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export function EmailForm() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await dispatch(changeEmail(data));
    if (changeEmail.fulfilled.match(result)) {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.payload as string);
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5 text-primary" />
          E-posta Değiştir
        </CardTitle>
        <CardDescription>
          Mevcut e-posta: <strong>{user?.email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                E-posta başarıyla değiştirildi
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="new-email">Yeni E-posta</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="yeni@email.com"
              {...register("newEmail")}
            />
            {errors.newEmail && (
              <p className="text-xs text-destructive">{errors.newEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-password">Mevcut Şifre</Label>
            <Input
              id="email-password"
              type="password"
              placeholder="Doğrulama için şifrenizi girin"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Değiştiriliyor...
              </>
            ) : (
              "E-postayı Değiştir"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
