#!/bin/bash

echo "---- بدء الإصلاح التلقائي لمشاكل Vercel وNext.js ----"

# التأكد من وجود package.json
if [ ! -f package.json ]; then
  echo "لم يتم العثور على package.json، سيتم إنشاؤه..."
  npm init -y
fi

# تثبيت next و react و react-dom
echo "تثبيت next و react و react-dom..."
npm install next react react-dom

# التحقق من وجود ملفات Next.js الأساسية
if [ ! -f pages/index.js ]; then
  echo "إنشاء مجلد وصفحة رئيسية افتراضية لـ Next.js..."
  mkdir -p pages
  cat > pages/index.js <<EOF
export default function Home() {
  return <h1>Shefaa Clinic App - Next.js Default Page</h1>;
}
EOF
fi

# التحقق من وجود ملف start script في package.json
if ! grep -q '"start":' package.json; then
  echo "إضافة أمر التشغيل (start) في package.json..."
  npx npm-add-script -k "start" -v "next start"
fi

# التأكد من وجود ملف .gitignore وتجاهل مجلد node_modules
if [ ! -f .gitignore ]; then
  echo "إنشاء ملف .gitignore..."
  echo "node_modules/" > .gitignore
elif ! grep -q "node_modules/" .gitignore; then
  echo "إضافة node_modules/ إلى .gitignore..."
  echo "node_modules/" >> .gitignore
fi

echo "---- تم الإصلاح بنجاح! ----"
echo "الخطوة التالية: قم بتنفيذ الأوامر التالية لدفع التغييرات إلى GitHub:"
echo "git add ."
echo "git commit -m 'إصلاح تلقائي لمشاكل Vercel و Next.js'"
echo "git push"