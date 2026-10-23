# سیستم مدیریت باشگاه ورزشی (Gym Management System)

یک سیستم کامل مدیریت باشگاه با Node.js + Express + SQLite (بک‌اند) و HTML/CSS/JS (فرانت‌اند)، آماده برای تبدیل به اپلیکیشن دسکتاپ با Electron.

## ✨ ویژگی‌ها
- ثبت و مدیریت اعضا (ثبت نام، ویرایش، حذف، جستجو)
- ثبت پرداخت حق عضویت با تاریخ و روش پرداخت
- مدیریت پروتین و مکمل‌ها (قیمت خرید/فروش، موجودی، هشدار کمبود موجودی)
- ثبت فروشات به اعضا یا مشتریان غیرعضو (موجودی به‌صورت خودکار کم می‌شود)
- ثبت مصارف (برق، اجاره، معاش و ...) به تفکیک دسته
- ثبت عواید متفرقه
- داشبورد زیبا با آمار لحظه‌ای (اعضای فعال، عاید و مصرف ماه، سود خالص، هشدار موجودی)
- راپورهای مالی ماهانه و راپور اعضا (قابل چاپ)
- تنظیمات باشگاه (نام، شماره تماس، واحد پول)
- طراحی کاملاً راست‌به‌چپ (RTL) به زبان فارسی/دری

## 🚀 نصب و اجرا

```bash
cd gym-management
npm install
npm start
```

سپس در مرورگر به آدرس زیر بروید:

```
http://localhost:4000
```

پایگاه داده به‌صورت خودکار در مسیر `db/gym.db` ساخته می‌شود.

## 🖥️ آماده برای Electron

این پروژه با معماری ساده (Express API + فایل‌های استاتیک HTML/CSS/JS) نوشته شده تا به‌راحتی بتوانید آن را به یک اپلیکیشن دسکتاپ با Electron تبدیل کنید:

1. یک پروژه Electron جدید بسازید.
2. در فایل اصلی Electron (`main.js`)، سرور Express این پروژه (`server.js`) را به‌صورت داخلی اجرا کنید (require کنید) یا آن را با `child_process` اجرا کنید.
3. یک `BrowserWindow` باز کنید که آدرس `http://localhost:4000` را لود کند.
4. پایگاه داده با `sql.js` (نسخه WebAssembly خالص SQLite، بدون نیاز به کامپایل native) ساخته شده، پس نیازی به `electron-rebuild`، Python، یا Visual Studio Build Tools نیست — همین که `npm install` کار کند، در Electron هم بدون تغییر کار می‌کند:

```bash
npm install --save-dev electron electron-builder
```

## 📁 ساختار پروژه

```
gym-management/
├── server.js              # سرور اصلی Express
├── db/
│   └── database.js        # ساختار و اتصال دیتابیس SQLite
├── routes/                 # API endpoint ها
│   ├── members.js
│   ├── products.js
│   ├── sales.js
│   ├── payments.js
│   ├── expenses.js
│   ├── income.js
│   ├── dashboard.js
│   └── reports.js
└── public/                 # فرانت‌اند (HTML/CSS/JS)
    ├── index.html
    ├── css/style.css
    └── js/
        ├── api.js
        └── app.js
```

## 🔌 API Endpoints خلاصه

| بخش | Endpoint |
|---|---|
| اعضا | `GET/POST /api/members`, `GET/PUT/DELETE /api/members/:id` |
| پرداخت‌ها | `GET/POST /api/payments`, `DELETE /api/payments/:id` |
| محصولات | `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id`, `GET /api/products/low-stock` |
| فروشات | `GET/POST /api/sales`, `DELETE /api/sales/:id` |
| مصارف | `GET/POST /api/expenses`, `PUT/DELETE /api/expenses/:id` |
| عواید متفرقه | `GET/POST /api/income`, `DELETE /api/income/:id` |
| داشبورد | `GET /api/dashboard/summary` |
| راپورها | `GET /api/reports/monthly`, `GET /api/reports/financial`, `GET /api/reports/members` |
| تنظیمات | `GET/POST /api/settings` |

## 📝 نکته

اگر خواستید واحد پول یا نام باشگاه را تغییر دهید، از بخش «تنظیمات» در منوی سایدبار استفاده کنید.
