# 🎮 PlayStation Game Catalog

کاتالوگ ریسپانسیو بازی‌های PS4 و PS5 با رابط فارسی و نام بازی‌ها به انگلیسی.

## امکانات فعلی
- رابط RTL فارسی
- Responsive برای موبایل، تبلت و دسکتاپ
- جستجو
- فیلتر PS4 / PS5
- فیلتر ژانر
- مرتب‌سازی
- صفحه جزئیات بازی
- لینک PlayStation Store
- ساختار JSON برای داده‌ها
- GitHub Pages
- GitHub Actions برای اجرای بروزرسانی دوره‌ای

## راه‌اندازی
1. این پوشه را داخل یک Repository قرار بده.
2. Branch اصلی را `main` بگذار.
3. از Settings → Pages، گزینه GitHub Actions را فعال کن.
4. در `assets/app.js` مقدار `YOUR-USERNAME/YOUR-REPOSITORY` را با Repository خودت عوض کن.
5. Workflow با نام `Deploy to GitHub Pages` سایت را منتشر می‌کند.
6. Workflow با نام `Update PlayStation Catalog` هر روز اجرا می‌شود.

## نکته مهم درباره اطلاعات واقعی
PlayStation Store منبع اول پروژه است. اسکریپت اولیه عمداً حجم بازی را حدس نمی‌زند و discovery خودکار بازی‌های جدید را تا زمان تعیین یک روش مجاز و پایدار برای discovery فعال نمی‌کند. این بخش در مرحله بعد تکمیل می‌شود تا کاتالوگ واقعاً بازی‌های جدید را خودکار پیدا کند.
