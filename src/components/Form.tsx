"use client";

import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
const validationSchema = z.object({
  name: z.string().min(1, { message: "Naam is verplicht" }),
  email: z.string().min(1, { message: "E-mail is verplicht" }).email({
    message: "E-mail is niet geldig",
  }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isLoading },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<ValidationSchema> = async (data) => {
    await fetch("/api/spotify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (data) => {
        console.log(data);
        void signIn("spotify");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const { status } = useSession();

  if (status === "authenticated") redirect("/thank-you");

  return (
    <form className="mb-4 w-full pb-8 pt-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label
          className="mb-2 block text-sm font-bold text-slate-100"
          htmlFor="firstName"
        >
          Naam
        </label>
        <input
          className={`w-full border px-3 py-2 leading-tight text-gray-700 ${
            errors.name && "border-red-500"
          } focus:shadow-outline appearance-none rounded focus:outline-none`}
          id="firstName"
          type="text"
          placeholder="Naam"
          {...register("name")}
        />
        <div className="mt-2 h-4">
          {errors.name && (
            <p className="text-xs italic text-red-500">
              {errors.name?.message}
            </p>
          )}
        </div>
      </div>
      <div className="mb-4">
        <label
          className="mb-2 block text-sm font-bold text-slate-100"
          htmlFor="email"
        >
          Spotify e-mail
        </label>
        <input
          className={`w-full border px-3 py-2 leading-tight text-gray-700 ${
            errors.email && "border-red-500"
          } focus:shadow-outline appearance-none rounded focus:outline-none`}
          id="email"
          type="email"
          placeholder="E-mail"
          {...register("email")}
        />
        <small>
          Je e-mailadres wordt alleen gebruikt om je toegang te geven tot de
          jukebox.
        </small>
        <div className="mt-2 h-4">
          {errors.email && (
            <p className="text-xs italic text-red-500">
              {errors.email?.message}
            </p>
          )}
        </div>
      </div>
      <div className="mb-6 text-center">
        <Button
          type="submit"
          className="focus:shadow-outline w-full rounded-full bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Laden...
            </>
          ) : (
            "Doe mee"
          )}
        </Button>
      </div>
    </form>
  );
};

export default Form;
