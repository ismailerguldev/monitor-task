"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { registerUser } from "@/store/slices/authSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedBackground } from "@/components/animations/AnimatedBackground";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const registerSchema = z
  .object({
    name: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
    last_name: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterClient() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    const result = await dispatch(
      registerUser({
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError(result.payload as string);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 overflow-hidden">
      {/* Particle animation */}
      <AnimatedBackground />

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25"
          >
            <span className="text-2xl font-bold text-primary-foreground">TM</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">TaskMonitor</h1>
          <p className="mt-2 text-muted-foreground">Yeni bir hesap oluşturun</p>
        </div>

        <Card className="border-border/40 backdrop-blur-sm bg-card/80 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Kayıt Ol</CardTitle>
            <CardDescription>Bilgilerinizi girerek hesap oluşturun</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                </motion.div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">Hesap oluşturuldu!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Giriş sayfasına yönlendiriliyorsunuz...
                  </p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <Label htmlFor="register-name">Ad</Label>
                    <Input
                      id="register-name"
                      placeholder="Adınız"
                      className="h-11"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="register-last-name">Soyad</Label>
                    <Input
                      id="register-last-name"
                      placeholder="Soyadınız"
                      className="h-11"
                      {...register("last_name")}
                    />
                    {errors.last_name && (
                      <p className="text-xs text-destructive">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2.5">
                  <Label htmlFor="register-email">E-posta</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="ornek@email.com"
                    className="h-11"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2.5">
                  <Label htmlFor="register-password">Şifre</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Şifre oluşturun"
                      className="h-11 pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2.5">
                  <Label htmlFor="register-confirm">Şifre Tekrarı</Label>
                  <Input
                    id="register-confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="Şifrenizi tekrarlayın"
                    className="h-11"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    "Hesap Oluştur"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Zaten hesabınız var mı?{" "}
                  <Link href="/login" className="font-medium text-primary hover:underline transition-colors">
                    Giriş Yap
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
