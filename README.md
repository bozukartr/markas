# markas

React + Tailwind CSS arayüzü, ASP.NET Core 10 Controller API ve SQLite ile tek mağazalık, geliştirilmeye hazır market MVP'si.

## Başlatma

Gereksinimler: Node.js 22.12+ (veya 24 LTS), .NET 10 SDK.

```sh
cd frontend
npm ci
npm run build
cd ../backend
dotnet run
```

http://127.0.0.1:5080 adresini açın. Derlenen arayüz API'nin `wwwroot` klasöründen sunulur; internet gerekmez. İlk çalıştırmada sekiz örnek ürün eklenir, ciro sıfırdan başlar. Veritabanı `backend/store.db` dosyasındadır. Silmeyin; satışları ve bekleyen aktarım kuyruğunu içerir.

Geliştirme sırasında iki terminalde `dotnet run --project backend` ve `cd frontend && npm run dev` çalıştırın. Vite, `/api` isteklerini yerel API'ye yönlendirir. Ciro, stok ve son satışlar API'den dört saniyede bir yenilenir. Aktif kasa, tek yerel hizmetin erişilebilirliğidir; çoklu terminal keşfi değildir.

## Sade dosya yapısı

```text
frontend/
  src/main.jsx                # Dashboard, ürün formu, tablo ve satış penceresi
  src/style.css               # Tailwind + responsive tasarım
  public/favicon.svg
  vite.config.js              # API proxy; çıktı backend/wwwroot
backend/
  Controllers/
    ProductsController.cs     # Listele, getir, ekle, güncelle, sil
    SalesController.cs        # Atomik satış, stok düşümü ve günlük özet
    SyncController.cs         # Bulutta idempotent satış kabulü
  Models.cs                   # Ürün ve satış sözleşmeleri
  StoreDb.cs                  # SQLite modeli ve benzersiz anahtarlar
  SyncWorker.cs               # Kalıcı kuyruk ve artan beklemeli yeniden deneme
  Program.cs                  # DI, başlangıç verisi ve statik arayüz
docs/offline-first.md          # Tasarım, kod örnekleri ve sınırlar
scripts/smoke.ps1              # Gerçek API + SQLite entegrasyon kontrolü
```

## API

| Yöntem | Yol | İşlem |
|---|---|---|
| GET | /api/products | Aktif ürünler |
| GET | /api/products/{id} | Ürün detayı |
| POST | /api/products | Ürün ekle |
| PUT | /api/products/{id} | Ürün güncelle (`version` gerekli) |
| DELETE | /api/products/{id}?version=... | Mantıksal silme |
| POST | /api/sales | Satış kaydet (`id`, `productId`, `quantity`) |
| GET | /api/sales/summary | Günlük ciro, son satışlar, kuyruk |
| POST | /api/sync | Bulut modunda satış kabulü (`X-Sync-Key`) |

Para tamsayı kuruş olarak saklanır: `priceCents: 4250` = 42,50 ₺. Ürün değişikliklerinde `version` GUID'si eskiyse API 409 döndürür. Barkod benzersizdir; silinen ürünün barkodu da ayrılmış kalır. MVP'de satış bir ürün satırıdır; ödeme altyapısı, sepet, iade ve mali fiş entegrasyonu bulunmaz.

## İki API ile bulut senkronizasyonu

Bulut örneğini **ayrı terminalde ve ayrı SQLite dosyasıyla** başlatın (PowerShell):

```powershell
$env:Mode='Cloud'
$env:StoreId='demo-store'
$env:Cloud__ApiKey='yerel-deneme-icin-ayni-uzun-anahtar'
$env:ConnectionStrings__Store='Data Source=cloud.db'
$env:Urls='http://127.0.0.1:5090'
dotnet run --project backend
```

Mağaza örneği, ayrı terminal:

```powershell
$env:Mode='Store'
$env:StoreId='demo-store'
$env:Cloud__Url='http://127.0.0.1:5090'
$env:Cloud__ApiKey='yerel-deneme-icin-ayni-uzun-anahtar'
$env:ConnectionStrings__Store='Data Source=store.db'
$env:Urls='http://127.0.0.1:5080'
dotnet run --project backend
```

Bulut örneğini kapatın, yerel arayüzden satış yapın; stok ve ciro hemen değişir, bekleyen satış sayısı artar. Bulutu açınca kuyruk kendiliğinden boşalır. Normal başarılı döngü 2 saniye; hatalı gönderim aralığı 4–60 saniye artar. Kimlik doğrulama veya veri çakışması hataları da kuyrukta kalır; logları kontrol edin.

## Doğrulama

```powershell
pwsh -File scripts/smoke.ps1
```

Test geçici, birbirinden ayrı SQLite dosyaları ve 5180/5190 portlarını kullanır. CRUD, veri doğrulama, eski sürüm çakışması, yetersiz stok, tekrar satış, yerel hizmet yeniden başladıktan sonra kuyruk, buluta aktarım ve tekrar kabulünü kontrol eder. `-DotnetPath` ile SDK yürütülebilir dosyası belirtilebilir.

## MVP sınırları

Bu bir üretim SaaS dağıtımı değildir: tek mağaza/tek yerel API kapsamındadır. API varsayılan olarak yalnızca loopback dinler. Dış ağa açmadan önce kullanıcı oturumu, rol/tenant izolasyonu, mağazaya özel cihaz kimlikleri, HTTPS, denetim kayıtları ve yedekleme ekleyin. Bulut denemesinde paylaşılan anahtar çevre değişkenindedir; depoya anahtar koymayın. Mağaza dışı senkronizasyon anahtarı 403 alır.

SQLite yerel API sürecinde çalışır; tarayıcı belleği veya localStorage satış veritabanı değildir. API/bilgisayar kapanırsa yeni satış yapılamaz; kalıcı kayıtlar yeniden açılınca korunur. İnternet kesildiğinde hem arayüz hem API mağaza bilgisayarından sunulduğu için çalışmaya devam eder. Kart ödeme terminalinin çevrimdışı davranışı bu uygulamanın kapsamı dışındadır.

Ürün kataloğu/fiyat değişiklikleri buluta gönderilmez; örnek senkronizasyon, kesinleşmiş satışların tek yönlü aktarımıdır. Çoklu cihaz stok birleştirmesi ve çift yönlü katalog senkronizasyonu ayrı bir geliştirmedir. Ayrıntı ve kod: [Offline-first](docs/offline-first.md).
