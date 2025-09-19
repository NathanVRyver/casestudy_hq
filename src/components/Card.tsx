// Tremor Raw Card [v0.0.1]

import { Slot } from "@radix-ui/react-slot"
import React from "react"

import { cx } from "@/lib/utils"

interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild, ...props }, forwardedRef) => {
    const Component = asChild ? Slot : "div"
    return (
      <Component
        ref={forwardedRef}
        className={cx(
          "mono-card relative w-full p-6 text-left",
          className,
        )}
        {...props}
      />
    )
  },
)

Card.displayName = "Card"

export { Card, type CardProps }
