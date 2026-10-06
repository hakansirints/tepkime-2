# Sıcak Sınıf Tepkime Laboratuvarı

Tepkime Arenası'nın 12 maddeli etkinliği, `3b-lab/sicak-sinif-laboratuvari` oda geometrisiyle birleştirildi. Eğitim akışı ve mevcut 36 tepkime senaryosu korunur; diğer 30 eşleşme belirgin tepkime olmayan karışımlar olarak ele alınır.

## Açma

Birincil proje klasörü: `C:\Users\hakan\Documents\Codex\tepkime-arenasi`.

Bu klasördeki `baslat.cmd` dosyasına çift tıklayın. Yerel sunucu bu klasörden başlar ve tarayıcı açılır. Sunucu penceresi açık kalmalıdır; kapatınca önizleme durur. Python kurulu olmalıdır.

Alternatif olarak bu klasörde PowerShell açıp çalıştırın:

```powershell
py -3 scripts/start-preview.py
```

`http://127.0.0.1:8173/index.html` adresini açın. Three.js modülleri için HTTP önizleme kullanılır. Sunucu yalnızca bu bilgisayardan erişilebilir. Durdurmak için terminalde Ctrl+C kullanın.

## Deney akışı

1. Arenaya girin. Sol kart panelinden iki farklı madde seçin.
2. İlk kart 1. behere, ikinci kart 2. behere doldurulur. Doldurma tamamlanınca tahmin düğmesi açılır.
3. Beklenen değişimleri seçip tahmini kaydedin.
4. İkinci beheri birinciye sürükleyin veya Beheri Dök düğmesini kullanın.
5. Dijital sıcaklık değerini ve gaz/çökelti/renk belirtilerini inceleyin.
6. Rapor ve çoklu tepkime türü değerlendirmesine, ardından tanecik incelemesine geçin.

Kartlar deney sırasında kilitlenir. Yeni deney düğmesi seçimi ve önceki deneyi temizler. Fare tekerleğiyle yakınlaşıp uzaklaşabilirsiniz; kamera oda sınırlarının içinde tutulur. Masa yeşildir. Beherlerin en-boy oranı korunur; deneyin rahat görülebilmesi için gösterim boyutu büyütülmüştür. Katılar beyaz toz, bakır(II) nitrat mavi çözelti, diğer başlangıç çözeltileri renksizdir. İki kuru katı karıştırıldığında sıvı oluşturulmaz. Deterjan içermeyen senaryolarda gaz kabarcıkları gösterilir; sabun köpüğü oluşturulmaz.

Laboratuvara girildiğinde önce oda görünür, ardından kamera deney düzeneğine yaklaşır. Maddeler beher tabanından yukarı doğru dolar. Seçili maddelerin kartları ve beherlerin önündeki isimlikler üzerine gelindiğinde parçacık animasyonu gösterilir. Dökme konumuna ulaşıldığında birinci beherin ağzındaki halka uygun konumu belirtir; sıvı aktarımı kavisli akış, damlacık ve yüzey dalgasıyla gösterilir.

## Dosyalar

- `js/app.js`: seçim, doldurma bekleme durumu, tahmin, rapor ve değerlendirme.
- `js/lab-scene.js`: sıcak sınıf geometrisi, iki beher, toz/sıvı aktarımı ve deney animasyonları.
- `js/chemistry-visuals.js`: başlangıç görünümü, karışım fazları ve seyirci iyon listesi.
- `js/data.js`: mevcut tepkime içerikleri, deney koşulu notları ve fiziksel karışım açıklamaları.
- `css/lab-world.css`: kart paneli, görev paneli ve ekran boyutuna göre düzen.
- `scripts/verify-chemistry.cjs`: tarayıcı gerektirmeyen veri, akış ve Three.js nesne durumu kontrolleri.

## Doğrulama

```powershell
node scripts/verify-chemistry.cjs
```

Kontroller 66 eşleşmeyi iki seçim sırasında, rapor/tanecik HTML üretimini ve Three.js nesnelerinin boş/katı/sıvı/çökelti durumlarını kapsar. Three.js testi çizici yerine bir test nesnesi kullanır; GPU çıktısını veya tarayıcı yerleşimini doğrulamaz. `scripts/verify-lab.cjs` gerçek tarayıcıda görsel ve etkileşim kontrolleri içindir.

Sıcaklıklar, derişimler ve tepkime hızları nicel fizik hesaplamasıyla üretilmez. Mevcut sıcaklık değerleri eğitim senaryosundan alınmıştır. Tanecik incelemesi mevcut SVG modellerini kullanır. 36 senaryonun tümü bu değişiklik kapsamında bağımsız bilimsel doğrulamadan geçirilmemiştir.
