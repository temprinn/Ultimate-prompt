# Bruno API Collection — Ultimate Prompts

เปิดโฟลเดอร์นี้ใน Bruno: `bruno/ultimate-prompts`

## ก่อนยิง

1. รัน MySQL: `docker compose up -d`
2. Seed demo (ถ้ายังไม่มีข้อมูล):  
   `docker compose exec -T mysql mysql -uapp -papp ultimate_prompts < docker/mysql/init/03-seed-demo.sql`
3. รัน Next.js: `npm run dev` (โปรเจกต์นี้อยู่ที่พอร์ต **3002** ถ้า 3000 ถูกใช้แล้ว)  
4. ใน Bruno เลือก environment **Local** (`baseUrl = http://localhost:3002`)

## ลำดับแนะนำ

1. `01-Health` → Health Check  
2. `02-Auth` → Dev Login Free / Admin (จะเซ็ต token ให้อัตโนมัติ)  
3. `04-Prompts` → List / Get / Copy / Favorite  
4. `05-Favorites` → List Favorites  

## Auth

ใช้ header: `Authorization: Bearer {{freeToken|adminToken}}`  
ได้จาก `POST /api/auth/dev-login` ด้วย body `{ "role": "free" }` หรือ `{ "role": "admin" }`

ระบบเป็นฟรีทั้งหมด ไม่มีเกต Pro
