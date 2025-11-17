"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const AlertDialog: React.FC<AlertDialogProps> = ({ open, onOpenChange, children }) => {
  return (
    <div className={cn(open ? "block" : "hidden")}>
      {children}
    </div>
  )
}

const AlertDialogTrigger: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => {
  return (
    <div onClick={onClick}>
      {children}
    </div>
  )
}

const AlertDialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

const AlertDialogOverlay: React.FC<{ className?: string; onClick?: () => void }> = ({ className, onClick }) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className
      )}
      onClick={onClick}
    />
  )
}

const AlertDialogContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
          className
        )}
      >
        {children}
      </div>
    </AlertDialogPortal>
  )
}

const AlertDialogHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
    >
      {children}
    </div>
  )
}

const AlertDialogFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
    >
      {children}
    </div>
  )
}

const AlertDialogTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

const AlertDialogDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}

const AlertDialogAction: React.FC<{ className?: string; children: React.ReactNode; onClick?: () => void }> = ({ className, children, onClick }) => {
  return (
    <button
      className={cn(buttonVariants(), className)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const AlertDialogCancel: React.FC<{ className?: string; children: React.ReactNode; onClick?: () => void }> = ({ className, children, onClick }) => {
  return (
    <button
      className={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
