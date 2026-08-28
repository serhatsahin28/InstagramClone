# Deployment Rehberi

Backend **Render**'da, frontend **Vercel**'de çalışır. İkisi farklı alan adında olduğu
için oturum çerezi siteler arası gönderilir; bu yüzden aşağıdaki ortam değişkenleri
eksiksiz girilmelidir.

---

## 0. Önce: MongoDB Atlas

1. **Şifreyi değiştir.** Eski şifre bir süre GitHub'da açıkta kaldı, sızmış kabul edilmeli.
   Atlas → *Database Access* → kullanıcıyı düzenle → *Edit Password* → yeni şifre üret.
2. **Render'ın erişimine izin ver.** Atlas → *Network Access* → *Add IP Address* →
   `0.0.0.0/0` (Render sabit IP vermez).
3. Yeni bağlantı dizesini not al:
   `mongodb+srv://<kullanici>:<yeni-sifre>@<cluster>.mongodb.net/instagram`

---

## 1. Backend (Render)

**New → Web Service** → GitHub reposunu seç (`InstagramClone`), dal: `react-rewrite`.

| Ayar | Değer |
|---|---|
| Root Directory | *(boş bırak)* |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node app.js` |
| Health Check Path | `/health` |

**Environment değişkenleri:**

| Anahtar | Değer |
|---|---|
| `MONGODB_URI` | Atlas bağlantı dizesi (yeni şifreyle) |
| `SESSION_SECRET` | Uzun, rastgele bir metin |
| `NODE_ENV` | `production` |
| `CLIENT_ORIGIN` | Vercel adresi — *2. adımdan sonra gir* |

Deploy sonrası adresi not al: `https://<servis-adi>.onrender.com`

> `render.yaml` repoda mevcut; istersen Render'ın *Blueprint* seçeneğiyle de kurabilirsin.

---

## 2. Frontend (Vercel)

**Add New → Project** → aynı repo, dal: `react-rewrite`.

| Ayar | Değer |
|---|---|
| Framework Preset | Vite |
| **Root Directory** | `client` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**Environment değişkeni:**

| Anahtar | Değer |
|---|---|
| `VITE_API_BASE` | `https://<servis-adi>.onrender.com` |

Deploy sonrası adresi not al: `https://<proje>.vercel.app`

---

## 3. İki adresi birbirine bağla

1. Render'a dön → `CLIENT_ORIGIN` = Vercel adresin (sonda `/` olmadan).
2. Render servisini yeniden deploy et.
3. Vercel'de `VITE_API_BASE` doğru mu kontrol et; değiştirdiysen **yeniden deploy gerekir**
   (Vite değişkenleri build sırasında gömülür).

---

## 4. Doğrulama

```bash
curl https://<servis-adi>.onrender.com/health
```

`{"ok":true}` dönmeli. Ardından Vercel adresinde giriş yapmayı dene.

**Giriş olmuyorsa** genelde sebebi şudur:
- `CLIENT_ORIGIN` Vercel adresiyle birebir aynı değil (http/https, sondaki `/`)
- `NODE_ENV=production` girilmemiş → çerez `secure`/`sameSite=none` olmaz, tarayıcı reddeder

---

---

## 5. Görsel depolama (Cloudinary)

Render'ın diski geçicidir; bu adım yapılmazsa **yüklenen fotoğraflar servis yeniden
başlayınca silinir**. Repodaki mevcut görseller etkilenmez.

1. **https://cloudinary.com** → ücretsiz hesap açın
2. Dashboard'da **API Environment variable** satırını bulun. Şuna benzer:
   `CLOUDINARY_URL=cloudinary://123456789:abcdefgh@my-cloud`
3. Render → servisiniz → **Environment** → yeni değişken:

   | Key | Value |
   |---|---|
   | `CLOUDINARY_URL` | `cloudinary://...` (baştaki `CLOUDINARY_URL=` kısmı olmadan) |

4. **Save, rebuild, and deploy**

Loglarda `Gorseller Cloudinary'ye yuklenecek (klasor: instagram-clone)` yazarsa aktif demektir.

### Aynı hesapta başka proje varsa

Yüklemeler `instagram-clone/posts` ve `instagram-clone/users_profile` klasörlerine
gider; diğer projelerinizin dosyalarıyla karışmaz. Klasör adını değiştirmek isterseniz
isteğe bağlı bir değişken daha ekleyin:

| Key | Value |
|---|---|
| `CLOUDINARY_FOLDER` | `istediginiz-klasor-adi` |
Değişken tanımlı değilse uygulama eskisi gibi yerel diske yazmaya devam eder,
yani yerel geliştirmede Cloudinary hesabına ihtiyaç yoktur.

> Eski görseller dosya adıyla, yeni yüklenenler tam URL olarak saklanır; arayüz
> ikisini de destekler, geçmiş veriler bozulmaz.

---

## Bilinen sınırlamalar

- **Ücretsiz Render planı uyur.** 15 dakika hareketsizlikten sonra servis durur; ilk istek
  ~30 saniye sürebilir. Oturumlar MongoDB'de saklandığı için uyanınca kaybolmaz.
