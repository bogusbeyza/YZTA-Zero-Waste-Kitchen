# YZTA-Zero-Waste-Kitchen
Yapay Zeka ve Teknoloji Akademisi Hackathon için AI Grup 43 tarafından geliştirilen Zero Waste Kitchen/ Atıksız Mutfak Projesi
# Atıksız Mutfak, Akıllı Tarifler

Bu proje, kullanıcıların evdeki malzemeleriyle yaratıcı, kişiselleştirilmiş ve sürdürülebilir tarifler oluşturmasına yardımcı olan, Google Gemini AI destekli bir web uygulamasıdır. "Atıksız Mutfak" felsefesiyle gıda israfını azaltmayı hedefler. Kullanıcılar, sahip oldukları malzemeleri, diyet tercihlerini, öğün türünü, kişi sayısını ve hazırlama süresini belirleyerek AI tarafından üretilen tarifler alabilirler. Ayrıca, kullanılmayan malzemeler için özel saklama/kullanım önerileri ve enerji tasarrufu ipuçları sunularak bilinçli tüketim teşvik edilir.

## Temalar

Bu proje aşağıdaki temalar etrafında şekillenmiştir:

   **Sürdürülebilirlik Çözümleri:** Gıda israfını önleme, kaynakların verimli kullanımı ve enerji tasarrufu odaklıdır.

## Proje Yapısı

Proje, bir frontend kullanıcı arayüzü ve bir Node.js backend servisinden oluşur:

### Frontend (`Yapay Zeka Akademisi` içinde)

*   **`index.html`**: Uygulamanın ana HTML yapısını oluşturur. Kullanıcı arayüzü bileşenlerini (formlar, butonlar, tarif görüntüleme alanı vb.) içerir.
*   **`css/style.css`**: Uygulamanın stilini tanımlar. Renkler, yazı tipleri, düzen, koyu/açık tema ve diğer görsel öğeler için CSS kurallarını içerir.
*   **`js/script.js`**: Frontend'in ana uygulama mantığını yönetir. Kullanıcı girişlerini alır, backend API'sine istek gönderir, gelen tarifleri işler ve `ui.js` aracılığıyla görüntüler. Kullanıcı etkileşimlerini (favorilere ekleme, yeniden oluşturma vb.) yönetir.
*   **`js/ui.js`**: Kullanıcı arayüzü (UI) ile ilgili dinamik güncellemeleri ve etkileşimleri yöneten fonksiyonları içerir (örn: tarif gösterme, yükleme/hata durumları, ipucu alanlarını güncelleme).
*   **`logo.png`**: Uygulamanın logosu.

### Backend

*   **`server.js`**: Node.js ve Express.js kullanılarak oluşturulmuş backend sunucusudur.
    *   `/api/generate-recipe` endpoint'i üzerinden frontend'den gelen tarif kriterlerini alır.
    *   Google Gemini AI (gemini-1.5-flash modeli) ile entegre çalışarak bu kriterlere uygun tarifler, malzeme saklama/kullanım ipuçları ve enerji tasarrufu önerileri üretir.
    *   AI'dan gelen yanıtı işleyerek yapılandırılmış JSON formatında frontend'e gönderir.

## Teknolojiler

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Backend:** Node.js, Express.js
*   **Yapay Zeka:** Google Gemini AI (via `@google/generative-ai` kütüphanesi)
*   **Diğer:** Font Awesome (ikonlar için)

## Kurulum

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

### 1. Frontend Kurulumu

1.  Projenin frontend dosyalarını (`Yapay Zeka Akademisi` içindekiler veya GitHub'dan klonladıysanız ilgili klasör) bir dizine çıkarın.
2.  `index.html` dosyasını bir web tarayıcısında açın.
    *   *Not: Frontend, backend sunucusunun çalışır durumda olmasını ve doğru adrese (varsayılan olarak `http://localhost:3000/api/generate-recipe`) istek yapacak şekilde yapılandırılmış olmasını bekler (`script.js` içindeki `RECIPE_BACKEND_URL`).*

### 2. Backend Kurulumu

1.  Node.js ve npm'in (Node Package Manager) sisteminizde kurulu olduğundan emin olun.
2.  `server.js` dosyasının bulunduğu dizine terminal veya komut istemi ile gidin.
3.  Gerekli bağımlılıkları yükleyin:
    ```bash
    npm install express cors dotenv @google/generative-ai
    ```
4.  Proje kök dizininde `.env` adında bir dosya oluşturun ve içine Google Gemini API anahtarınızı ekleyin:
    ```env
    GEMINI_API_KEY=BURAYA_API_ANAHTARINIZI_YAZIN
    ```
5.  Backend sunucusunu başlatın:
    ```bash
    node server.js
    ```
    Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışmaya başlayacaktır.

## Kullanım

1.  Frontend'i tarayıcınızda açın (`index.html`).
2.  Backend sunucusunun çalıştığından emin olun.
3.  "Elimde Ne Var?" bölümüne sahip olduğunuz malzemeleri girin.
4.  Diyet tercihlerinizi, öğün türünü, kişi sayısını ve maksimum hazırlama süresini form üzerinden seçin.
5.  "Tarif Oluştur" butonuna tıklayın.
6.  AI tarafından oluşturulan tarifi, malzeme listesini, yapılış adımlarını ve (varsa) artan malzeme/enerji tasarrufu ipuçlarını görüntüleyin.
7.  İsterseniz tarifi favorilerinize ekleyin veya "Beğenmedim, Yenisini Oluştur" butonu ile farklı bir tarif isteyin.

## Katkıda Bulunma

Herhangi bir katkıda bulunmak, hata bildirmek veya özellik önermek isterseniz, lütfen GitHub üzerinden bir "issue" açın veya bir "pull request" oluşturun. Tüm katkılar memnuniyetle karşılanır!

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına (eğer varsa) bakın veya MIT Lisansı metnini inceleyin.
