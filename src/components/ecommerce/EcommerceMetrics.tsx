import { useEffect, useState } from "react";
import { BoxIconLine, GroupIcon } from "../../icons";
import { DashboardResponse, Period } from "../../pages/Dashboard/Home";

interface Props {
  period: Period;
  usersData: DashboardResponse | null;
  debtsData:  any[];
  isLoading: boolean;
}

export default function EcommerceMetrics({ period, usersData, debtsData, isLoading }: Props) {
  const [countNewUsers, setCountNewUsers] = useState<number>(0);
  const [totalClosedDebts, setTotalClosedDebts] = useState<number>(0);
  const [newClosedDebts, setNewClosedDebts] = useState<number>(0);

  // Ma'lumotlar o'zgarganda hisoblash
  useEffect(() => {
    if (!usersData) return;

    // Umumiy yopilgan nasiyalar
    const closedDebtsCount =
      usersData?.debts?.filter((debt) => debt.debt_status === "closed").length ?? 0;
    setTotalClosedDebts(closedDebtsCount);

    const today = new Date(); // To avoid calling new Date() multiple times

    // Period bo'yicha filtrlash
    if (period === "day") {
      const todayStr = today.toDateString();

      const usersToday = usersData?.stores.filter(
        (user) => new Date(user.created_at).toDateString() === todayStr,
      ).length;

      const closedDebtsToday = usersData?.debts.filter(
        (debt) =>
          debt.debt_status === "closed" &&
          new Date(debt.created_at).toDateString() === todayStr,
      ).length;

      setCountNewUsers(usersToday);
      setNewClosedDebts(closedDebtsToday);
    } else if (period === "month") {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const usersThisMonth = usersData?.stores.filter((user) => {
        const date = new Date(user.created_at);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      }).length;

      const closedDebtsThisMonth = usersData?.debts.filter((debt) => {
        const date = new Date(debt.created_at);
        return (
          debt.debt_status === "closed" &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      }).length;

      setCountNewUsers(usersThisMonth);
      setNewClosedDebts(closedDebtsThisMonth);

    } else if (period === "year") {
      const currentYear = today.getFullYear();

      const usersThisYear = usersData?.stores.filter(
        (user) => new Date(user.created_at).getFullYear() === currentYear,
      ).length;

      const closedDebtsThisYear = usersData?.debts.filter(
        (debt) =>
          debt.debt_status === "closed" &&
          new Date(debt.created_at).getFullYear() === currentYear,
      ).length;

      setCountNewUsers(usersThisYear);
      setNewClosedDebts(closedDebtsThisYear);
    }
  }, [period, usersData, debtsData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700 mb-5"></div>
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Umumiy Foydalanuvchilar
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 flex  gap-5">
              {usersData?.total_users ?? 0}{" "}
              <span className="bg-green-500/30 text-[16px] font-semibold rounded-full text-center px-2">
                + {countNewUsers}{" "}
                <span className="text-[12px] font-extralight">
                  Yangi Foydalanuvchilar
                </span>
              </span>
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6  dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Umumiy Yopilgan Nasiyalar
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 flex gap-5">
              {totalClosedDebts}{" "}
              <span className="bg-green-500/30 text-[16px] font-semibold rounded-full text-center px-2">
                + {newClosedDebts}{" "}
                <span className="text-[12px] font-extralight">
                  Yangi yopilgan nasiyalar
                </span>
              </span>
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
