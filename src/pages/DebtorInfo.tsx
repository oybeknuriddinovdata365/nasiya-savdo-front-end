import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import axios from "axios";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
// Agar iconlar bo'lmasa, oddiy text yoki svg ishlatamiz.
// Iconlar importi muammo bo'lishi mumkinligi uchun, SVG larni shu yerda ishlataman yoki mavjudlarini tekshiraman.

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
  return new Date(date).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const baseUrl = import.meta.env.VITE_API_URL;

  const rootUrl = baseUrl.endsWith("/api") ? baseUrl.slice(0, -4) : baseUrl;

  // Dublikat slashlarni oldini olish
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${rootUrl}${cleanPath}`;
};

export default function DebtorInfoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [debtorData, setDebtorData] = useState<Debtor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [more, setMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const allDebts = debtorData?.debts ?? [];
  const visibleDebts = more ? allDebts : allDebts.slice(0, 3);

  const getData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axios.get(`${API}/debtor/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
      });
      setDebtorData(res.data.data);
    } catch (error) {
      console.error(error);
      setError(
        "Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-10 max-w-[1440px] mx-auto px-4 sm:px-6 mt-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
        <div className="bg-white dark:bg-[#171F2F] rounded-xl shadow-sm p-6 mb-8 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1 space-y-4">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
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
            onClick={getData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadImage = async (imagePath: string) => {
    try {
      const imageUrl = getImageUrl(imagePath);

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = imagePath.split("/").pop() || "image";
      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Rasmni yuklab olishda xatolik:", err);
    }
  };
  
  return (
    <div className="min-h-screen pb-10">
      <PageBreadcrumb
        pageTitle="Debtor Info"
        onBack={() => navigate(-1)}
        toTitle="User Info"
        HeadText="Foydalanuvchi ma'lumotlari"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-8">
        {/* HEADER & INFO */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Asosiy Info */}
          <div className="xl:col-span-2 bg-white dark:bg-[#171F2F] rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-bold">
                {debtorData?.full_name?.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="grow w-full text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {debtorData?.full_name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6 italic">
                {debtorData?.description || "Izoh yo'q"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="block text-gray-400 mb-1">Manzil</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {debtorData?.address || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 mb-1">
                    Yaratilgan sana
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {formatDate(debtorData?.created_at)}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 mb-1">
                    Jami qarz miqdori
                  </span>
                  <span className="font-bold text-lg text-error-500 dark:text-error-400">
                    {formatMoney(debtorData?.totalDebtSum)}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 mb-1">
                    Telefon raqamlar
                  </span>
                  {debtorData?.phone_numbers &&
                  debtorData.phone_numbers.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {debtorData.phone_numbers.map((phone) => (
                        <a
                          href={`tel:${phone.phone_number}`}
                          key={phone.id}
                          className="text-blue-500 hover:underline font-medium"
                        >
                          {phone.phone_number}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">Raqamlar yo'q</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rasmlar (Pasport va h.k) */}
          <div className="xl:col-span-1 bg-white dark:bg-[#171F2F] rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Biriktirilgan fayllar
            </h3>
            {debtorData?.images && debtorData.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {debtorData.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 group cursor-pointer"
                    onClick={() => setSelectedImage(img.image)}
                  >
                    <img
                      src={getImageUrl(img.image)}
                      alt="Debtor file"
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/400x400?text=Rasm+Topilmadi";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded">
                        Ko'rish
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Rasmlar mavjud emas
              </p>
            )}
          </div>
        </div>

        {/* DEBTS LIST */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between items-end sm:items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Qarzlar tarixi
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                {allDebts.length}
              </span>
            </h2>

            {(allDebts.length ?? 0) > 3 && (
              <button
                className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                onClick={() => setMore((prev) => !prev)}
              >
                {more ? "Kamroq ko'rsatish" : "Barchasini ko'rsatish"}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {visibleDebts.length === 0 ? (
              <div className="bg-white dark:bg-[#171F2F] rounded-xl shadow-sm p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Hozircha qarzlar mavjud emas
                </p>
              </div>
            ) : (
              visibleDebts.map((debt) => (
                <div
                  key={debt.id}
                  className="bg-white dark:bg-[#171F2F] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {debt.debt_name}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {debt.description}
                      </div>
                    </div>
                    <StatusBadge status={debt.debt_status} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-6 gap-x-4 text-sm">
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                        Jami summa
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                        {formatMoney(debt.total_amount)}
                      </span>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                        Qolgan summa
                      </span>
                      <span className="font-semibold text-error-500 text-base">
                        {formatMoney(debt.remaining_amount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                        Oylik to‘lov
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {formatMoney(debt.monthly_amount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                        Progress
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {debt.months_paid} / {debt.total_month} oy
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                        To‘lov sanasi
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        Har oyning {debt.payment_day}-kuni
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                        Keyingi to‘lov
                      </span>
                      <span className="font-medium badge bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded">
                        {formatDate(debt.next_payment_date)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400 flex justify-between">
                    <span>ID: #{debt.id}</span>
                    <span>Yaratildi: {formatDate(debt.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-auto h-auto max-w-full max-h-full flex items-center justify-center group">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 z-[1000] p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all
              opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 right-4"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <button
              onClick={() => handleDownloadImage(selectedImage)}
              className="  absolute top-4 z-[1000] p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all
              opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 right-15"
              title="Yuklab olish"
            >
              <Download size={26} strokeWidth={2} />
            </button>
            <img
              src={getImageUrl(selectedImage)}
              alt="Full preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
