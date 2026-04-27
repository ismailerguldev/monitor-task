# 📑 TASK MONITOR SAAS - TEKNİK RAPOR VE MİMARİ ANALİZ

Bu doküman, "Ölçeklenebilir Görev ve Analiz Platformu" (Task Monitor) projesinin geliştirilme sürecinde alınan mimari kararları, teknoloji seçimlerini, karşılaşılan zorlukları ve geleceğe dönük ölçekleme vizyonunu detaylandırmaktadır.

## 1. MİMARİ TASARIM YAKLAŞIMI

Sistem, İstemci-Sunucu (Client-Server) mimarisi üzerine, tam bağımsız (decoupled) bir yapıda inşa edilmiştir.

* Backend (Express.js): RESTful prensiplerine sadık, Katmanlı Mimari (Layered Architecture) kullanılarak geliştirilmiştir. Yönlendirme (Routes), İş Mantığı (Services) ve Veri Erişimi (Repositories) kesin çizgilerle ayrılmıştır. Bu "Separation of Concerns" (Sorumlulukların Ayrılması) prensibi, kodun test edilebilirliğini ve modülerliğini maksimize etmiştir.

* Frontend (Next.js): App Router mimarisi benimsenmiştir. Ana iskelet ve SEO gereksinimi olan kısımlar için SSR (Server-Side Rendering), dashboard grafikleri, görev panoları ve form işlemleri gibi yüksek etkileşim gerektiren alanlar için CSR (Client-Side Rendering) kullanılarak optimum performans sağlanmıştır.

## 2. TEKNOLOJİ SEÇİMİ VE ALTERNATİFLERLE KARŞILAŞTIRMA

Case Study beklentileri doğrultusunda teknolojiler rastgele değil, projenin "Performans ve Ölçeklenebilirlik" hedefleri gözetilerek seçilmiştir.

### 2.1. Backend: Neden Express.js + TypeScript?

Bu proje için yüksek eşzamanlı (concurrent) istekleri kaldırabilecek hafif bir yapıya ihtiyaç vardı. Node.js'in "Event-Driven, Non-Blocking I/O" mimarisi bunun için biçilmiş kaftandır.

* Alternatif (Java Spring Boot / C# .NET): Kurumsal yapılar için mükemmel olsalar da, çevik bir SaaS MVP'si (Minimum Viable Product) için gereksiz konfigürasyon (boilerplate) yükü getirirler. Express.js, geliştirme hızımızı artırmıştır.

* Alternatif (Python Django/FastAPI): Python veri biliminde harika olsa da, asenkron web isteklerinde Node.js'in Event Loop yapısı, CPU ve RAM tüketimi açısından çok daha performanslı bir sunucu deneyimi yaşatır.

* TypeScript Faktörü: Frontend tarafında Next.js kullanıldığı için, her iki tarafta da aynı dili (TypeScript) ve aynı veri arayüzlerini (Interface) kullanmak sistem bütünlüğünü sağlamıştır.

### 2.2. Frontend: Neden Next.js + Redux Toolkit + Tailwind/Shadcn?

* Next.js: Sadece CSR (Vite/CRA) kullanan bir React projesi yerine, Server Components avantajıyla ilk yükleme (First Contentful Paint) hızını artırmak ve layout yönetimini kolaylaştırmak için seçilmiştir.

* Redux Toolkit (RTK): Zustand veya Context API yerine, uygulamanın global auth state'ini (yetkilendirme durumu) ve karmaşık JWT Refresh Token döngüsünü (interceptor üzerinden) güvenli ve öngörülebilir bir şekilde yönetmek için tercih edilmiştir.

* Shadcn UI & Tailwind: Hazır ve hantal UI kütüphaneleri (MUI, AntD) yerine, projenin "Kurumsal ama modern" tasarım dilini yansıtacak, erişilebilir (a11y) ve sadece ihtiyaç duyulan kodun eklendiği bir yapı sunmuştur.

### 2.3. Veritabanı: Neden PostgreSQL?

Görevler, kullanıcılar ve analizler arası yoğun ilişkiler (Relations) barındıran bu sistemde NoSQL (MongoDB) kullanmak, veri bütünlüğü açısından riskli olurdu.

* PostgreSQL Seçimi: Katı veri bütünlüğü, CTE (Common Table Expressions) yeteneği ve Aggregate fonksiyonlardaki (FILTER, MODE) üstün gücü sayesinde karmaşık analitik hesaplamaları çok hızlı yapabildiği için seçilmiştir.

### 3. KARŞILAŞILAN TEKNİK ZORLUKLAR VE ÇÖZÜMLERİ

* Zorluk 1: Analitik Dashboard Verilerinde CPU Darboğazı Riski
Kullanıcının geciken görev oranını, günlük/haftalık performansını ve en verimli saatini hesaplamak, binlerce görevi olan bir kullanıcı için Node.js tarafında yapılırsa RAM ve CPU'yu felç edebilirdi.

    * Çözüm: Veriyi koda çekmek yerine, kod veriye götürüldü. Tüm hesaplamalar PostgreSQL tarafında (Backend repository katmanındaki getDashboardAnalytics metodunda) kompleks SQL CTE yapılarıyla çözüldü.

* Zorluk 2: Sürekli Veritabanı Sorgusu (Performans Sorunu)
Kullanıcı profil sayfasına her girdiğinde veya sayfayı her yenilediğinde bu ağır analitik sorgunun çalışması sistemi yoracaktı.

    * Çözüm: Sisteme node-cache (Önbellekleme) entegre edildi. Veriler 15 dakikalığına RAM'de tutuldu. Kullanıcı yeni bir görev eklediğinde veya sildiğinde cache.del() ile önbellek patlatılarak (Cache Invalidation) verinin her zaman %100 güncel kalması sağlandı.

* Zorluk 3: Frontend Axios Interceptor 401 Sonsuz Döngüsü
JWT token'ın süresi dolduğunda, Frontend'in 401 hatası alıp sürekli login'e atması veya sonsuz yönlendirme döngüsüne girmesi problemi yaşandı.

    * Çözüm: Redux ve Axios Interceptor yapısı kullanıldı. 401 hatası yakalandığında bekleyen tüm API istekleri durduruldu, arka planda sessizce POST /refresh isteği atılarak yeni token çerezlere (cookie) yazıldı ve durdurulan istekler kullanıcı hiçbir şey hissetmeden kaldığı yerden devam ettirildi.

### 4. GELECEK VİZYONU: SİSTEMİ ÖLÇEKLEMEK İSTESEK NEYİ DEĞİŞTİRİRDİK?

Proje şu anki haliyle binlerce kullanıcıyı rahatlıkla kaldırabilecek mimaridedir. Ancak aktif kullanıcı sayısı 100.000 (DAU) seviyesine çıksaydı, sistemde şu mimari evrimleri gerçekleştirirdik:

* Dağıtık Önbellekleme (Distributed Caching): Uygulama içi node-cache yerine, sunucular arası ortak bellek sağlayacak harici bir Redis sunucusuna geçiş yapardık. Böylece yatayda çoğalttığımız (Horizontal Scaling) Express sunucuları aynı önbelleği paylaşabilirdi.

* CQRS ve Read Replicas (Okuma/Yazma Ayrımı): Ağır Analitik sorgularını (Dashboard) ve normal CRUD işlemlerini ayırırdık. Yazma işlemleri Master PostgreSQL'e, analitik okuma işlemleri sadece okunabilir (Read-Only) Replica veritabanlarına yönlendirilirdi.

* Mesaj Kuyrukları (Message Brokers): Görev eklendiğinde veya silindiğinde analizlerin anında hesaplanması yerine, işlemi bir RabbitMQ veya Kafka kuyruğuna atıp, arka planda çalışan (Background Worker) ayrı bir mikroservise hesaplattırırdık. Node.js API'miz sadece istek karşılamaya odaklanırdı.

* Kalıcı Silme İşlemleri İçin Cron-Job Ayrımı: Gece yarısı çalışan node-cron süresi dolan görevleri silme işlemini ana sunucudan ayırıp, Serverless (Örn: AWS Lambda) bir fonksiyona devrederek ana API sunucumuzu arka plan işlerinden arındırırdık.
# KURULUM
## 🚀 Kurulum ve Çalıştırma Adımları
Projeyi kendi yerel ortamınızda (localhost) sorunsuz bir şekilde ayağa kaldırmak için aşağıdaki adımları sırasıyla izleyin.

## 📋 Ön Koşullar (Prerequisites)
### Başlamadan önce bilgisayarınızda şunların kurulu olduğundan emin olun:

* Docker Engine 

1️⃣ Repoyu Klonlayın 
İlk olarak projeyi bilgisayarınıza indirin ve klasörün içine girin.

2️⃣ Çevre Değişkenlerini (Environment Variables) Ayarlayın
docker-compose.yml dosyasında gerekli environment verilerini ayarlayın

3️⃣ Sunucuyu Ayağa Kaldırın
Artık her şey hazır! Geliştirme (development) modunda sunucuyu başlatmak için şu komutu çalıştırın:

```docker compose up```
Eğer terminalde şu mesajları görüyorsanız, tebrikler! Sistem başarıyla kurulmuştur:

```
Server is running on port ${port}
PostgreSQL Veritabanına başarıyla bağlanıldı! 🚀
ilk query başarılı
```
Jüri Testi İçin Küçük Bir Not:
Her şeyi kurduktan sonra Postman veya benzeri bir araçla doğrudan ```POST http://localhost:port/api/auth/register``` adresine istek atarak ilk kullanıcınızı oluşturabilir ve sistemin tadını çıkarabilirsiniz!