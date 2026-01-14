import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

export type DebtStatus = "active" | "closed";

export interface Debt {
  id: number;
  created_at: string;
  updated_at: string;
  debt_name: string;
  description: string;
  monthly_amount: string;
  months_paid: number;
  next_payment_date: string;
  payment_day: number;
  remaining_amount: string;
  total_amount: string;
  total_month: number;
  debt_status: DebtStatus;
}

export interface DebtorImage {
  id: number;
  created_at: string;
  updated_at: string;
  image: string;
}

export interface PhoneNumber {
  id: number;
  created_at: string;
  updated_at: string;
  phone_number: string;
}

export interface Debtor {
  id: number;
  full_name: string;
  description: string;
  address: string;
  created_at: string;
  updated_at: string;
  totalDebtSum: number;
  debts: Debt[];
  images: DebtorImage[];
  phone_numbers: PhoneNumber[];
}

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatMoney = (amount?: string | number) => {
  if (!amount) return "0 so'm";
  return Number(amount).toLocaleString("uz-UZ") + " so'm";
};

const StatusBadge = ({ status }: { status: DebtStatus }) => {
  const styles =
    status === "closed"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles}`}>
      {status === "closed" ? "Yopilgan" : "Faol"}
    </span>
  );
};

export default function DebtorInfoPage() {
  const { id } = useParams();
  const API = import.meta.env.VITE_API_URL;

  const [debtorData, setDebtorData] = useState<Debtor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [more, setMore] = useState(false);

  const allDebts = debtorData?.debts ?? [];
  const visibleDebts = more ? allDebts : allDebts.slice(0, 3);

  const getData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API}/debtor/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
      });
      setDebtorData(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <PageBreadcrumb
        pageTitle="Debtor Info"
        to={-1 as any}
        toTitle="User Info"
        HeadText="Foydalanuvchi ma'lumotlari"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-8">
        {/* HEADER */}
        <div className="bg-gray-100/30 dark:bg-[#171F2F] rounded-xl shadow-sm p-6 flex flex-col md:items-center md:flex-row gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-semibold">
              {debtorData?.full_name?.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
              {debtorData?.full_name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {debtorData?.description}
            </p>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="block text-gray-400">Manzil</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {debtorData?.address}
                </span>
              </div>

              <div>
                <span className="block text-gray-400">Yaratilgan sana</span>
                <span className="text-gray-800 dark:text-gray-200">
                  {formatDate(debtorData?.created_at)}
                </span>
              </div>

              <div>
                <span className="block text-gray-400">Jami qarz</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatMoney(debtorData?.totalDebtSum)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DEBTS */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Qarzlar ro'yxati
            </h2>

            {(allDebts.length ?? 0) > 3 && (
              <button
                className="cursor-pointer text-[14px] underline hover:text-blue-500"
                onClick={() => setMore((prev) => !prev)}
              >
                {more ? "Kamroq ko'rsatish" : "Barchasini ko'rsatish"}
              </button>
            )}
          </div>

          {visibleDebts.length === 0 ? (
            <div className="bg-gray-100/30 dark:bg-[#171F2F] rounded-xl shadow-sm p-10 text-center text-gray-500">
              Hozircha qarzlar mavjud emas
            </div>
          ) : (
            visibleDebts.map((debt) => (
              <div
                key={debt.id}
                className="bg-gray-100/30 dark:bg-[#171F2F] rounded-xl shadow-sm p-6 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {debt.debt_name}
                  </h3>
                  <StatusBadge status={debt.debt_status} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 block">Umumiy summa</span>
                    <span>{formatMoney(debt.total_amount)}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block">Oylik to‘lov</span>
                    <span>{formatMoney(debt.monthly_amount)}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block">Umumiy oy</span>
                    <span>{debt.total_month}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block">To‘langan oy</span>
                    <span>{debt.months_paid}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block">Qolgan summa</span>
                    <span>{formatMoney(debt.remaining_amount)}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block">To‘lov kuni</span>
                    <span>{debt.payment_day}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block">Keyingi to‘lov</span>
                    <span>{formatDate(debt.next_payment_date)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 flex flex-col sm:flex-row sm:justify-between gap-2">
                  <span>Yaratilgan: {formatDate(debt.created_at)}</span>
                  <span>Yangilangan: {formatDate(debt.updated_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
