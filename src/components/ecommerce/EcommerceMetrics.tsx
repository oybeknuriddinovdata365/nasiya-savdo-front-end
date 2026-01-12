import axios from "axios";
import { BoxIconLine, GroupIcon } from "../../icons";
import { useEffect, useState } from "react";
type Store = {
  id?: number;
  name?: string;
  created_at: string;
};

type Debtor = {
  id?: number;
  name?: string;
  created_at: string;
};

type Debt = {
  id?: number;
  amount?: number;
  debt_status?: DebtStatus;
  created_at: string;
};
type DebtStatus = "active" | "closed";

type DashboardResponse = {
  total_users: number;
  stores: Store[];
  totalDebtors: number;
  debtors: Debtor[];
  debts: Debt[];
  closed_debts: Debt[];
  total_closed_debts: number;
};
type Period = "day" | "month" | "year";

interface Props {
  period: Period;
}
export default function EcommerceMetrics({ period }: Props) {
  const [allStores, setAllStores] = useState<DashboardResponse>();
  const [countNewUsers, setCountNewUsers] = useState<number>(0);
  const token = localStorage.getItem("access_token");
  const [totalcClosedDebts, setTotalClosedDebts] = useState<number>(0);
  const [newClosedDebts, setNewClosedDebts] = useState<number>(0);
  const handleGetUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/statistics`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      setAllStores(res.data.data);
      // nasiya yopilgan debtorlarni sanab olish
      const closedDebtsCount =
        res.data.data?.debts?.filter(
          (debt: Debt) => debt.debt_status === "closed"
        ).length ?? 0;
      setTotalClosedDebts(closedDebtsCount);
      // ==========================================
    } catch (error) {
      console.log(error);
    }
  };
  const handleDaySelected = () => {
    if (!allStores) return;

    const today = new Date().toDateString();

    //  Bugun yangi ro‘yxatdan o‘tganlar
    const usersToday = allStores.stores.filter(
      (user: Store) => new Date(user.created_at).toDateString() === today
    );

    //  Bugun yopilgan qarzlar
    const closedDebtsToday = allStores.debts.filter(
      (debt: Debt) =>
        debt.debt_status === "closed" &&
        new Date(debt.created_at).toDateString() === today
    );

    setCountNewUsers(usersToday.length);
    setNewClosedDebts(closedDebtsToday.length);
  };

  const handleMonthSelected = () => {
    if (!allStores) return;

    const now = new Date();

    // Shu oyda ro‘yxatdan o‘tganlar  
    const usersThisMonth = allStores.stores.filter((user) => {
      const date = new Date(user.created_at);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    // Shu oyda yopilgan qarzlar
    const closedDebtsThisMonth = allStores.debts.filter((debt) => {
      const date = new Date(debt.created_at);
      return (
        debt.debt_status === "closed" &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    setCountNewUsers(usersThisMonth.length);
    setNewClosedDebts(closedDebtsThisMonth.length);
  };

  const handleYearSelected = () => {
    if (!allStores) return;

    const currentYear = new Date().getFullYear();

    // Shu yilda ro‘yxatdan o‘tganlar
    const usersThisYear = allStores.stores.filter(
      (user) => new Date(user.created_at).getFullYear() === currentYear
    );

    //  Shu yilda yopilgan qarzlar
    const closedDebtsThisYear = allStores.debts.filter(
      (debt) =>
        debt.debt_status === "closed" &&
        new Date(debt.created_at).getFullYear() === currentYear
    );

    setCountNewUsers(usersThisYear.length);
    setNewClosedDebts(closedDebtsThisYear.length);
  };
  useEffect(() => {
    handleGetUsers();
  }, []);
  useEffect(() => {
    if (!allStores) return;

    if (period === "day") {
      handleDaySelected();
    } else if (period === "month") {
      handleMonthSelected();
    } else if (period === "year") {
      handleYearSelected();
    }
  }, [period, allStores]);

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
              {allStores?.total_users}{" "}
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
              {totalcClosedDebts}{" "}
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
