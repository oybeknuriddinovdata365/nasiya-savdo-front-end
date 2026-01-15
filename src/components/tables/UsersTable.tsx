import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { useModal } from "../../hooks/useModal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import {
  EnvelopeIcon,
  EyeCloseIcon,
  EyeIcon,
  InfoIcon,
  PencilIcon,
  TrashBinIcon,
} from "../../icons";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState } from "react";
import PhoneInput from "../form/group-input/PhoneInput";
import FileInput from "../form/input/FileInput";
import Switch from "../form/switch/Switch";
import toast from "react-hot-toast";
import axios from "axios";
import DefaultUserIcon from "../../assets/defUserIcon.png";
import { SkeletonRow } from "../common/SkeletonRow";
import { Info } from "lucide-react";
import { useNavigate } from "react-router";
import SearchInput from "../ui/search/SearchInput";
interface ErrorType {
  login?: string;
  password?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  adress?: string;
  image?: string;
  pin_code?: string;
}
interface User {
  id: number;
  login: string;
  full_name: string;
  email: string;
  phone_number: string;
  pin_code: string;
  wallet: number;
  file: File | null;
  image: string | null; 
  is_active: boolean;
  is_blocked: boolean;
}

export default function UsersTable() {
  const [formData, setFormData] = useState<{
    login: string;
    password: string;
    full_name: string;
    email: string;
    phone: string;
    file: File | null;
    pin_code: string;
    active: boolean;
    blocked: boolean;
  }>({
    login: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
    file: null,
    pin_code: "",
    active: true,
    blocked: false,
  });

  const pustoyForm = {
    login: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
    file: null,
    address: "",
    pin_code: "",
    active: true,
    blocked: false,
  };
  const close = () => {
    closeModal();
    setEditUserId(null);
    setFormData(pustoyForm);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showPinCode, setShowPinCode] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [originalData, setOriginalData] = useState<{
    login: string;
    password: string;
    full_name: string;
    email: string;
    phone: string;
    file: File | null;
    pin_code: string;
    active: boolean;
    blocked: boolean;
  } | null>(null);

  const handleCreateUser = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const fd = new FormData();
      fd.append("login", formData.login);
      fd.append("password", formData.password);
      fd.append("full_name", formData.full_name);
      fd.append("email", formData.email);
      fd.append("phone_number", formData.phone);
      fd.append("pin_code", formData.pin_code);

      if (formData.file instanceof File) {
        fd.append("file", formData.file);
      }

      const response = await axios.post(`${API}/store/create`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data.data;

      const newUser: User = {
        id: data.id,
        login: data.login,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        pin_code: data.pin_code,
        wallet: data.wallet || 0,
        file: null,
        image: data.image || null,
        is_active: !!data.is_active,
        is_blocked: !!data.is_blocked,
      };

      setUsersData((prev) => [...prev, newUser]);
      toast.success("User muvaffaqiyatli qo'shildi!");
      setFormData(pustoyForm);
      closeModal();
    } catch (err) {
      console.error("Create user error:", err);
      toast.error("User qo'shishda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!originalData || !editUserId) return;

    const token = localStorage.getItem("access_token");
    const fd = new FormData();

    if (isChanged(formData.login, originalData.login))
      fd.append("login", formData.login);

    if (isChanged(formData.full_name, originalData.full_name))
      fd.append("full_name", formData.full_name);

    if (isChanged(formData.email, originalData.email))
      fd.append("email", formData.email);

    if (isChanged(formData.phone, originalData.phone))
      fd.append("phone_number", formData.phone);

    if (isChanged(formData.pin_code, originalData.pin_code))
      fd.append("pin_code", formData.pin_code);

    if (formData.password) fd.append("password", formData.password);

    if (formData.file instanceof File) fd.append("file", formData.file);

    fd.append("is_active", String(formData.active));

    fd.append("is_blocked", formData.blocked ? "aa" : "");

    if ([...fd.entries()].length === 0) {
      toast.error("Hech qanday ozgarish kiritilmadi");
      return;
    }
    const response = await axios.patch(`${API}/store/${editUserId}`, fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    const updatedUser = response.data.data;
    setUsersData((prev) =>
      prev.map((u) => (u.id === editUserId ? updatedUser : u))
    );

    toast.success("User yangilandi");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editUserId) {
      if (!FetchValidate()) return;
      handleUpdateUser();
    } else {
      if (!CreateValidate()) return;
      handleCreateUser();
    }

    setEditUserId(null);
    setFormData(pustoyForm);
    closeModal();
  };
  const countries = [{ code: "UZ", label: "+998" }];
  const handlePhoneNumberChange = (phoneNumber: string) => {
    setFormData({ ...formData, phone: phoneNumber });
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file: file });
    }
  };

  const [errors, setErrors] = useState<ErrorType>({});
  const [usersData, setUsersData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const closeModalMain = () => {
    closeModal();
    setErrors({});
  };
  const handleDeleteUser = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API}/store/${deleteUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User muvaffaqiyatli o'chirildi!");

      setUsersData((prev) => prev.filter((u) => u.id !== deleteUserId));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Userni o'chirishda xatolik yuz berdi");
    } finally {
      setDeleteUserId(null);
      closeDeleteModal();
      setIsLoading(false);
    }
  };

  const API = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await axios.get(`${API}/store`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(response.data.data)) {
          setUsersData(response.data.data);
        } else {
          setUsersData([response.data.data]);
        }
      } catch (err) {
        console.error("Fetch users error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [API]);

  const CreateValidate = () => {
    const newErrors: ErrorType = {};
    const isEdit = editUserId !== null;

    if (!isEdit || formData.password.trim().length > 0) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password =
          "Parol kamida 8 ta belgidan va Kuchli bo'lishi kerak. Masalan: Pass1!";
      }
    }

    if (!formData.full_name) {
      newErrors.full_name = "Ism Familiya Kiritilmadi!";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email formati noto'g'ri kiritildi";
    } else if (
      usersData.some((u) => u.email === formData.email && u.id !== editUserId)
    ) {
      newErrors.email = "Email allaqachon mavjud";
    }

    if (!formData.phone.startsWith("+998") || formData.phone.length !== 13) {
      newErrors.phone = "Telefon raqam noto'g'ri formatda kiritildi";
    } else if (!/^\+998(90|91|93|94|95|97|88|99)/.test(formData.phone)) {
      newErrors.phone = "Telefon raqam kodi noto'g'ri";
    } else if (usersData.some((u) => u.phone_number === formData.phone)) {
      newErrors.phone = "Telefon raqam allaqachon mavjud";
    }

    if (
      usersData.some((u) => u.login === formData.login && u.id !== editUserId)
    ) {
      newErrors.login = "Login allaqachon mavjud";
    }
    if (!formData.login) {
      newErrors.login = "Login kiritilmadi";
    }

    const pinCode = formData.pin_code?.toString() || "";
    if (!isEdit || pinCode.trim().length > 0) {
      const pinRegex = /^\d{4}$/;
      if (!pinRegex.test(pinCode)) {
        newErrors.pin_code = "Pin kod 4 ta raqamdan iborat bo'lishi kerak";
      }
    }

    if (formData.file) {
      const allowed = ["image/png", "image/jpeg", "image/webp"];
      if (!allowed.includes(formData.file.type)) {
        newErrors.image = "Noto'g'ri formatdagi rasm yuklandi";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isChanged = (a: any, b: any) => a !== b;

  const FetchValidate = () => {
    if (!originalData) return true;

    const newErrors: ErrorType = {};

    // LOGIN
    if (isChanged(formData.login, originalData.login)) {
      if (formData.login.length < 3) {
        newErrors.login = "Login kamida 3 ta belgidan iborat bo‘lishi kerak";
      }
      if (
        usersData.some((u) => u.login === formData.login && u.id !== editUserId)
      ) {
        newErrors.login = "Login allaqachon mavjud";
      }
    }

    // EMAIL
    if (isChanged(formData.email, originalData.email)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Email formati noto‘g‘ri";
      }
      if (
        usersData.some((u) => u.email === formData.email && u.id !== editUserId)
      ) {
        newErrors.email = "Email allaqachon mavjud";
      }
    }

    // PHONE
    if (isChanged(formData.phone, originalData.phone)) {
      const uzPhoneRegex = /^\+998(90|91|93|94|95|97|88|99)\d{7}$/;
      if (!uzPhoneRegex.test(formData.phone)) {
        newErrors.phone = "Telefon raqam noto'g'ri";
      }
      if (
        usersData.some(
          (u) => u.phone_number === formData.phone && u.id !== editUserId
        )
      ) {
        newErrors.phone = "Telefon raqam allaqachon mavjud";
      }
    }

    // PASSWORD (faqat yozilsa)
    if (formData.password) {
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.]).{8,}$/;
      if (!passRegex.test(formData.password)) {
        newErrors.password = "Parol kuchsiz";
      }
    }

    // PIN
    if (isChanged(formData.pin_code, originalData.pin_code)) {
      if (!/^\d{4}$/.test(formData.pin_code)) {
        newErrors.pin_code = "Pin code 4 ta raqam bo‘lishi kerak";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [editUserId, setEditUserId] = useState<number | null>(null);
  const handleEdit = (user: User) => {
    setEditUserId(user.id);
    setFormData({
      login: user.login,
      password: "",
      full_name: user.full_name,
      email: user.email,
      phone: user.phone_number,
      file: null,
      pin_code: user.pin_code,
      active: user.is_active,
      blocked: user.is_blocked,
    });

    setOriginalData({
      login: user.login,
      password: "",
      full_name: user.full_name,
      email: user.email,
      phone: user.phone_number,
      file: null,
      pin_code: user.pin_code,
      active: user.is_active,
      blocked: user.is_blocked,
    });
    openModal();
  };

  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const navigate = useNavigate();

  //   Search
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = usersData.filter((user) => {
    const search = searchTerm.toLowerCase();

    return (
      user.login.toLowerCase().includes(search) ||
      user.full_name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.phone_number.includes(search)
    );
  });
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="flex  flex-col gap-5">
      <div className="flex flex-col justify-center md:flex-row md:justify-between items-center">
        <h1 className="text-[20px] dark:text-white">
          Foydalanuvchilar {isLoading ? " " : usersData.length}
        </h1>
        <SearchInput
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
        <Button onClick={openModal} size="sm">
          Foydalanuvchi qo'shish
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          {isLoading ? (
            <Table>
              <TableBody>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </TableBody>
            </Table>
          ) : (
            <Table>
              {/* Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-theme-xs"
                  >
                    Ism Familiya
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-theme-xs"
                  >
                    Login
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-theme-xs"
                  >
                    Email
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-theme-xs"
                  >
                    Telefon Raqam
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-theme-xs"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-theme-xs"
                  >
                    Access
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-theme-xs"
                  >
                    Control
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* BODY */}
              <TableBody>
                {filteredUsers.length > 0 ? (
                  paginatedUsers.map((user: User) => (
                    <TableRow key={user.id}>
                      {/* Avatar + Fullname */}
                      <TableCell className="px-7 py-4 ">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.file instanceof File
                                ? URL.createObjectURL(user.file)
                                : user.image
                                ? user.image
                                : DefaultUserIcon
                            }
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) =>
                              (e.currentTarget.src = DefaultUserIcon)
                            }
                          />

                          <span className="text-sm text-gray-800 dark:text-white">
                            {user.full_name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Login */}
                      <TableCell className="text-gray-800 dark:text-white px-5 py-4 text-center">
                        {user.login}
                      </TableCell>

                      {/* Email */}
                      <TableCell className="text-gray-800 dark:text-white px-5 py-4 text-center">
                        {user.email}
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="text-gray-800 dark:text-white px-5 py-4 text-center">
                        {user.phone_number}
                      </TableCell>

                      {/* Active */}
                      <TableCell className="px-5 py-4 items-center">
                        <Badge color={user.is_active ? "success" : "error"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      {/* Blocked */}
                      <TableCell className="px-5 py-4 ">
                        <Badge color={user.is_blocked ? "error" : "success"}>
                          {user.is_blocked ? "Blocked" : "Open"}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="flex mt-4 px-5 ">
                        <Button size="sm" onClick={() => handleEdit(user)}>
                          <PencilIcon fontSize={18} />
                        </Button>
                        <Button
                          size="sm"
                          className="ml-2"
                          onClick={() => {
                            setDeleteUserId(user.id);
                            openDeleteModal();
                          }}
                        >
                          <TrashBinIcon fontSize={18} />
                        </Button>
                        <Button
                          size="sm"
                          className="ml-2"
                          onClick={() => {
                            navigate(`/user/${user.id}`);
                          }}
                        >
                          <Info className="text-white size-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="p-4 w-full flex justify-center items-center">
                    <TableCell className="text-center text-gray-500">
                      Userlar mavjud emas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          <Modal isOpen={isOpen} onClose={close} className="max-w-[700px] m-4">
            <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
              <form className="flex flex-col" autoComplete="off">
                <div className="custom-scrollbar h-[500px] overflow-y-auto px-2 pb-3">
                  <div className="mt-3">
                    <h5 className="mb-5 text-lg md:text-[25px] font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                      {editUserId ? "Userni tahrirlash" : "Yangi User qo'shish"}
                    </h5>
                    <div className="grid grid-cols-1  sm:grid-cols-2 gap-3 sm:space-y-2.5">
                      <div>
                        <Label htmlFor="userlogin">Login</Label>
                        <Input
                          type="text"
                          id="userlogin"
                          value={formData.login}
                          onChange={(e) =>
                            setFormData({ ...formData, login: e.target.value })
                          }
                        />
                        {errors.login && (
                          <p className="text-red-500 text-[12px] mt-1">
                            * {errors.login}
                          </p>
                        )}
                      </div>
                      <div className="w-full">
                        <Label>Parol</Label>
                        <div>
                          <div className="relative">
                            <Input
                              mask={!showPassword}
                              placeholder="Yangi Parol"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  password: e.target.value,
                                })
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                            >
                              {showPassword ? (
                                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                              ) : (
                                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-red-500 text-[12px] mt-1 items-center">
                              * {errors.password}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-full">
                        <Label htmlFor="full_name">Ism Familiya</Label>
                        <Input
                          value={formData.full_name}
                          type="text"
                          id="full_name"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              full_name: e.target.value,
                            })
                          }
                        />
                        {errors.full_name && (
                          <p className="text-red-500 text-[12px] mt-1">
                            * {errors.full_name}
                          </p>
                        )}
                      </div>
                      <div className="w-full">
                        <Label>Email</Label>
                        <div>
                          <div className="relative">
                            <Input
                              value={formData.email}
                              type="text"
                              className="pl-[62px]"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                            />
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                              <EnvelopeIcon className="size-6" />
                            </span>
                          </div>
                          {errors.email && (
                            <p className="text-red-500 text-[12px] mt-1">
                              * {errors.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <PhoneInput
                          selectPosition="start"
                          countries={countries}
                          value={formData.phone ? formData.phone : "+998"}
                          onChange={handlePhoneNumberChange}
                        />
                        <p className="dark:text-gray-400 text-gray-600 text-[13px] flex gap-2 items-center">
                          <InfoIcon className="text-[25px]" /> Telefon Raqam
                          Kodlari togri kiritilishi kerak (masalan: 97, 93, 94)
                        </p>
                        {errors.phone && (
                          <p className="text-red-500 text-[12px] mt-1">
                            * {errors.phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Profile Rasm</Label>
                        <FileInput
                          onChange={handleFileChange}
                          className="custom-class"
                        />
                        {errors.image && (
                          <p className="text-red-500 text-[12px] mt-1">
                            * {errors.image}
                          </p>
                        )}
                      </div>

                      <div className="w-full">
                        <Label>Pin-Code</Label>
                        <div>
                          <div className="relative">
                            <Input
                              value={formData.pin_code}
                              mask={!showPinCode}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  pin_code: e.target.value,
                                })
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setShowPinCode(!showPinCode)}
                              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                            >
                              {showPinCode ? (
                                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                              ) : (
                                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                              )}
                            </button>
                          </div>
                          {errors.pin_code && (
                            <p className="text-red-500 text-[12px] mt-1">
                              * {errors.pin_code}
                            </p>
                          )}
                        </div>
                      </div>
                      {editUserId && (
                        <div className="flex items-center gap-2 sm:border-2 sm:rounded-lg sm:p-2 w-full dark:border-gray-700">
                          <h1 className="dark:text-[#8e878c] text-[16px]">
                            Blocked
                          </h1>
                          <Switch
                            checked={formData.blocked}
                            label={formData.blocked ? "ON" : "OFF"}
                            onChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                blocked: checked,
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <Button size="sm" variant="outline" onClick={closeModalMain}>
                    Yopish
                  </Button>

                  <Button size="sm" onClick={handleSave}>
                    Saqlash
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
          <Modal
            isOpen={isDeleteOpen}
            onClose={closeDeleteModal}
            className="max-w-[450px]"
          >
            <div className="p-5 flex flex-col">
              <div className="text-[22px] font-medium dark:text-white">
                Ishonchingiz komilimi ?
              </div>
              <div className="mt-5">
                <p className="dark:text-white/70 text-sm text-black/70">
                  Buyruqni Tadiqlaysizmi? Siz rostdan ham{" "}
                  <span className="text-black dark:text-white bg-red-500/20 text-[16px]">
                    {
                      usersData.find((user) => user.id === deleteUserId)
                        ?.full_name
                    }{" "}
                  </span>
                  ni o'chirmoqchimisiz? tasdiqlangan buyruqni ortga qaytarib
                  bo'lmaydi!
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button size="sm" variant="outline" onClick={closeDeleteModal}>
                  Bekor qilish
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!deleteUserId) return;
                    handleDeleteUser();

                    closeDeleteModal();
                  }}
                >
                  Tasdiqlash
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
      {/* PAGINATION */}
      {filteredUsers.length > 10 && (
        <div className="flex justify-end p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      className="cursor-pointer"
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
