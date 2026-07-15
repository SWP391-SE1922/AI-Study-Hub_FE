import { useEffect, useMemo, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bot,
  Shield,
  Sparkles,
  Globe,
  Check,
  Crown,
  HardDrive,
  ChevronRight,
  ShieldCheck,
  Copy,
  RefreshCw,
  Bell,
  AlertTriangle,
  Clock3,
  CheckCheck,
  Info,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  apiRequest,
  getMe,
  getSubscriptionPlans,
  getToken,
  logoutLocal,
  type SubscriptionPlan,
  type User,
} from "../../services/api";
// @ts-ignore
import confetti from "canvas-confetti";

type ExtendedUser = Partial<User> & {
  accountStatus?: "ACTIVE" | "SUSPENDED" | "BANNED" | string;
  dailyChatLimit?: number;
  todayChatUsed?: number;
  subscriptionStatus?: string;
  subscriptionExpireDate?: string | null;
  gracePeriodEndsAt?: string | null;
};

type NotificationType = "INFO" | "WARNING" | "DANGER" | "SUCCESS";

type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  action?: "UPGRADE";
};

function readStoredUser(): ExtendedUser {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") as ExtendedUser;
  } catch {
    return {};
  }
}

function readNotificationReadIds(): string[] {
  try {
    const value = JSON.parse(
      localStorage.getItem("readNotificationIds") || "[]",
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveNotificationReadIds(ids: string[]) {
  localStorage.setItem("readNotificationIds", JSON.stringify(ids));
}

function getInitials(name?: string, email?: string) {
  const source = name || email || "SV";
  const words = source.trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

const BYTES_PER_GB = 1024 ** 3;
const FREE_STORAGE_LIMIT_GB = 5;

function getProLabel(storageLimitBytes?: number): string | null {
  if (!storageLimitBytes) return null;

  const storageLimitGB = storageLimitBytes / BYTES_PER_GB;

  if (storageLimitGB <= FREE_STORAGE_LIMIT_GB) {
    return null;
  }

  if (storageLimitGB >= 200) {
    return "PREMIUM";
  }

  return "PRO";
}

function getDaysRemaining(date?: string | null) {
  if (!date) return null;

  const target = new Date(date);
  const now = new Date();

  const difference = target.getTime() - now.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function buildNotifications(user: ExtendedUser): AppNotification[] {
  const readIds = readNotificationReadIds();
  const notifications: AppNotification[] = [];
  const now = new Date().toISOString();

  const storageLimit = Number(user.storageLimit || 0);

  const usedStorage = Number(user.usedStorage || 0);

  const storagePercent =
    storageLimit > 0 ? (usedStorage / storageLimit) * 100 : 0;

  const accountStatus = user.accountStatus || "ACTIVE";

  const subscriptionStatus = user.subscriptionStatus;

  const daysUntilExpiry = getDaysRemaining(user.subscriptionExpireDate);

  const daysUntilSuspension = getDaysRemaining(user.gracePeriodEndsAt);

  if (accountStatus === "SUSPENDED" || accountStatus === "BANNED") {
    notifications.push({
      id: "account-suspended",
      title: "Tài khoản đang bị tạm khóa",
      message:
        "Tài khoản của bạn đang bị hạn chế. Vui lòng gia hạn gói để kích hoạt lại các chức năng.",
      type: "DANGER",
      createdAt: now,
      isRead: readIds.includes("account-suspended"),
      action: "UPGRADE",
    });
  } else if (
    typeof daysUntilSuspension === "number" &&
    daysUntilSuspension >= 0 &&
    daysUntilSuspension <= 7
  ) {
    notifications.push({
      id: "account-suspension-warning",
      title: "Cảnh báo tạm khóa tài khoản",
      message:
        daysUntilSuspension === 0
          ? "Tài khoản có thể bị tạm khóa hôm nay nếu bạn chưa gia hạn."
          : `Tài khoản sẽ bị tạm khóa sau ${daysUntilSuspension} ngày nếu bạn chưa gia hạn.`,
      type: daysUntilSuspension <= 1 ? "DANGER" : "WARNING",
      createdAt: now,
      isRead: readIds.includes("account-suspension-warning"),
      action: "UPGRADE",
    });
  }

  if (subscriptionStatus === "EXPIRED") {
    notifications.push({
      id: "subscription-expired",
      title: "Gói nâng cấp đã hết hạn",
      message:
        "Tài khoản đã quay về hạn mức miễn phí. Hãy gia hạn để tiếp tục sử dụng quyền lợi Pro.",
      type: "DANGER",
      createdAt: now,
      isRead: readIds.includes("subscription-expired"),
      action: "UPGRADE",
    });
  } else if (
    typeof daysUntilExpiry === "number" &&
    daysUntilExpiry >= 0 &&
    daysUntilExpiry <= 7
  ) {
    notifications.push({
      id: "subscription-expiring",
      title: "Gói sắp hết hạn",
      message:
        daysUntilExpiry === 0
          ? "Gói nâng cấp của bạn sẽ hết hạn hôm nay."
          : `Gói nâng cấp sẽ hết hạn sau ${daysUntilExpiry} ngày.`,
      type: daysUntilExpiry <= 1 ? "DANGER" : "WARNING",
      createdAt: now,
      isRead: readIds.includes("subscription-expiring"),
      action: "UPGRADE",
    });
  }

  if (storagePercent >= 100) {
    notifications.push({
      id: "storage-full",
      title: "Dung lượng đã đầy",
      message:
        "Bạn đã sử dụng hết dung lượng. Hãy xóa tài liệu hoặc nâng cấp gói để tiếp tục tải lên.",
      type: "DANGER",
      createdAt: now,
      isRead: readIds.includes("storage-full"),
      action: "UPGRADE",
    });
  } else if (storagePercent >= 80) {
    notifications.push({
      id: "storage-warning",
      title: "Dung lượng sắp hết",
      message: `Bạn đã sử dụng ${Math.round(
        storagePercent,
      )}% dung lượng lưu trữ.`,
      type: "WARNING",
      createdAt: now,
      isRead: readIds.includes("storage-warning"),
      action: "UPGRADE",
    });
  }

  if (
    typeof user.dailyChatLimit === "number" &&
    typeof user.todayChatUsed === "number"
  ) {
    const remaining = user.dailyChatLimit - user.todayChatUsed;

    if (remaining <= 0) {
      notifications.push({
        id: "chat-limit-exceeded",
        title: "Đã hết lượt AI Chat",
        message:
          "Bạn đã sử dụng hết lượt AI Chat hôm nay. Hãy chờ đến ngày mai hoặc nâng cấp gói.",
        type: "WARNING",
        createdAt: now,
        isRead: readIds.includes("chat-limit-exceeded"),
        action: "UPGRADE",
      });
    }
  }

  if (notifications.length === 0) {
    notifications.push({
      id: "account-normal",
      title: "Tài khoản hoạt động bình thường",
      message: "Hiện không có cảnh báo quan trọng đối với tài khoản của bạn.",
      type: "SUCCESS",
      createdAt: now,
      isRead: readIds.includes("account-normal"),
    });
  }

  return notifications;
}

// ─── Bank transfer upgrade ────────────────────────────

type UpgradeStep = "plans" | "payment";

type BankTransferPaymentResult = {
  transaction: {
    id: string;
    status: string;
    amount: number;
    paymentCode: string;
  };
  bank: {
    bankId: string;
    bankName: string;
    accountNo: string;
    accountName: string;
  };
  transferContent: string;
  qrUrl: string;
};

type PlanAppearance = {
  color: string;
  ring: string;
  popular: boolean;
  features: string[];
};

const DEFAULT_PLAN_APPEARANCE: PlanAppearance = {
  color: "from-indigo-500 to-violet-500",
  ring: "ring-indigo-400/40",
  popular: false,
  features: [
    "Mở rộng dung lượng lưu trữ",
    "Tăng giới hạn AI Chat",
    "Sử dụng trong thời hạn của gói",
  ],
};

function getPlanAppearance(plan: SubscriptionPlan): PlanAppearance {
  const code = String(plan.code || "").toUpperCase();
  const storageGB = Number(plan.storageLimit || 0) / BYTES_PER_GB;

  if (code.includes("200") || storageGB >= 200) {
    return {
      color: "from-amber-500 to-orange-500",
      ring: "ring-amber-400/40",
      popular: false,
      features: [
        `${Math.round(storageGB)} GB lưu trữ`,
        `${plan.dailyChatLimit} lượt AI Chat/ngày`,
        `Thời hạn ${plan.durationDays} ngày`,
        "Badge Premium",
        "Ưu tiên hỗ trợ cao nhất",
      ],
    };
  }

  if (code.includes("50") || storageGB >= 50) {
    return {
      color: "from-fuchsia-500 to-pink-500",
      ring: "ring-fuchsia-400/40",
      popular: true,
      features: [
        `${Math.round(storageGB)} GB lưu trữ`,
        `${plan.dailyChatLimit} lượt AI Chat/ngày`,
        `Thời hạn ${plan.durationDays} ngày`,
        "Badge Pro",
        "Ưu tiên hỗ trợ",
      ],
    };
  }

  return {
    color: "from-indigo-500 to-violet-500",
    ring: "ring-indigo-400/40",
    popular: false,
    features: [
      `${Math.max(1, Math.round(storageGB))} GB lưu trữ`,
      `${plan.dailyChatLimit} lượt AI Chat/ngày`,
      `Thời hạn ${plan.durationDays} ngày`,
      "Không giới hạn số lần tải lên trong dung lượng",
    ],
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStorage(storageLimit: number) {
  const storageGB = storageLimit / BYTES_PER_GB;
  return `${Math.round(storageGB)} GB`;
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<UpgradeStep>("plans");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selected, setSelected] = useState<SubscriptionPlan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentData, setPaymentData] =
    useState<BankTransferPaymentResult | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPlans = async () => {
      try {
        setLoadingPlans(true);
        const result = await getSubscriptionPlans();

        if (!mounted) return;

        setPlans(result);
        setSelected(
          result.find((plan) =>
            String(plan.code).toUpperCase().includes("50"),
          ) ||
          result[0] ||
          null,
        );
      } catch (error) {
        if (!mounted) return;
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách gói nâng cấp",
        );
      } finally {
        if (mounted) setLoadingPlans(false);
      }
    };

    loadPlans();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (
      step !== "payment" ||
      paymentData?.transaction.status !== "WAITING_CONFIRMATION"
    ) {
      return;
    }

    let active = true;

    const interval = window.setInterval(async () => {
      if (!active) return;

      try {
        const currentUserData = await getMe();
        const proLabel = getProLabel(currentUserData.storageLimit);

        if (!proLabel) return;

        active = false;
        window.clearInterval(interval);

        localStorage.setItem("user", JSON.stringify(currentUserData));
        window.dispatchEvent(new Event("authChange"));

        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });

        toast.success("Tài khoản đã được nâng cấp thành công");
        onClose();
      } catch {
        // Bỏ qua lỗi kiểm tra ngầm, lần polling sau sẽ thử lại.
      }
    }, 4000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [step, paymentData?.transaction.status, onClose]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) {
      toast.error(`Không có ${label.toLowerCase()} để sao chép`);
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`Đã sao chép ${label}`))
      .catch(() => toast.error(`Không thể sao chép ${label}`));
  };

  const handleCreateBankTransfer = async () => {
    if (!selected) {
      toast.error("Vui lòng chọn gói nâng cấp");
      return;
    }

    try {
      setCreatingPayment(true);

      const result = await apiRequest<BankTransferPaymentResult>(
        "/bank-transfer/create",
        {
          method: "POST",
          body: JSON.stringify({ planId: selected.id }),
        },
      );

      if (!result?.transaction?.id || !result?.qrUrl) {
        throw new Error("Backend trả về thông tin thanh toán không hợp lệ");
      }

      setPaymentData(result);
      setStep("payment");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể tạo yêu cầu thanh toán",
      );
    } finally {
      setCreatingPayment(false);
    }
  };

  const handleConfirmTransferred = async () => {
    const transactionId = paymentData?.transaction.id;

    if (!transactionId) {
      toast.error("Không tìm thấy mã giao dịch");
      return;
    }

    try {
      setConfirmingPayment(true);

      const result = await apiRequest<{
        transaction: { id: string; status: string };
      }>(`/bank-transfer/${transactionId}/confirm`, {
        method: "PATCH",
      });

      setPaymentData((current) =>
        current
          ? {
            ...current,
            transaction: {
              ...current.transaction,
              status: result?.transaction?.status || "WAITING_CONFIRMATION",
            },
          }
          : current,
      );

      toast.success(
        "Đã gửi yêu cầu xác nhận. Vui lòng chờ Admin kiểm tra giao dịch.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể gửi yêu cầu xác nhận",
      );
    } finally {
      setConfirmingPayment(false);
    }
  };

  const selectedAppearance = selected
    ? getPlanAppearance(selected)
    : DEFAULT_PLAN_APPEARANCE;

  const waitingConfirmation =
    paymentData?.transaction.status === "WAITING_CONFIRMATION";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/40 dark:bg-[#0F0C1D]">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0F0C1D]/95">
          <div className="flex items-center gap-3">
            {step === "payment" && (
              <button
                type="button"
                onClick={() => {
                  setStep("plans");
                  setPaymentData(null);
                }}
                aria-label="Quay lại"
                title="Quay lại"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
            )}

            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Crown className="h-4 w-4 text-white" />
            </div>

            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {step === "plans"
                  ? "Nâng cấp tài khoản Pro"
                  : "Chuyển khoản qua VietQR"}
              </h2>
              <p className="text-[10px] text-slate-400">
                {step === "plans"
                  ? "Chọn gói phù hợp với nhu cầu của bạn"
                  : selected
                    ? `${selected.name} · ${formatCurrency(Number(selected.price))}`
                    : "Thông tin thanh toán"}
              </p>
            </div>
          </div>

          <div className="mr-8 flex items-center gap-1.5">
            {(["plans", "payment"] as UpgradeStep[]).map((item) => (
              <div
                key={item}
                className={`h-1.5 rounded-full transition-all duration-300 ${item === step
                    ? "w-6 bg-indigo-500"
                    : "w-3 bg-slate-200 dark:bg-white/10"
                  }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            title="Đóng"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "plans" && (
          <div className="space-y-4 p-6">
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Mua thêm dung lượng lưu trữ và lượt AI Chat để sử dụng AI Study
              Hub hiệu quả hơn.
            </p>

            {loadingPlans ? (
              <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.03]">
                <RefreshCw className="h-7 w-7 animate-spin text-indigo-500" />
                <p className="text-sm text-slate-500">
                  Đang tải danh sách gói...
                </p>
              </div>
            ) : plans.length === 0 ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
                <AlertTriangle className="mx-auto mb-2 h-7 w-7 text-amber-500" />
                <p className="font-bold text-slate-900 dark:text-white">
                  Chưa có gói nâng cấp
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Vui lòng thêm dữ liệu SubscriptionPlan trong backend.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {plans.map((plan) => {
                  const appearance = getPlanAppearance(plan);
                  const isSelected = selected?.id === plan.id;

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelected(plan)}
                      className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${isSelected
                          ? `border-transparent bg-gradient-to-b from-white to-slate-50 shadow-lg ring-2 ${appearance.ring} dark:from-white/10 dark:to-white/5`
                          : "border-slate-100 bg-white hover:border-slate-200 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                        }`}
                    >
                      {appearance.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-3 py-0.5 text-[10px] font-bold text-white shadow">
                          PHỔ BIẾN
                        </span>
                      )}

                      <div
                        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${appearance.color} shadow-md`}
                      >
                        <HardDrive className="h-4 w-4 text-white" />
                      </div>

                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {plan.name}
                      </p>
                      <p className="mb-3 text-xs text-slate-400">
                        {formatStorage(Number(plan.storageLimit))} dung lượng
                      </p>
                      <p className="text-lg font-extrabold leading-none text-slate-900 dark:text-white">
                        {formatCurrency(Number(plan.price))}
                      </p>
                      <p className="mb-3 text-[10px] text-slate-400">
                        / {plan.durationDays} ngày
                      </p>

                      <ul className="space-y-1">
                        {appearance.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                          >
                            <Check className="h-3 w-3 shrink-0 text-emerald-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {isSelected && (
                        <div
                          className={`absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r ${appearance.color}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <Button
              type="button"
              disabled={!selected || loadingPlans || creatingPayment}
              onClick={handleCreateBankTransfer}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:from-indigo-600 hover:to-fuchsia-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {creatingPayment ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo mã thanh toán...
                </>
              ) : (
                <>
                  Tiếp tục thanh toán
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Admin chỉ kích hoạt gói sau khi kiểm tra giao dịch thực tế.
            </p>
          </div>
        )}

        {step === "payment" && selected && paymentData && (
          <div className="space-y-5 p-6">
            <div
              className={`rounded-2xl bg-gradient-to-br ${selectedAppearance.color} p-4 text-white`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold opacity-80">
                    Gói nâng cấp
                  </p>
                  <p className="font-extrabold">{selected.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold opacity-80">
                    Cần thanh toán
                  </p>
                  <p className="text-xl font-extrabold">
                    {formatCurrency(Number(paymentData.transaction.amount))}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thông tin chuyển khoản
                </h3>

                <div className="space-y-2 text-sm">
                  <InfoCard
                    label="Ngân hàng"
                    value={paymentData.bank.bankName}
                    onCopy={() =>
                      copyToClipboard(paymentData.bank.bankName, "Ngân hàng")
                    }
                  />

                  <InfoCard
                    label="Số tài khoản"
                    value={paymentData.bank.accountNo}
                    mono
                    onCopy={() =>
                      copyToClipboard(
                        paymentData.bank.accountNo,
                        "Số tài khoản",
                      )
                    }
                  />

                  <InfoCard
                    label="Chủ tài khoản"
                    value={paymentData.bank.accountName}
                    onCopy={() =>
                      copyToClipboard(
                        paymentData.bank.accountName,
                        "Chủ tài khoản",
                      )
                    }
                  />

                  <InfoCard
                    label="Nội dung bắt buộc"
                    value={paymentData.transferContent}
                    mono
                    highlight
                    onCopy={() =>
                      copyToClipboard(
                        paymentData.transferContent,
                        "Nội dung chuyển khoản",
                      )
                    }
                  />
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      Chuyển đúng số tiền và giữ nguyên nội dung. Sau khi
                      chuyển, nhấn
                      <strong> “Tôi đã chuyển khoản”</strong> để gửi yêu cầu cho
                      Admin.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="relative flex items-center justify-center rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                  <img
                    src={paymentData.qrUrl}
                    alt="Mã VietQR MB Bank"
                    className="h-56 w-56 object-contain"
                  />
                  <div className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-white shadow-md">
                    <Crown className="h-4 w-4 text-indigo-500" />
                  </div>
                </div>

                <p className="mt-3 text-center text-[10px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                  Quét mã bằng ứng dụng ngân hàng hỗ trợ VietQR.
                </p>

                <div
                  className={`mt-2.5 flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide ${waitingConfirmation
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    }`}
                >
                  {waitingConfirmation ? (
                    <Clock3 className="h-2.5 w-2.5" />
                  ) : (
                    <Info className="h-2.5 w-2.5" />
                  )}
                  {waitingConfirmation
                    ? "Đang chờ Admin xác nhận"
                    : "Chưa gửi yêu cầu xác nhận"}
                </div>
              </div>
            </div>

            <Button
              type="button"
              disabled={confirmingPayment || waitingConfirmation}
              onClick={handleConfirmTransferred}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-fuchsia-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {confirmingPayment ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi yêu cầu...
                </>
              ) : waitingConfirmation ? (
                <>
                  <Clock3 className="mr-2 h-4 w-4" />
                  Đang chờ Admin xác nhận
                </>
              ) : (
                <>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Tôi đã chuyển khoản
                </>
              )}
            </Button>

            {waitingConfirmation && (
              <p className="text-center text-[11px] leading-relaxed text-slate-400">
                Trang này sẽ tự kiểm tra tài khoản mỗi 4 giây. Khi Admin duyệt,
                gói Pro sẽ được cập nhật tự động.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  mono = false,
  highlight = false,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  onCopy: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-3 ${highlight
          ? "border-indigo-500/30 bg-indigo-500/5 ring-1 ring-indigo-500/20"
          : "border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/5"
        }`}
    >
      <div className="min-w-0">
        <p
          className={`text-[10px] font-semibold uppercase ${highlight ? "text-indigo-500" : "text-slate-400"
            }`}
        >
          {label}
        </p>
        <p
          className={`truncate font-bold ${mono ? "font-mono tracking-wide" : ""} ${highlight
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-800 dark:text-slate-200"
            }`}
        >
          {value}
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-lg"
        onClick={onCopy}
        title={`Sao chép ${label}`}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─── Notification Dropdown ─────────────────────────────

function NotificationDropdown({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onUpgrade,
}: {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onUpgrade: () => void;
}) {
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const getStyle = (type: NotificationType) => {
    switch (type) {
      case "DANGER":
        return {
          Icon: AlertTriangle,
          iconClass: "text-rose-500",
          background: "bg-rose-500/10",
          border: "border-rose-500/20",
        };

      case "WARNING":
        return {
          Icon: Clock3,
          iconClass: "text-amber-500",
          background: "bg-amber-500/10",
          border: "border-amber-500/20",
        };

      case "SUCCESS":
        return {
          Icon: CheckCheck,
          iconClass: "text-emerald-500",
          background: "bg-emerald-500/10",
          border: "border-emerald-500/20",
        };

      default:
        return {
          Icon: Info,
          iconClass: "text-indigo-500",
          background: "bg-indigo-500/10",
          border: "border-indigo-500/20",
        };
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Đóng thông báo"
        className="fixed inset-0 z-40 cursor-default"
        onClick={onClose}
      />

      <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-black/15 dark:border-white/10 dark:bg-[#15102E] dark:shadow-black/50">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Thông báo
            </h3>

            <p className="text-[10px] text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} thông báo chưa đọc`
                : "Bạn đã đọc tất cả thông báo"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Đọc tất cả
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto p-3 space-y-2">
          {notifications.map((notification) => {
            const style = getStyle(notification.type);

            const Icon = style.Icon;

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className={`relative w-full rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${style.background} ${style.border} ${notification.isRead ? "opacity-60" : "opacity-100"
                  }`}
              >
                {!notification.isRead && (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-500" />
                )}

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm dark:bg-white/10">
                    <Icon className={`h-4 w-4 ${style.iconClass}`} />
                  </div>

                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {notification.title}
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-[9px] text-slate-400">
                      {new Intl.DateTimeFormat("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      }).format(new Date(notification.createdAt))}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-100 p-3 dark:border-white/10">
          <Button
            type="button"
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            className="h-10 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-xs font-bold text-white shadow-md shadow-fuchsia-500/20 hover:from-violet-600 hover:to-fuchsia-600"
          >
            <Crown className="mr-1.5 h-3.5 w-3.5" />
            Gia hạn hoặc nâng cấp
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Main Layout ───────────────────────────────────────

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<ExtendedUser>(() =>
    readStoredUser(),
  );

  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    buildNotifications(readStoredUser()),
  );

  const location = useLocation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const refreshUser = async () => {
      const storedUser = readStoredUser();

      setCurrentUser(storedUser);
      setNotifications(buildNotifications(storedUser));

      if (!getToken()) return;

      try {
        const user = (await getMe()) as ExtendedUser;

        localStorage.setItem("user", JSON.stringify(user));

        setCurrentUser(user);
        setNotifications(buildNotifications(user));
      } catch {
        // Giữ dữ liệu local nếu lỗi tạm thời.
      }
    };

    refreshUser();

    window.addEventListener("authChange", refreshUser);

    window.addEventListener("storage", refreshUser);

    return () => {
      window.removeEventListener("authChange", refreshUser);

      window.removeEventListener("storage", refreshUser);
    };
  }, []);

  const initials = useMemo(
    () => getInitials(currentUser.fullName, currentUser.email),
    [currentUser.fullName, currentUser.email],
  );

  const proLabel = useMemo(
    () => getProLabel(currentUser.storageLimit),
    [currentUser.storageLimit],
  );

  const isPro = Boolean(proLabel);

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const handleLogout = () => {
    logoutLocal();
    window.location.href = "/";
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((currentNotifications) => {
      const next = currentNotifications.map((notification) =>
        notification.id === id
          ? {
            ...notification,
            isRead: true,
          }
          : notification,
      );

      const readIds = next
        .filter((notification) => notification.isRead)
        .map((notification) => notification.id);

      saveNotificationReadIds(readIds);

      return next;
    });
  };

  const handleMarkAllRead = () => {
    setNotifications((currentNotifications) => {
      const next = currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));

      saveNotificationReadIds(next.map((notification) => notification.id));

      return next;
    });

    toast.success("Đã đánh dấu tất cả là đã đọc");
  };

  const isAdmin = currentUser.role === "ADMIN";

  const menuItems = [
    ...(isAdmin
      ? [
        {
          path: "/admin",
          label: "Admin",
          icon: Shield,
        },
      ]
      : []),

    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },

    {
      path: "/documents",
      label: "Tài liệu của tôi",
      icon: FileText,
    },

    {
      path: "/public-documents",
      label: "Tài liệu cộng đồng",
      icon: Globe,
    },

    {
      path: "/chat",
      label: "Chat AI",
      icon: Bot,
    },

    {
      path: "/profile",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0A1A] text-foreground transition-colors duration-300">
      <style>{`
        @keyframes main-blob-float-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(18px, 14px) scale(1.12);
          }
        }

        @keyframes main-blob-float-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-14px, -10px) scale(1.08);
          }
        }

        @keyframes main-shimmer {
          0% {
            background-position: -150% 0;
          }
          100% {
            background-position: 250% 0;
          }
        }

        @keyframes main-border-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes main-pulse-ring {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          80%, 100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        @keyframes main-upgrade-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        @keyframes main-notification-ring {
          0%, 70%, 100% {
            transform: rotate(0deg);
          }
          75% {
            transform: rotate(13deg);
          }
          80% {
            transform: rotate(-11deg);
          }
          85% {
            transform: rotate(8deg);
          }
          90% {
            transform: rotate(-5deg);
          }
          95% {
            transform: rotate(2deg);
          }
        }

        .main-blob-1 {
          animation: main-blob-float-1 9s ease-in-out infinite;
        }

        .main-blob-2 {
          animation: main-blob-float-2 11s ease-in-out infinite;
        }

        .main-active-shimmer {
          background-image: linear-gradient(
            110deg,
            transparent 35%,
            rgba(255, 255, 255, 0.35) 50%,
            transparent 65%
          );
          background-size: 200% 100%;
          animation: main-shimmer 2.6s ease-in-out infinite;
        }

        .main-header-glow {
          background-image: linear-gradient(
            90deg,
            transparent,
            rgba(167, 139, 250, 0.55),
            rgba(217, 70, 239, 0.45),
            transparent
          );
          background-size: 200% 100%;
          animation: main-shimmer 6s linear infinite;
        }

        .main-status-ping {
          animation: main-pulse-ring 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .main-logo-ring {
          animation: main-border-glow 2.4s ease-in-out infinite;
        }

        .main-upgrade-btn {
          animation: main-upgrade-bounce 2.4s ease-in-out infinite;
        }

        .main-notification-ring {
          animation: main-notification-ring 2.8s ease-in-out infinite;
          transform-origin: top center;
        }

        @media (prefers-reduced-motion: reduce) {
          .main-blob-1,
          .main-blob-2,
          .main-active-shimmer,
          .main-header-glow,
          .main-status-ping,
          .main-logo-ring,
          .main-upgrade-btn,
          .main-notification-ring {
            animation: none !important;
          }
        }
      `}</style>

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200/70 dark:border-white/5 bg-white/80 dark:bg-[#0B0A1A]/80 backdrop-blur-md z-30 flex items-center justify-between px-4 lg:px-7 lg:pl-72 transition-colors duration-300">
        <div className="main-header-glow pointer-events-none absolute top-0 left-0 right-0 h-px opacity-70" />

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link
            to="/dashboard"
            className="group flex items-center gap-2.5 lg:hidden"
          >
            <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <MessageSquare className="w-4 h-4" />
            </div>

            <span className="font-extrabold text-lg tracking-tight text-foreground">
              AI Study Hub
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Upgrade */}
          <button
            type="button"
            onClick={() => {
              setNotificationOpen(false);
              setUpgradeOpen(true);
            }}
            title={isPro ? "Quản lý gói Pro" : "Nâng cấp tài khoản Pro"}
            className={`main-upgrade-btn relative flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold text-white shadow-md hover:-translate-y-0.5 transition-all duration-300 ${isPro
                ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-500/30 hover:from-amber-500 hover:to-orange-600"
                : "bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-fuchsia-500/30 hover:from-violet-600 hover:to-fuchsia-600"
              }`}
          >
            <Crown className="w-3.5 h-3.5" />

            <span className="hidden sm:inline">
              {isPro ? proLabel : "Nâng cấp"}
            </span>

            {!isPro && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-white dark:border-[#0B0A1A]" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen((value) => !value)}
              title="Thông báo tài khoản"
              aria-label="Thông báo"
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 ${notificationOpen
                  ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-500 shadow-[0_0_16px_-4px_rgba(99,102,241,0.7)]"
                  : "border-slate-200/80 bg-white/60 text-slate-500 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                }`}
            >
              <Bell
                className={`w-4 h-4 ${unreadNotificationCount > 0 ? "main-notification-ring" : ""
                  }`}
              />

              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[8px] font-extrabold leading-none text-white shadow-sm dark:border-[#0B0A1A]">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <NotificationDropdown
                notifications={notifications}
                onClose={() => setNotificationOpen(false)}
                onMarkRead={handleMarkNotificationRead}
                onMarkAllRead={handleMarkAllRead}
                onUpgrade={() => setUpgradeOpen(true)}
              />
            )}
          </div>

          {/* Theme */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-9 h-9 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all duration-300"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Thay đổi giao diện"
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />

            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-indigo-300" />
          </Button>

          {/* Avatar */}
          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-white/10 pl-3">
            <div className="relative">
              <Avatar
                className={`w-9 h-9 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0B0A1A] ${isPro ? "ring-amber-400/60" : "ring-indigo-500/30"
                  }`}
              >
                <AvatarImage
                  src={currentUser.avatarUrl || ""}
                  alt={currentUser.fullName || currentUser.email}
                />

                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0B0A1A]" />

              <span className="main-status-ping absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400" />

              {isPro && (
                <span className="absolute -top-1.5 -left-1.5 w-[18px] h-[18px] rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white dark:border-[#0B0A1A] flex items-center justify-center">
                  <Crown className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </div>

            <div className="hidden sm:block text-left max-w-[180px]">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold truncate">
                  {currentUser.fullName || "Sinh viên"}
                </p>

                {isPro && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                    {proLabel}
                  </span>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground truncate">
                {currentUser.email || "Chưa có email"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 transform lg:transform-none lg:opacity-100 transition-all duration-300 ease-out flex flex-col justify-between bg-gradient-to-b from-[#1B1140] via-[#15102E] to-[#0B0A1A] text-slate-200 shadow-2xl shadow-black/40 overflow-hidden ${sidebarOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 lg:translate-x-0"
          }`}
      >
        <div className="main-blob-1 pointer-events-none absolute -top-24 -left-16 w-56 h-56 bg-fuchsia-500/20 rounded-full blur-3xl" />

        <div className="main-blob-2 pointer-events-none absolute bottom-24 -right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="h-16 items-center px-6 border-b border-white/10 hidden lg:flex">
            <Link to="/dashboard" className="group flex items-center gap-2.5">
              <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white">
                <MessageSquare className="w-4 h-4" />
              </div>

              <span className="font-extrabold text-lg text-white">
                AI Study Hub
              </span>
            </Link>
          </div>

          <div className="p-4 space-y-1.5 lg:mt-3">
            <div className="flex items-center justify-between lg:hidden mb-4">
              <span className="text-xs font-bold uppercase text-slate-400">
                Menu
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive = location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className="block"
                >
                  <span
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${isActive
                        ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    {isActive && (
                      <span className="main-active-shimmer absolute inset-0 pointer-events-none" />
                    )}

                    <Icon className="w-4 h-4 relative" />

                    <span className="relative">{item.label}</span>

                    {isActive && (
                      <Sparkles className="w-3.5 h-3.5 ml-auto relative" />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 p-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-rose-300 hover:bg-rose-500/15"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <main className="pt-16 lg:pl-72 min-h-screen flex flex-col">
        <div className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}