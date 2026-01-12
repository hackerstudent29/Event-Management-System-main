import React from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function PaymentSummary({
    title = "Order Summary",
    paymentMethod = {
        icon: <CreditCard className="h-6 w-6 text-primary" />,
        name: "Card / UPI",
    },
    items = [],
    total = { label: "Total Payable", value: "₹0" },
    description,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                {title}
                            </h2>
                            {description && (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Payment Method */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                                {paymentMethod.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    Payment Method
                                </span>
                                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {paymentMethod.name}
                                </span>
                            </div>
                        </div>
                        <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="h-3.5 w-3.5 text-green-600" />
                        </div>
                    </div>

                    <Separator />

                    {/* Items */}
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                            >
                                <span className="text-zinc-500 dark:text-zinc-400">
                                    {item.label}
                                </span>
                                <span
                                    className={`font-medium ${item.valueClassName ||
                                        "text-zinc-900 dark:text-zinc-100"
                                        }`}
                                >
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <Separator className="bg-dashed" />

                    {/* Total */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                {total.label}
                            </span>
                            <span className="text-xs text-zinc-400">
                                Includes all taxes
                            </span>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                            {total.value}
                        </span>
                    </div>
                </div>

                {/* Footer Design Element */}
                <div className="h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
            </div>
        </motion.div>
    );
}
