// Tremor Raw Button [v0.1.1]

import { Slot } from "@radix-ui/react-slot"
import { RiLoader2Fill } from "@remixicon/react"
import React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusRing } from "@/lib/utils"

const buttonVariants = tv({
  base: [
    // base
    "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg border px-4 py-2.5 text-center text-sm font-semibold tracking-wider transition-all duration-300 ease-out overflow-hidden",
    // disabled
    "disabled:pointer-events-none disabled:opacity-50",
    // focus
    "focus:outline-none focus:ring-2 focus:ring-athena-gold/20 focus:ring-offset-2 focus:ring-offset-obsidian",
  ],
  variants: {
    variant: {
      primary: [
        "mono-button-primary",
      ],
      secondary: [
        "mono-button-secondary",
      ],
      light: [
        // base
        "shadow-none",
        // border
        "border-transparent",
        // text color
        "text-gray-900 dark:text-gray-50",
        // background color
        "bg-gray-200 dark:bg-gray-900",
        // hover color
        "hover:bg-gray-300/70 dark:hover:bg-gray-800/80",
        // disabled
        "disabled:bg-gray-100 disabled:text-gray-400",
        "disabled:dark:bg-gray-800 disabled:dark:text-gray-600",
      ],
      ghost: [
        "shadow-none border-transparent bg-transparent",
        "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50",
        "hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200",
        "disabled:text-stone-400 disabled:hover:text-stone-400 disabled:hover:bg-transparent",
      ],
      destructive: [
        "text-white font-semibold border-transparent",
        "bg-loss hover:bg-red-700 transition-colors duration-200",
        "disabled:bg-stone-300 disabled:text-stone-500 dark:disabled:bg-stone-700 dark:disabled:text-stone-400",
      ],
    },
  },
  defaultVariants: {
    variant: "primary",
  },
})

interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild,
      isLoading = false,
      loadingText,
      className,
      disabled,
      variant,
      children,
      ...props
    }: ButtonProps,
    forwardedRef,
  ) => {
    const Component = asChild ? Slot : "button"
    return (
      <Component
        ref={forwardedRef}
        className={cx(buttonVariants({ variant }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
            <RiLoader2Fill
              className="size-4 shrink-0 animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">
              {loadingText ? loadingText : "Loading"}
            </span>
            {loadingText ? loadingText : children}
          </span>
        ) : (
          children
        )}
      </Component>
    )
  },
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
