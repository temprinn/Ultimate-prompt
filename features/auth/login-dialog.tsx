"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useAuthDialog } from "./auth-dialog-provider";

export function LoginDialog() {
  const router = useRouter();
  const { loginOpen, setLoginOpen } = useAuthDialog();

  function handleLogin() {
    setLoginOpen(false);
    router.push("/login");
  }

  return (
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>กรุณาเข้าสู่ระบบ</DialogTitle>
          <DialogDescription>
            ต้องเข้าสู่ระบบก่อนจึงจะคัดลอกพรอมต์ บันทึกรายการโปรด หรือสร้างพรอมต์ได้
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setLoginOpen(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleLogin}>ไปหน้าเข้าสู่ระบบ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
