import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function SignInForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/admin/login`, {
        username,
        password,
      });

      const data = response.data;
      localStorage.setItem("user_id", data.admin.id);

      await login(data.access_token, data.refresh_token);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        // Serverdan kelgan xabarni ko'rsatish yoki umumiy xabar
        setError(err.response.data.message || "Kirishda xatolik yuz berdi");
      } else {
        setError("Tarmoq xatoligi yoki server ishlamayapti");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Kirish
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-error-500 bg-error-50 rounded-lg dark:bg-error-500/10">
                {error}
              </div>
            )}
            <div>
              <Label>
                Username <span className="text-error-500">*</span>
              </Label>
              <Input
                auto_complete="username"
                type="text"
                placeholder="Usernamengizni kiriting"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!error}
              />
            </div>
            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  auto_complete="current-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Parolingizni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!error}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 focus:outline-none"
                  aria-label={
                    showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"
                  }
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <Button className="w-full" size="sm" type="submit" disabled={isLoading}>
                {isLoading ? "Kirilmoqda..." : "Kirish"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
