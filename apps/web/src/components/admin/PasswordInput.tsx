"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { invalid?: boolean };

/** Password field with a show/hide (eye) toggle. */
export default function PasswordInput({ invalid, className = "", ...props }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-1">
      <input
        {...props}
        type={show ? "text" : "password"}
        aria-invalid={invalid || undefined}
        className={`h-[44px] w-full rounded-lg border bg-white py-0 pl-3 pr-11 text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${invalid ? "border-red-500" : "border-gray-300"} ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-brand"
      >
        {show ? <FaEyeSlash className="size-[18px]" /> : <FaEye className="size-[18px]" />}
      </button>
    </div>
  );
}
