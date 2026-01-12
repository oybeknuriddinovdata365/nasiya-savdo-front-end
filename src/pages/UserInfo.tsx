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
import { Link, useParams } from "react-router";
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
type DebtStatus = "active" | "closed"

function UserInfo() {
  const { id } = useParams();
  const [more, setMore] = useState<boolean>(false);
  const [morePayments, setMorePayments] = useState<boolean>(false);
  const [userData, setUserData] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem("access_token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/statistics`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data.data;
        const user = data?.stores?.find((user: any) => user.id === Number(id));
        setUserData(user || null);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

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

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          <PageBreadcrumb
            pageTitle="User Info"
            to="/users-table"
            toTitle="UsersTable"
            HeadText="Foydalanuvchi Ma'lumotlari"
          />
          <div className="flex flex-col gap-8">
            <p className="text-gray-500">
              Foydalanuvchi haqida to'liq ma'lumot, nasiyalar va to'lovlar
              bo'yicha umumiy ma'lumot
            </p>

            <div className="dark:bg-[#171F2F] shadow-lg border-2 dark:border-[#242B3A] border-gray-100 p-7 rounded-lg flex justify-between">
              <div className="flex gap-8">
                <div className="relative w-20 h-20 sm:w-30 sm:h-30">
                  <img
                    src={userData?.image ?? DefaultUserIcon}
                    alt="userimage"
                    className="w-full h-full rounded-full object-cover border-2 dark:border-gray-600 border-gray-300"
                  />

                  <span
                    className={cn(
                      "absolute sm:hidden bottom-1 right-1 sm:bottom-2 sm:right-2",
                      "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white dark:border-[#171F2F]",
                      userData?.is_active ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                </div>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-1">
                    <h1 className="font-semibold text-[20px]">
                      {userData?.full_name}
                    </h1>
                    <h1>@{userData?.login}</h1>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <Mail size={20} />
                      <h1>{userData?.email}</h1>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Phone size={20} />
                      <h1>{userData?.phone_number}</h1>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Calendar size={20} />
                      {userData?.created_at && (
                        <h1>
                          {new Date(userData.created_at).toLocaleString(
                            "uz-UZ",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </h1>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                {userData?.is_active ? (
                  <p className="bg-green-500/50 flex gap-1 items-center px-2 rounded-lg">
                    <UserRoundCheck size={18} /> Active
                  </p>
                ) : (
                  <p className="bg-red-500/50 flex gap-1 items-center px-2 rounded-lg">
                    <UserRoundX size={18} /> Inactive
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <h1 className="text-[20px] mb-5">Mijozlar</h1>
                {(userData?.debtors?.length ?? 0) > 3 && (
                  <button
                    className="cursor-pointer text-[14px] underline hover:text-blue-500"
                    onClick={() => setMore((prev) => !prev)}
                  >
                    {more ? "Kamroq ko'rsatish" : "Barchasini ko'rsatish"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {userData?.debtors?.length === 0 ? (
                  <h1 className="opacity-50 font-light">
                    Bu foydalanuvchiga tegishli mijozlar mavjud emas
                  </h1>
                ) : (
                  visibleDebtors?.map((debtor) => (
                    <Link
                      to={`/debtor/${debtor.id}`}
                      key={debtor.id}
                      className="dark:bg-[#171F2F]  shadow-lg border-2 dark:border-[#242B3A] dark:hover:bg-[#242B3A] hover:bg-gray-100 hover:border-2 dark:hover:border-white/50 hover:border-black/50 border-gray-100 p-5 rounded-lg"
                    >
                      <div className="flex flex-col gap-3">
                        <h1 className="font-semibold">{debtor.full_name}</h1>
                        <div>
                          <div className="flex items-center gap-2 text-[14px]">
                            <MapPinned size={17} />
                            {debtor.address}
                          </div>
                          <div className="flex items-center gap-2 text-[14px]">
                            <FileText size={17} />
                            {debtor.description}
                          </div>
                        </div>
                        <div className="w-full border bg-gray-500/10 mt-1"></div>
                        <div className="flex items-center gap-2 text-[14px]">
                          <Calendar size={17} />
                          {debtor?.created_at && (
                            <h1>
                              <span>Yaratilgan:</span>
                              {new Date(debtor.created_at).toLocaleString(
                                "uz-UZ",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </h1>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <h1 className="text-[20px] mb-5">Tolovlar Tarixi</h1>
                {(userData?.payments.length ?? 0) > 3 && (
                  <button
                    className="cursor-pointer text-[14px] underline hover:text-blue-500"
                    onClick={() => setMorePayments((prev) => !prev)}
                  >
                    {morePayments
                      ? "Kamroq ko'rsatish"
                      : "Barchasini ko'rsatish"}
                  </button>
                )}
              </div>
              <div>
                {visiblePayments?.length === 0 ? (
                  <h1 className="opacity-50 font-light">
                    Bu foydalanuvchiga tegishli to'lovlar mavjud emas
                  </h1>
                ) : (
                  visiblePayments?.map((debt) => {
                    const progress = getProgressPercent(
                      debt.months_paid,
                      debt.total_month
                    );
                    return (
                      <Accordion key={debt.id} type="single" collapsible>
                        <AccordionItem value={String(debt.id)}>
                          <AccordionTrigger className="hover:bg-gray-400/20 dark:hover:bg-[#1d273b] mt-2 shadow-sm rounded-t-lg rounded-b-none dark:bg-[#171F2F] border-2 dark:border-[#242B3A] border-gray-100 ">
                            <div className="flex gap-7 items-center w-full px-2">
                              <div className="flex gap-2 items-center">
                                <Calendar size={18} />{" "}
                                <h1>
                                  {new Date(debt.created_at).toLocaleString(
                                    "uz-UZ",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </h1>
                              </div>
                              <div className="flex gap-2 items-center">
                                <DollarSign size={18} color="lime" />{" "}
                                <h1>
                                  {Number(debt.total_amount).toLocaleString(
                                    "uz-UZ"
                                  )}{" "}
                                  so'm
                                </h1>
                              </div>
                              <div className="hidden sm:block">
                                <h1>{debt.description}</h1>
                              </div>
                              <div className="flex justify-end">
                                <span
                                  className={cn(
                                    "w-2.5 h-2.5 rounded-full sm:hidden",
                                    debt.debt_status === "active"
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  )}
                                />
                                <h1
                                  className={cn(
                                    "hidden md:block",
                                    debt.debt_status === "active"
                                      ? "text-green-500"
                                      : "text-red-500"
                                  )}
                                >
                                  {debt.debt_status === "active"
                                    ? "Faol"
                                    : "Yopilgan"}
                                </h1>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="dark:bg-[#171F2F] shadow-lg border-2 dark:border-[#242B3A] border-gray-100 rounded-b-lg ">
                            <div className="flex flex-col md:flex-row justify-between gap-10 mt-3 px-2">
                              {/* CHAP TOMON */}
                              <div className="md:w-1/2 flex flex-col gap-5">
                                <h1 className="text-[20px] font-semibold">
                                  {debt.description}
                                </h1>

                                <div className="flex flex-col gap-2">
                                  <div className="flex justify-between">
                                    <h1>Umumiy nasiya:</h1>
                                    <h1>
                                      {Number(debt.total_amount).toLocaleString(
                                        "uz-UZ"
                                      )}{" "}
                                      so'm
                                    </h1>
                                  </div>

                                  <div className="flex justify-between">
                                    <h1>Qolgan:</h1>
                                    <h1>
                                      {Number(
                                        debt.remaining_amount
                                      ).toLocaleString("uz-UZ")}{" "}
                                      so'm
                                    </h1>
                                  </div>

                                  <div className="flex justify-between">
                                    <h1>Oylik to'lov:</h1>
                                    <h1>
                                      {Number(
                                        debt.monthly_amount
                                      ).toLocaleString("uz-UZ")}{" "}
                                      so'm
                                    </h1>
                                  </div>
                                </div>
                              </div>

                              {/* O‘NG TOMON */}
                              <div className="md:w-1/2 flex flex-col gap-4">
                                <div
                                  key={debt.id}
                                  className=" p-5 flex flex-col gap-3"
                                >
                                  <div className="flex justify-between items-center">
                                    <h1 className="font-semibold">
                                      {debt.debt_name}
                                    </h1>
                                    <span className="text-sm text-gray-500">
                                      {debt.months_paid} / {debt.total_month} oy
                                    </span>
                                  </div>

                                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full transition-all duration-500 rounded-[5px]",
                                        debt.debt_status === "closed"
                                          ? "bg-green-500"
                                          : "bg-blue-600"
                                      )}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>

                                  <span className="text-sm text-gray-500">
                                    {progress}% To'langan
                                  </span>

                                  <div>
                                    {debt.debt_status === "closed" ? (
                                      <span className="text-green-500 flex gap-2 items-center">
                                        <CheckCheck size={16} /> Bu nasiya
                                        to'liq to'langan
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <Clock size={18} />{" "}
                                        <div>
                                          <span>Keyingi Tolov:</span>
                                          <div>{debt.next_payment_date}</div>
                                        </div>
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
      )}
    </div>
  );
}

export default UserInfo;
