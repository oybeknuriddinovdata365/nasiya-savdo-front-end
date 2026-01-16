import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { DashboardResponse, Period } from "../../pages/Dashboard/Home";

interface Props {
  period: Period;
  data: DashboardResponse | null;
  isLoading: boolean;
}

export default function StatisticsChart({ period, data, isLoading }: Props) {
  const [given, setGiven] = useState<number[]>([]);
  const [paid, setPaid] = useState<number[]>([]);
  const [late, setLate] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!data) return;

    /* ==============================
       PERIOD CONFIGURATION
    ============================== */
    const now = new Date();
    let currentCategories: string[] = [];
    let length = 0;

    if (period === "day") {
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();

      length = daysInMonth;
      currentCategories = Array.from({ length }, (_, i) => `${i + 1}`);
    } else if (period === "month") {
      length = 12;
      currentCategories = [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "Iyun",
        "Iyul",
        "Avgust",
        "Sentyabr",
        "Oktabr",
        "Noyabr",
        "Dekabr",
      ];
    } else if (period === "year") {
      length = 10;
      const currentYear = now.getFullYear();
      currentCategories = Array.from(
        { length },
        (_, i) => `${currentYear - (length - 1) + i}`
      );
    }

    setCategories(currentCategories);

    /* ==============================
       DATA ARRAYS
    ============================== */
    const newGiven = new Array(length).fill(0);
    const newPaid = new Array(length).fill(0);
    const newLate = new Array(length).fill(0);

    data.debts.forEach((debt) => {
      const date = new Date(debt.created_at);
      let index = -1;

      if (period === "day") {
        if (
          date.getFullYear() !== now.getFullYear() ||
          date.getMonth() !== now.getMonth()
        ) {
          return;
        }
        index = date.getDate() - 1;
      } else if (period === "month") {
        if (date.getFullYear() !== now.getFullYear()) {
          return;
        }
        index = date.getMonth();
      } else if (period === "year") {
        const startYear = now.getFullYear() - 9;
        const year = date.getFullYear();

        if (year < startYear || year > now.getFullYear()) {
          return;
        }
        index = year - startYear;
      }

      if (index < 0 || index >= length) return;

      // Agar total_amount string kelsa numberga aylantiramiz
      const total = Number(debt.total_amount || 0);
      const remaining = Number(debt.remaining_amount || 0);
      const paidAmount = total - remaining;

      newGiven[index] += total;
      newPaid[index] += paidAmount;

      if (debt.debt_status === "active" && remaining > 0) {
        newLate[index] += remaining;
      }
    });

    setGiven(newGiven);
    setPaid(newPaid);
    setLate(newLate);

  }, [period, data]);

  /* ==============================
     CHART SERIES
  ============================== */
  const series = [
    { name: "Berilgan nasiya", data: given },
    { name: "To'langan nasiya", data: paid },
    { name: "Kechiktirilgan nasiya", data: late },
  ];

  /* ==============================
     CHART OPTIONS
  ============================== */
  const options: ApexOptions = {
    legend: { show: false },
    colors: ["#12B76A", "#465FFF", "#F04438"],
    chart: {
      type: "area",
      height: 310,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    stroke: { curve: "straight", width: 2 },
    markers: {
      size: 0,
      hover: { size: 6 },
    },
    dataLabels: { enabled: false },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      x: {
        formatter: (_: number, opts: any) => {
          const label =
            opts.w.globals.categoryLabels?.[opts.dataPointIndex] ??
            opts.w.globals.labels?.[opts.dataPointIndex];

          if (period === "day") return `${label}-kun`;
          if (period === "year") return `${label}-yil`;

          return label;
        },
      },
      y: {
        formatter: (val: number) => `${val.toLocaleString("uz-UZ")} UZS`,
      },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val.toLocaleString("uz-UZ"),
      },
    },
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 h-[380px] flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Statistika
      </h3>
      <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
        {period === "day" ? "Kun" : period === "month" ? "Oy" : "Yil"} bo'yicha
        to'liq ma'lumotlar
      </p>

      <div id="chartOne" className="-ml-5">
        <Chart options={options} series={series} height={310} type="line" />
      </div>
    </div>
  );
}
