# تحليل ملفات المشروع - أهمية كل ملف

## ✅ ملفات أساسية ومهمة جداً (لا تحذف)

### ملفات النظام الأساسية
- `server.js` - **مهم جداً** - ملف الخادم الرئيسي
- `package.json` - **مهم جداً** - إعدادات المشروع والحزم
- `package-lock.json` - **مهم** - قفل إصدارات الحزم
- `.env` - **مهم جداً** - متغيرات البيئة (كلمة مرور قاعدة البيانات)

### ملفات قاعدة البيانات
- `connectors/db.js` - **مهم جداً** - اتصال قاعدة البيانات
- `connectors/scripts.sql` - **مهم جداً** - إنشاء الجداول
- `connectors/seed.sql` - **مهم** - بيانات تجريبية (اختياري)

### ملفات Middleware
- `middleware/auth.js` - **مهم جداً** - التحقق من المصادقة

### ملفات Routes (API)
- `routes/private/api.js` - **مهم جداً** - جميع الـ 20 endpoints
- `routes/private/view.js` - **مهم جداً** - صفحات Truck Owner و Customer
- `routes/public/api.js` - **مهم جداً** - تسجيل الدخول والتسجيل
- `routes/public/view.js` - **مهم جداً** - صفحات تسجيل الدخول والتسجيل

### ملفات Utils
- `utils/session.js` - **مهم جداً** - إدارة الجلسات

### ملفات Views (صفحات HTML)
- `views/login.hjs` - **مهم جداً** - صفحة تسجيل الدخول
- `views/register.hjs` - **مهم جداً** - صفحة التسجيل
- `views/customerHomepage.hjs` - **مهم جداً** - الصفحة الرئيسية للعميل
- ~~`views/truckOwnerHomePage.hjs`~~ - **تم الحذف** - كان يعيد التوجيه إلى ownerDashboard (غير مستخدم)
- `views/trucks.hjs` - **مهم جداً** - صفحة عرض الشاحنات
- `views/truckMenu.hjs` - **مهم جداً** - صفحة قائمة الشاحنة
- `views/cart.hjs` - **مهم جداً** - صفحة السلة
- `views/myOrders.hjs` - **مهم جداً** - صفحة طلباتي
- `views/ownerDashboard.hjs` - **مهم جداً** - لوحة تحكم صاحب الشاحنة
- `views/menuItems.hjs` - **مهم جداً** - صفحة عناصر القائمة
- `views/addMenuItem.hjs` - **مهم جداً** - صفحة إضافة عنصر قائمة
- `views/truckOrders.hjs` - **مهم جداً** - صفحة طلبات الشاحنة

### ملفات JavaScript (Frontend)
- `public/src/login.js` - **مهم جداً** - منطق تسجيل الدخول
- `public/src/register.js` - **مهم جداً** - منطق التسجيل
- `public/src/trucks.js` - **مهم جداً** - منطق عرض الشاحنات
- `public/src/truckMenu.js` - **مهم جداً** - منطق قائمة الشاحنة
- `public/src/cart.js` - **مهم جداً** - منطق السلة
- `public/src/myOrders.js` - **مهم جداً** - منطق طلباتي
- `public/src/ownerDashboard.js` - **مهم جداً** - منطق لوحة التحكم
- `public/src/menuItems.js` - **مهم جداً** - منطق عناصر القائمة
- `public/src/addMenuItem.js` - **مهم جداً** - منطق إضافة عنصر
- `public/src/truckOrders.js` - **مهم جداً** - منطق طلبات الشاحنة

### ملفات CSS و JavaScript Libraries
- `public/js/jquery-2.2.0.min.js` - **مهم جداً** - مكتبة jQuery
- `public/js/bootstrap.min.js` - **مهم جداً** - مكتبة Bootstrap
- `public/styles/bootstrap.min.css` - **مهم جداً** - Bootstrap CSS
- `public/styles/style.css` - **مهم جداً** - ملف التنسيقات الرئيسي
- `public/styles/style.less` - **اختياري** - ملف Less (مصدر CSS)

### ملفات أخرى
- `public/images/404.jpg` - **اختياري** - صورة خطأ 404
- `checkReadMeImportant.txt` - **مهم** - تعليمات الإعداد

## ❓ ملفات غير موجودة في المشروع
- `employee.js` - **غير موجود** - لا يوجد ملف بهذا الاسم في المشروع الحالي

## 📝 ملاحظات مهمة
1. جميع ملفات `views/` و `public/src/` مرتبطة ببعضها البعض ومستخدمة في المشروع
2. ~~ملف `truckOwnerHomePage.hjs`~~ - تم حذفه (غير مستخدم، يوجد `ownerDashboard.hjs` بدلاً منه)
3. ملف `style.less` اختياري إذا كان `style.css` موجود ومحدث

## 🔍 توصيات
- **لا تحذف أي ملف** من القائمة أعلاه لأنها جميعها مستخدمة في المشروع
- إذا كان هناك ملف `employee.js` في مكان آخر، فهو **غير مرتبط** بمشروع Food Truck هذا

