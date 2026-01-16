import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { cn } from "@/lib/utils";
import axios from "axios";
import DefaultUserIcon from "@/assets/defUserIcon.png";
import {
  Calendar,
  CheckCheck,
  Clock,
  DollarSign,
  FileText,
  Mail,
  MapPinned,
  Phone,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";

type Store = {
  image?: string;
  full_name?: string;
  login?: string;
  email?: string;
  phone_number?: string;
  id?: number;
  name?: string;
  is_active?: boolean;
  created_at?: string;
  debtors: Debtor[];
  payments: Payment[];
};

type Payment = {
  id?: number;
  sum?: number;
  created_at: string;
  payment_date: string;
  updated_at: string;
  debt: Debt;
};

type Debtor = {
  id?: number;
  name?: string;
  full_name?: string;
  address?: string;
  description?: string;
  created_at: string;
  debts?: Debt[];
};

type Debt = {
  id?: number;
  debt_name?: string;
  description?: string;
  monthly_amount?: string;
  months_paid?: number;
  next_payment_date?: string;
  payment_day?: number;
  remaining_amount?: string;
  total_amount?: string;
  debt_status?: DebtStatus;
  total_month?: number;
  updated_at: string;
  created_at: string;
};
type DebtStatus = "active" | "closed";

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const baseUrl = import.meta.env.VITE_API_URL;
  const rootUrl = baseUrl.endsWith("/api") ? baseUrl.slice(0, -4) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${rootUrl}${cleanPath}`;
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMoney = (amount?: string | number) => {
  if (!amount) return "0 so'm";
  return Number(amount).toLocaleString("uz-UZ") + " so'm";
};

function UserInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [more, setMore] = useState<boolean>(false);
  const [morePayments, setMorePayments] = useState<boolean>(false);
  const [userData, setUserData] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("access_token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/statistics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data.data;
      const user = data?.stores?.find((user: any) => user.id === Number(id));
      if (!user) throw new Error("Foydalanuvchi topilmadi");
      setUserData(user);
    } catch (error) {
      console.log(error);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUserData();
  }, [id]);

  const visibleDebtors = more
    ? userData?.debtors
    : userData?.debtors?.slice(0, 3);

  const allDebts =
    userData?.debtors?.flatMap((debtor) => debtor.debts ?? []) ?? [];

  const visiblePayments = morePayments ? allDebts : allDebts?.slice(0, 3);

  const getProgressPercent = (monthsPaid?: number, totalMonth?: number) => {
    if (!totalMonth || totalMonth === 0) return 0;
    return Math.min(100, Math.round(((monthsPaid ?? 0) / totalMonth) * 100));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-10 mt-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
        <div className="bg-white dark:bg-[#171F2F] rounded-xl shadow-sm p-6 mb-8 animate-pulse flex flex-col md:flex-row gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-500 mb-4">{error}</p>
          <button
            onClick={fetchUserData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle="User Info"
        onBack={() => navigate(-1)}
        toTitle="Users Table"
        HeadText="Foydalanuvchi Ma'lumotlari"
      />
      <div className="flex flex-col gap-8 pb-10">
        <p className="text-gray-500 dark:text-gray-400">
          Foydalanuvchi haqida to'liq ma'lumot, nasiyalar va to'lovlar bo'yicha
          umumiy ma'lumot
        </p>

        <div className="bg-white dark:bg-[#171F2F] shadow-sm border border-gray-100 dark:border-gray-800 p-6 rounded-xl flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <div className="relative w-24 h-24 shrink-0">
              <img
                src={
                  userData?.image
                    ? getImageUrl(userData.image)
                    : DefaultUserIcon
                }
                alt="userimage"
                className="w-full h-full rounded-full object-cover border-4 border-gray-100 dark:border-gray-700"
              />

              <span
                className={cn(
                  "absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white dark:border-[#171F2F]",
                  userData?.is_active ? "bg-green-500" : "bg-red-500"
                )}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h1 className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                  {userData?.full_name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  @{userData?.login}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex gap-2 items-center justify-center md:justify-start">
                  <Mail size={16} />
                  <span>{userData?.email}</span>
                </div>
                <div className="flex gap-2 items-center justify-center md:justify-start">
                  <Phone size={16} />
                  <span>{userData?.phone_number}</span>
                </div>
                <div className="flex gap-2 items-center justify-center md:justify-start">
                  <Calendar size={16} />
                  <span>{formatDate(userData?.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            {userData?.is_active ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <UserRoundCheck size={16} /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <UserRoundX size={16} /> Inactive
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Mijozlar
            </h1>
            {(userData?.debtors?.length ?? 0) > 3 && (
              <button
                className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                onClick={() => setMore((prev) => !prev)}
              >
                {more ? "Kamroq ko'rsatish" : "Barchasini ko'rsatish"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {userData?.debtors?.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-500">
                Bu foydalanuvchiga tegishli mijozlar mavjud emas
              </div>
            ) : (
              visibleDebtors?.map((debtor) => (
                <Link
                  to={`/debtor/${debtor.id}`}
                  key={debtor.id}
                  className="group bg-white hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-[#171F2F] shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 p-5 rounded-xl transition-all"
                >
                  <div className="flex flex-col gap-3">
                    <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">
                      {debtor.full_name}
                    </h2>
                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPinned size={16} className="shrink-0" />
                        <span className="truncate">{debtor.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="shrink-0" />
                        <span className="truncate">{debtor.description}</span>
                      </div>
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={14} />
                      <span>{formatDate(debtor?.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              To'lovlar Tarixi
            </h1>
            {(userData?.payments.length ?? 0) > 3 && (
              <button
                className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                onClick={() => setMorePayments((prev) => !prev)}
              >
                {morePayments ? "Kamroq ko'rsatish" : "Barchasini ko'rsatish"}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {visiblePayments?.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-500">
                Bu foydalanuvchiga tegishli to'lovlar mavjud emas
              </div>
            ) : (
              visiblePayments?.map((debt) => {
                const progress = getProgressPercent(
                  debt.months_paid,
                  debt.total_month
                );
                return (
                  <Accordion
                    key={debt.id}
                    type="single"
                    collapsible
                    className="bg-white dark:bg-[#171F2F] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                  >
                    <AccordionItem
                      value={String(debt.id)}
                      className="border-b-0"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:no-underline">
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-full text-left">
                          <div className="flex gap-4 items-center flex-1">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
                              <Calendar size={18} className="text-gray-400" />
                              {formatDate(debt.created_at)}
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <DollarSign
                                size={18}
                                className="text-green-500"
                              />
                              {formatMoney(debt.total_amount)}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 justify-between sm:justify-end">
                            <span className="sm:hidden font-semibold text-gray-900 dark:text-gray-100">
                              {formatMoney(debt.total_amount)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full block md:hidden",
                                  debt.debt_status === "active"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                )}
                              />
                              <span
                                className={cn(
                                  "px-2.5 py-0.5 rounded-full text-xs font-medium hidden md:block",
                                  debt.debt_status === "active"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                )}
                              >
                                {debt.debt_status === "active"
                                  ? "Faol"
                                  : "Yopilgan"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 px-6 py-4">
                        <div className="flex flex-col md:flex-row gap-8">
                          {/* CHAP TOMON */}
                          <div className="md:w-1/2 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {debt.description}
                            </h3>

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                                <span className="text-gray-500">
                                  Umumiy nasiya:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {formatMoney(debt.total_amount)}
                                </span>
                              </div>

                              <div className="flex justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                                <span className="text-gray-500">Qolgan:</span>
                                <span className="font-medium text-error-500">
                                  {formatMoney(debt.remaining_amount)}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Oylik to'lov:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {formatMoney(debt.monthly_amount)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* O‘NG TOMON */}
                          <div className="md:w-1/2">
                            <div className="bg-white dark:bg-[#171F2F] rounded-lg border border-gray-100 dark:border-gray-700 p-4 space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {debt.debt_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {debt.months_paid} / {debt.total_month} oy
                                </span>
                              </div>

                              <div className="space-y-1">
                                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full transition-all duration-500 rounded-full",
                                      debt.debt_status === "closed"
                                        ? "bg-green-500"
                                        : "bg-blue-600"
                                    )}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                  {progress}% to'landi
                                </div>
                              </div>

                              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                {debt.debt_status === "closed" ? (
                                  <span className="text-green-600 dark:text-green-400 text-sm flex gap-2 items-center">
                                    <CheckCheck size={16} /> To'liq to'langan
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Clock size={16} />
                                    <span>
                                      Keyingi to'lov:{" "}
                                      <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {debt.next_payment_date}
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
