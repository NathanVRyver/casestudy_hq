// Tremor Raw Input [v1.0.0]

import { RiSearchLine } from "@remixicon/react"
import * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusInput, hasErrorInput } from "@/lib/utils"

const inputStyles = tv({
  base: [
    // base
    "relative block w-full appearance-none rounded-md border px-2.5 py-1.5 outline-none transition sm:text-sm",
    // border color
    "border-stone-200 dark:border-stone-700",
    // text color
    "text-stone-900 dark:text-stone-50",
    // placeholder color
    "placeholder-stone-400 dark:placeholder-stone-500",
    // background color
    "bg-stone-50 dark:bg-stone-900",
    // disabled
    "disabled:border-stone-300 disabled:bg-stone-100 disabled:text-stone-400",
    "disabled:dark:border-stone-600 disabled:dark:bg-stone-800 disabled:dark:text-stone-500",
    // focus
    focusInput,
    // invalid (optional)
    // "aria-[invalid=true]:dark:ring-red-400/20 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-200 aria-[invalid=true]:border-red-500 invalid:ring-2 invalid:ring-red-200 invalid:border-red-500"
    // remove search cancel button (optional)
    "[&::--webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
  ],
  variants: {
    hasError: {
      true: hasErrorInput,
    },
    // number input
    enableStepper: {
      true: "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    },
  },
})

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputStyles> {
  inputClassName?: string
}

const Searchbar = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      inputClassName,
      hasError,
      enableStepper,
      type = "search",
      ...props
    }: InputProps,
    forwardedRef,
  ) => {
    return (
      <div className={cx("relative w-full", className)}>
        <input
          ref={forwardedRef}
          type={type}
          className={cx(
            inputStyles({ hasError, enableStepper }),
            "pl-8",
            inputClassName,
          )}
          {...props}
        />
        <div
          className={cx(
            // base
            "pointer-events-none absolute bottom-0 left-2 flex h-full items-center justify-center",
            // text color
            "text-stone-400 dark:text-stone-500",
          )}
        >
          <RiSearchLine
            className="size-[1.125rem] shrink-0"
            aria-hidden="true"
          />
        </div>
      </div>
    )
  },
)

Searchbar.displayName = "Searchbar"

export { Searchbar }
