"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
  icon?: ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  icon,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant={variant === "destructive" ? "destructive" : "default"}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface BattleConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attackerSize: number;
  defenderSize: number;
  onConfirm: () => void;
}

export function BattleConfirmDialog({
  open,
  onOpenChange,
  attackerSize,
  defenderSize,
  onConfirm,
}: BattleConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Start Battle?"
      description={`You are about to attack with ${attackerSize} units against ${defenderSize} enemy units. This action cannot be undone. Are you sure you want to proceed?`}
      confirmText="Attack"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}

interface MoveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitCount: number;
  onConfirm: () => void;
}

export function MoveConfirmDialog({
  open,
  onOpenChange,
  unitCount,
  onConfirm,
}: MoveConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Move"
      description={`You are about to move ${unitCount} units. This will end your turn. Continue?`}
      confirmText="Move"
      onConfirm={onConfirm}
    />
  );
}
