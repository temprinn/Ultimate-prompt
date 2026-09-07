import axios from "axios";
import { FirebaseError } from "firebase/app";

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const apiMessage = (
      error.response?.data as { error?: { message?: string } } | undefined
    )?.error?.message;
    return apiMessage ?? error.message ?? fallback;
  }

  if (error instanceof FirebaseError) {
    if (error.code === "auth/popup-closed-by-user") {
      return "ปิดหน้าต่าง login ก่อนสำเร็จ";
    }
    if (error.code === "auth/popup-blocked") {
      return "เบราว์เซอร์บล็อก popup — อนุญาต popup สำหรับ localhost";
    }
    if (error.code === "auth/operation-not-allowed") {
      return "Provider นี้ยังไม่ถูกเปิดใน Firebase Authentication";
    }
    if (error.code === "auth/unauthorized-domain") {
      return "โดเมนนี้ยังไม่อยู่ใน Authorized domains ของ Firebase";
    }
    if (error.code === "auth/account-exists-with-different-credential") {
      return "อีเมลนี้เคยล็อกอินด้วยวิธีอื่นแล้ว";
    }
    return `${error.message} (${error.code})`;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
