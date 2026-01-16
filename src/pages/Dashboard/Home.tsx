import { useEffect, useState } from "react";
import axios from "axios";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import Select from "../../components/form/Select";

// Tiplarni shu yerda e'lon qilamiz va export qilamiz,
// shunda bola komponentlar ham ishlata oladi.
export type Store = {
  id?: number;
  name?: string;
  created_at: string;
};

export type Debtor = {
  id?: number;
  name?: string;
  created_at: string;
};

export type Debt = {
  id?: number;
  amount?: number;
  total_amount?: string; // StatisticsChart uchun
  remaining_amount?: string; // StatisticsChart uchun
  debt_status?: "active" | "closed";
  created_at: string;
};

export type DashboardResponse = {
  total_users: number;
  stores: Store[];
  totalDebtors: number;
  debtors: Debtor[];
  debts: Debt[];
  closed_debts: Debt[];
  total_closed_debts: number;
};

export type Period = "day" | "month" | "year";

const PERIOD_OPTIONS = [
  { value: "day", label: "Kunlik Statistika" },
  { value: "month", label: "Oylik Statistika" },
  { value: "year", label: "Yillik Statistika" },
];

export default function Home() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("day");
  const [statsData, setStatsData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/statistics`,
          {
            headers: { Authorization: "Bearer " + token },
          }
        );
        setStatsData(res.data.data);
      } catch (error) {
        console.error("Statistika yuklashda xatolik:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSelectChange = (value: string) => {
    setSelectedPeriod(value as Period);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="w-full flex justify-center md:justify-end">
        <div className="w-[180px]">
          <Select
            options={PERIOD_OPTIONS}
            onChange={handleSelectChange}
            defaultValue={selectedPeriod}
            placeholder="Davrni tanlang"
          />
        </div>
      </div>

      <EcommerceMetrics
        period={selectedPeriod}
        data={statsData}
        isLoading={isLoading}
      />

      <StatisticsChart
        period={selectedPeriod}
        data={statsData}
        isLoading={isLoading}
      />
    </div>
  );
}
