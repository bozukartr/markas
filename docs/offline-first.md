# İnternet kesildiğinde satış nasıl devam eder?

```text
Tarayıcı (aynı bilgisayardan sunulan React arayüzü)
       │ localhost /api/sales
Mağaza API → SQLite [Ürünler + Satışlar / kalıcı outbox]
                              │ SyncWorker / HTTPS
                              ▼
                   Bulut API → bulut veritabanı
```

Tarayıcı SQLite dosyasına doğrudan erişmez. Mağazadaki .NET servisi hem arayüzü sunar hem yerel veritabanını yönetir. İnternet erişimi sadece senkronizasyon için gerekir. Her mağazada tek bir yerel API çalıştırılması varsayılır.

## 1. Satışı ve stok değişimini birlikte kaydet

`SalesController` içindeki gerçek akışın özeti:

```csharp
await using var tx = await db.Database.BeginTransactionAsync();
// Aynı mağaza + satış kimliği mevcutsa önceki sonuç dönülür.
// Ürün ve stok doğrulandıktan sonra:
product.Stock -= request.Quantity;
product.Version = Guid.NewGuid();
db.Sales.Add(sale); // Synced = false: aynı kayıt aynı zamanda outbox öğesidir.
await db.SaveChangesAsync();
await tx.CommitAsync();
```

Kayıt işlemi başarısızsa stok düşümü ve satış birlikte geri alınır. Ciro, sunucuda ürünün kayıtlı fiyatından hesaplanır; istemci fiyat belirleyemez. Satış kaydında fiyat anlık görüntüsü saklandığından sonraki fiyat değişiklikleri geçmiş ciroyu değiştirmez. SQLite WAL etkinleştirilmiştir. Ürünlerde uygulama tarafından üretilen concurrency token, eşzamanlı düzenlemelerde kayıp güncellemeyi engeller; istemci 409 aldığında yeni kaydı okuyup tekrar karar verir.

## 2. Kalıcı outbox'ı gönder

```csharp
var pending = await db.Sales.Where(s => !s.Synced)
    .OrderBy(s => s.CreatedAt).Take(50).ToListAsync(stop);
// Her satış ayrı istek: başarılı olanlar tek tek onaylanır.
response.EnsureSuccessStatusCode();
sale.Synced = true;
await db.SaveChangesAsync(stop);
```

HTTP başarısızsa `Synced` değişmez. İşçi yeniden başlasa da kuyruk SQLite içinde kalır. Ağ çağrısı boyunca SQLite transaction açık tutulmaz. Zaman aşımı 10 saniyedir; yeniden deneme en fazla 60 saniyeye kadar artar. Başarısız ilk kayıt sıralamayı korumak için sonraki kayıtları bekletir; hatalı anahtar veya kalıcı 409 durumunu loglardan düzeltmek gerekir. Üretimde dead-letter kuyruğu, son hata alanı ve yeniden işleme ekranı eklenmelidir.

## 3. Bulutta mükerrer kabulü önle

`StoreDb` satış için bileşik anahtar tanımlar:

```csharp
b.Entity<Sale>().HasKey(s => new { s.StoreId, s.Id });
```

Bulut önce bu kimliği arar. Aynı içerik daha önce geldiyse 200 döndürür; farklı içerikle aynı kimlik 409 alır. Ağ cevabı kaybolduğunda mağaza aynı kimliği tekrar gönderir. Bulutta yeni bir satış oluşmaz. İki istek yarışırsa benzersiz anahtar ikinci kaydı reddeder; sonraki deneme mevcut kaydı görür.

Bu, **en az bir kez teslim + idempotent alıcı** yaklaşımıdır; ağda tam bir kez teslim garantisi iddiası değildir. Bulut yalnızca satış defterini tutar; yerel stok daha önce düştüğü için bulut kabulü yerel stoğu ikinci kez düşürmez.

## 4. Fiyat ve stok çatışmaları

Bu MVP'de yerel katalog yetkilidir. Ürün PUT ve DELETE çağrıları son okunan `version` değerini taşır. Eşzamanlı satış veya başka bir fiyat düzenlemesi bu sürümü değiştirir; eski düzenleme 409 alır. Kullanıcı tabloyu yenileyip işlemi tekrar uygular. Stok için son yazan kazanır yaklaşımı kullanılmaz.

Gelecekte merkezi katalog: bulut ürün sürümleri + değişiklik imleci ile pull; stok için mutlak sayı üzerine yazmak yerine benzersiz kimlikli hareket defteri; silme için tombstone; mağaza/cihaz bazlı izinler gerekir. Bu özellikler mevcut örnekte uygulanmış değildir.

## Bilinen sınırlar

- Günlük özet İstanbul gün sınırı (UTC+3) kullanır; mağaza bazlı saat dilimi ayarı yoktur.
- Satış penceresindeki kimlik ağ hatasında aynı pencereden tekrar denendiğinde korunur. Pencereyi kapatıp yeniden açmak yeni işlem üretir; yanıt belirsizse önce son satışları kontrol edin. Üretimde istemci işlem kimliğini disk üzerinde tutarak yenileme/çökme sonrası da koruyun.
- `EnsureCreated` ilk kurulum içindir; veri modeli değiştirirken mevcut veriyi silmek yerine EF migrations ekleyin.
- Tek mağazalı bulut örneği aynı SQLite teknolojisini kullanır; çok kiracılı SaaS için merkezi veritabanı ve kimlik izolasyonu ayrıca tasarlanmalıdır.
- Her mağaza SQLite dosyasını düzenli, tutarlı snapshot ile yedeklemelidir; açık WAL dosyasını tek başına kopyalamak güvenilir yedek değildir.

Kaynaklar: [EF Core transaction](https://learn.microsoft.com/en-us/ef/core/saving/transactions), [EF Core concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency), [Tailwind Vite kurulumu](https://tailwindcss.com/docs/installation/using-vite).
