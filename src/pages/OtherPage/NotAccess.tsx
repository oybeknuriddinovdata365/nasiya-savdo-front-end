import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";

export default function NotAccess() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-white dark:bg-gray-900">
      <GridShape />

      <div className="mx-auto w-full max-w-[450px] text-center relative z-10">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-error-50 dark:bg-white/5">
            <svg
              className="w-10 h-10 text-error-500"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white lg:text-5xl">
          Kirish taqiqlanadi
        </h1>

        <p className="text-6xl font-extrabold text-blue-500 dark:text-blue-400 mb-6 tracking-widest">
          403
        </p>

        <p className="mb-8 text-base text-gray-500 dark:text-gray-400 sm:text-lg">
          Kechirasiz, ushbu sahifani ko'rish uchun sizda yetarli huquqlar mavjud
          emas. Agar bu xatolik deb hisoblasangiz, administratorga murojaat
          qiling.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white transition-colors duration-300 rounded-lg bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
        >
          <svg
            className="w-5 h-5 mr-2 -ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
