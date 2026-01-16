import DefaultUserIcon from "../../assets/defUserIcon.png";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useState, useEffect } from "react";
import { EyeCloseIcon, EyeIcon, InfoIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

interface FormData {
  username: string;
  phone_number: string;
  password: string;
}

interface ErrorType {
  username?: string;
  phone_number?: string;
  password?: string;
}

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const baseUrl = import.meta.env.VITE_API_URL;
  const rootUrl = baseUrl.endsWith("/api") ? baseUrl.slice(0, -4) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${rootUrl}${cleanPath}`;
};

export default function UserMetaCard() {
  const API = import.meta.env.VITE_API_URL;
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useAuth(); // Assuming login or specific update method might be needed, but for now we just update local display

  // Local state for immediate UI updates
  const [localUser, setLocalUser] = useState({
    username: user?.username ?? "Admin",
    phone_number: user?.phone_number ?? "",
    image: user?.image,
  });

  const [formData, setFormData] = useState<FormData>({
    username: "",
    phone_number: "",
    password: "",
  });

  const [errors, setErrors] = useState<ErrorType>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLocalUser({
        username: user.username ?? "",
        phone_number: user.phone_number ?? "",
        image: user.image,
      });
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: localUser.username,
        phone_number: localUser.phone_number,
        password: "",
      });
      setErrors({});
    }
  }, [isOpen, localUser]);

  const validate = (): boolean => {
    const newErrors: ErrorType = {};
    if (formData.username && formData.username.length < 3) {
      newErrors.username = "Login kamida 3 ta belgidan iborat bo'lishi kerak";
    }
    if (formData.phone_number) {
      // Simple check, or regex if strict +998... needed
      if (formData.phone_number.length < 9) {
        // minimal check
        newErrors.phone_number = "Telefon raqam noto'g'ri";
      }
    }

    if (formData.password.trim().length > 0) {
      // Relaxed password policy if strictly required, but keeping strong for admin security
      const strongPass = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!strongPass.test(formData.password)) {
        newErrors.password =
          "Parol kamida 8 ta belgi, katta harf, raqam va maxsus belgi bo'lishi kerak";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateUser = async (): Promise<void> => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      const id = localStorage.getItem("user_id");
      const payload: Partial<FormData> = {};

      if (
        formData.username.trim() &&
        formData.username !== localUser.username
      ) {
        payload.username = formData.username.trim();
      }

      if (
        formData.phone_number.trim() &&
        formData.phone_number !== localUser.phone_number
      ) {
        payload.phone_number = formData.phone_number.trim();
      }

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      if (Object.keys(payload).length === 0) {
        toast("O'zgarishlar yo'q", { icon: "ℹ️" });
        closeModal();
        return;
      }

      await axios.patch(`${API}/admin/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // Update local state immediately
      setLocalUser((prev) => ({
        ...prev,
        username: payload.username ?? prev.username,
        phone_number: payload.phone_number ?? prev.phone_number,
      }));

      toast.success("Ma'lumotlar yangilandi");
      closeModal();

      // Optionally reload or re-fetch if Context needs to be synced
      // For now, local update is enough for this visual card.
      // If the header or sidebar depends on this, a refresh might be needed or Context update.
      // But let's avoid reload if possible to be smooth.
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateUser();
  };

  if (!user) {
    return (
      <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800 animate-pulse">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-3 flex-1">
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* CARD */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 bg-white dark:bg-[#171F2F] lg:p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-24 h-24 overflow-hidden border-4 border-gray-100 dark:border-gray-700 rounded-full shrink-0">
              <img
                src={
                  localUser.image
                    ? getImageUrl(localUser.image)
                    : DefaultUserIcon
                }
                alt="user"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center xl:text-left space-y-1">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                {localUser.username}
              </h4>
              <p className="text-sm font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1 rounded-full inline-block">
                {user?.role ? user.role.toUpperCase() : "ADMIN"}
              </p>
              <h1 className="text-gray-500 dark:text-gray-400 mt-2 block">
                {localUser.phone_number}
              </h1>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 w-full xl:w-auto"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Tahrirlash
          </button>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] m-4 p-0 overflow-hidden"
      >
        <div className="bg-white dark:bg-[#1C2434] w-full">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Profilni tahrirlash
            </h3>
          </div>

          <form onSubmit={handleSaveClick} className="p-6">
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg flex gap-3 text-sm items-start">
                <InfoIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <span>
                  O'zgartirish kiritish shart bo'lmagan maydonlarni bo'sh
                  qoldiring.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input
                    type="text"
                    placeholder="Yangi username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Telefon Raqam</Label>
                  <Input
                    placeholder="+998..."
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                  />
                  {errors.phone_number && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone_number}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Yangi Parol</Label>
                <div className="relative">
                  <Input
                    type={!showPassword ? "password" : "text"}
                    placeholder="Admin parolini yangilash (ixtiyoriy)"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeIcon className="size-5" />
                    ) : (
                      <EyeCloseIcon className="size-5" />
                    )}
                  </span>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={closeModal}
                type="button"
              >
                Bekor qilish
              </Button>

              <Button
                size="sm"
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
