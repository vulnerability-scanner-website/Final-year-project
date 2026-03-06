"use client";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { SignupPage } from "@/components/ui/sign-up-page";

export default function Demo() {
  return (
    <BrowserRouter>
      <SignupPage />
    </BrowserRouter>
  );
}
