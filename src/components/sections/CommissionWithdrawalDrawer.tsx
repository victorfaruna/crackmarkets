"use client";

import React, { useState } from "react";
import Link from "next/link";
import RightSideDrawer from "../shared/RightSideDrawer";
import { useAppStore } from "@/src/lib/stores/appStore";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";

interface CommissionWithdrawalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  fiatSign?: string;
}

const NETWORKS = [
  { id: "TRC20", label: "TRC-20", fee: 1.0 },
  { id: "BEP20", label: "BEP-20", fee: 0.5 },
  { id: "ERC20", label: "ERC-20", fee: 3.5 },
  { id: "SOL", label: "SOL", fee: 0.2 },
];

export const CommissionWithdrawalDrawer: React.FC<
  CommissionWithdrawalDrawerProps
> = ({ isOpen, onClose, availableBalance }) => {
  const isConnectedToStockTrader = useAppStore(
    (s) => s.isConnectedToStockTrader,
  );

  const [network, setNetwork] = useState("TRC20");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const currentNetwork = NETWORKS.find((n) => n.id === network) || NETWORKS[0];
  const minRequired = currentNetwork.fee + 0.01;
  const hasEnoughBalance = availableBalance >= minRequired;
  const netReceive = Math.max(0, numAmount - currentNetwork.fee);

  const handleMax = () => {
    if (!isConnectedToStockTrader || !hasEnoughBalance) return;
    setAmount(availableBalance.toString());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setAddress(text.trim());
    } catch {
      // ignore
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !isConnectedToStockTrader ||
      !hasEnoughBalance ||
      !address ||
      numAmount <= currentNetwork.fee ||
      numAmount > availableBalance
    )
      return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount("");
        setAddress("");
        onClose();
      }, 1200);
    }, 700);
  };

  const isFormDisabled = !isConnectedToStockTrader || !hasEnoughBalance;

  return (
    <RightSideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Withdraw Commission"
      width="w-100"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 text-secondary"
      >
        {/* Available Balance Box */}
        <div className="p-4 rounded-xl border border-subtext/30 bg-primary/40 flex flex-col gap-1">
          <span className="text-[11px] font-medium text-secondary/60">
            Available Commission Balance
          </span>
          <span className="text-xl font-semibold text-secondary">
            ${formatCurrency(availableBalance, 2)}{" "}
            <span className="text-xs font-normal text-secondary/60 font-mono">
              USDT
            </span>
          </span>
        </div>

        {/* ─── Validation Alert 1: StockTrader Disconnected ─────────────── */}
        {!isConnectedToStockTrader && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4 text-error shrink-0 mt-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-error">
                  StockTrader Not Connected
                </p>
                <p className="text-[11px] text-secondary/70">
                  Connect your StockTrader account on your profile page to
                  enable commission withdrawals.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              onClick={onClose}
              className="text-xs font-medium text-accent hover:underline self-start pl-6"
            >
              Go to Profile to Connect →
            </Link>
          </div>
        )}

        {/* ─── Validation Alert 2: Insufficient Balance ─────────────────── */}
        {isConnectedToStockTrader && !hasEnoughBalance && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4 text-error shrink-0 mt-0.5"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium text-error">
                Insufficient Balance
              </p>
              <p className="text-[11px] text-secondary/70">
                Minimum withdrawal required is ${minRequired.toFixed(2)} USDT to
                cover the network settlement fee.
              </p>
            </div>
          </div>
        )}

        {/* Network Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-secondary/80">
            Network
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {NETWORKS.map((n) => {
              const active = network === n.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  disabled={isFormDisabled}
                  onClick={() => setNetwork(n.id)}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    active
                      ? "bg-secondary text-background border-secondary font-semibold"
                      : "bg-primary/40 border-subtext/30 text-secondary/70 hover:text-secondary"
                  }`}
                >
                  {n.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Destination Address */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-secondary/80">
              Destination Address
            </label>
            {!isFormDisabled && (
              <button
                type="button"
                onClick={handlePaste}
                className="text-[11px] text-secondary/60 hover:text-secondary cursor-pointer"
              >
                Paste
              </button>
            )}
          </div>
          <input
            type="text"
            value={address}
            disabled={isFormDisabled}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={`Enter ${network} address`}
            required
            className="w-full h-10 px-3 rounded-xl border border-subtext/30 bg-primary/40 text-secondary text-xs font-mono placeholder:font-sans placeholder:text-secondary/30 outline-hidden focus:border-subtext/70 disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-secondary/80">
              Amount
            </label>
            <button
              type="button"
              disabled={isFormDisabled}
              onClick={handleMax}
              className="text-[11px] text-secondary/60 hover:text-secondary font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Max: ${formatCurrency(availableBalance, 2)}
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              disabled={isFormDisabled}
              min={currentNetwork.fee + 0.01}
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full h-10 pl-3 pr-14 rounded-xl border border-subtext/30 bg-primary/40 text-secondary text-xs font-medium placeholder:text-secondary/30 outline-hidden focus:border-subtext/70 disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary/40 font-mono">
              USDT
            </span>
          </div>
        </div>

        {/* Fee and Receive Summary */}
        <div className="p-3 rounded-xl border border-subtext/30 bg-primary/20 flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between text-secondary/60">
            <span>Network Fee</span>
            <span className="font-mono">
              {currentNetwork.fee.toFixed(2)} USDT
            </span>
          </div>
          <div className="flex items-center justify-between font-medium text-secondary pt-1 border-t border-subtext/20">
            <span>You will receive</span>
            <span className="font-mono">
              {numAmount > currentNetwork.fee
                ? formatCurrency(netReceive, 2)
                : "0.00"}{" "}
              USDT
            </span>
          </div>
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-success/15 border border-success/30 text-success text-xs text-center font-medium">
            Withdrawal request submitted successfully.
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            loading ||
            !isConnectedToStockTrader ||
            !hasEnoughBalance ||
            !address ||
            numAmount <= currentNetwork.fee ||
            numAmount > availableBalance
          }
          className="w-full h-12 rounded-full bg-secondary text-background font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed mt-1"
        >
          {loading
            ? "Processing..."
            : !isConnectedToStockTrader
              ? "Connect StockTrader to Withdraw"
              : !hasEnoughBalance
                ? "Insufficient Balance"
                : "Withdraw Funds"}
        </button>
      </form>
    </RightSideDrawer>
  );
};

export default CommissionWithdrawalDrawer;
