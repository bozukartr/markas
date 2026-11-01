/* Padişah Hayatı — Devlet makamları
 * cls: makam sahibinin sınıfı (pasa → Paşa, kalem → Efendi, ulema → Efendi, aga → Ağa)
 * key: makamın belirleyici yeteneği
 */
PH.D.offices = {
  sadrazam: { n: 'Sadrazam', cls: 'pasa', key: 'idare', icon: 'seal', salary: 180000, divan: 1, d: 'Mühr-i hümâyunun sahibi, padişahın mutlak vekili. İstikrarı ve devletin genel işleyişini belirler.' },
  vezir2: { n: 'İkinci Vezir', cls: 'pasa', key: 'askeri', icon: 'sword', salary: 100000, divan: 1, d: 'Kubbealtı vezirlerinin ikincisi. Seferlerde serdar olabilir, ordunun talimine katkı sağlar.' },
  vezir3: { n: 'Üçüncü Vezir', cls: 'pasa', key: 'diplomasi', icon: 'handshake', salary: 90000, divan: 1, d: 'Elçilik işlerinde ve iç meselelerde sadrazama yardım eder.' },
  defterdar: { n: 'Başdefterdar', cls: 'kalem', key: 'idare', icon: 'coin', salary: 90000, divan: 1, d: 'Maliyenin başı. Vergi gelirlerini ve yolsuzluğu doğrudan etkiler.' },
  nisanci: { n: 'Nişancı', cls: 'kalem', key: 'idare', icon: 'pen', salary: 80000, divan: 1, d: 'Fermanlara tuğra çeker, kanunnameleri hazırlar. Meşruiyete ve kanunlara katkı sağlar.' },
  kazasker: { n: 'Rumeli Kazaskeri', cls: 'ulema', key: 'ilim', icon: 'gavel', salary: 80000, divan: 1, d: 'Kadıların başı, adaletin teminatı. Halkın memnuniyetini ve adaleti etkiler.' },
  seyhulislam: { n: 'Şeyhülislam', cls: 'ulema', key: 'ilim', icon: 'book', salary: 100000, divan: 0, d: 'Fetva makamı. Ulema desteğini belirler; idam ve savaş kararlarına meşruiyet kazandırır.' },
  kaptan: { n: 'Kaptan-ı Derya', cls: 'pasa', key: 'askeri', icon: 'ship', salary: 90000, divan: 1, d: 'Donanmanın komutanı. Deniz seferlerinin ve ada fetihlerinin anahtarıdır.' },
  yeniceri: { n: 'Yeniçeri Ağası', cls: 'aga', key: 'askeri', icon: 'jan', salary: 90000, divan: 0, d: 'Ocağın başı. Yeniçerilerin sadakatini ve disiplinini belirler.' },
  darussaade: { n: 'Darüssaade Ağası', cls: 'aga', key: 'entrika', icon: 'door', salary: 70000, divan: 0, d: 'Harem-i hümâyunun yöneticisi. Harem entrikalarını sezer, haberleri padişaha ulaştırır.' },
  bostancibasi: { n: 'Bostancıbaşı', cls: 'aga', key: 'entrika', icon: 'mask', salary: 60000, divan: 0, d: 'Saray muhafızlarının ve gizli işlerin amiri. Komploları ortaya çıkarır, suikastlere karşı korur.' },
  hekimbasi: { n: 'Hekimbaşı', cls: 'kalem', key: 'ilim', icon: 'heart', salary: 50000, divan: 0, d: 'Saray hekimlerinin başı. Padişahın ve hanedanın sağlığını korur.' },
};
PH.D.officeOrder = ['sadrazam', 'vezir2', 'vezir3', 'defterdar', 'nisanci', 'kazasker', 'seyhulislam', 'kaptan', 'yeniceri', 'darussaade', 'bostancibasi', 'hekimbasi'];

PH.D.clsSuffix = { pasa: 'Paşa', kalem: 'Efendi', ulema: 'Efendi', aga: 'Ağa' };
PH.D.clsName = { pasa: 'Seyfiye (Paşa)', kalem: 'Kalemiye (Efendi)', ulema: 'İlmiye (Ulema)', aga: 'Saray Ağası' };
