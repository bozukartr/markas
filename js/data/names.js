/* Padişah Hayatı — İsim havuzları */
PH.D = PH.D || {};

PH.D.names = {
  sultan: ['Mehmed', 'Ahmed', 'Mustafa', 'Süleyman', 'Selim', 'Bayezid', 'Murad', 'Osman', 'Orhan', 'İbrahim', 'Mahmud', 'Abdülhamid', 'Korkud', 'Cem', 'Cihangir', 'Alemşah', 'Şehinşah', 'Kasım', 'Yusuf', 'Ömer', 'Davud', 'Alaeddin', 'Hamza', 'Ertuğrul', 'Savcı'],
  male: ['Ahmed', 'Mehmed', 'Mustafa', 'Ali', 'Hasan', 'Hüseyin', 'Ömer', 'Osman', 'Yusuf', 'İbrahim', 'Halil', 'Davud', 'Süleyman', 'Mahmud', 'Kasım', 'Piri', 'Rüstem', 'Lütfi', 'Ayas', 'Sinan', 'Pertev', 'Ferhad', 'Mesih', 'Nasuh', 'Cafer', 'Murad', 'Hadım', 'Hızır', 'Turgut', 'Salih', 'Kemal', 'Abdi', 'Ebubekir', 'Musa', 'İsa', 'Yakub', 'İshak', 'İlyas', 'Hamza', 'Bali', 'Zal', 'Hersek', 'Gedik', 'Mahmud', 'Derviş', 'Kenan', 'Recep', 'Necip', 'Arslan', 'Behram', 'Kubad', 'Tayyar', 'Nevşehirli', 'Rami', 'Raşid', 'Seyyid', 'Abdullah', 'Abdurrahman', 'Fazıl', 'Kara', 'Çelebi', 'Sokollu', 'Taşköprülü'],
  maleCommon: ['Ahmed', 'Mehmed', 'Mustafa', 'Ali', 'Hasan', 'Hüseyin', 'Ömer', 'Osman', 'Yusuf', 'İbrahim', 'Halil', 'Davud', 'Süleyman', 'Mahmud', 'Kasım', 'Piri', 'Rüstem', 'Lütfi', 'Ayas', 'Sinan', 'Pertev', 'Ferhad', 'Mesih', 'Nasuh', 'Cafer', 'Murad', 'Hızır', 'Turgut', 'Salih', 'Abdi', 'Musa', 'Yakub', 'İshak', 'İlyas', 'Hamza', 'Bali', 'Derviş', 'Kenan', 'Recep', 'Arslan', 'Behram', 'Kubad', 'Seyyid', 'Abdullah', 'Abdurrahman', 'Fazıl', 'Zekeriya', 'Ebussuud', 'Bostan', 'Şemseddin', 'Kemaleddin', 'Taceddin', 'Nureddin', 'Ziyaeddin', 'Veliyüddin'],
  ulemaNames: ['Ebussuud', 'Kemalpaşazade', 'Zembilli Ali', 'Molla Gürani', 'Molla Hüsrev', 'Hoca Sadeddin', 'Zekeriya', 'Bostanzade', 'Yahya', 'Esad', 'Feyzullah', 'Abdürrahim', 'Mehmed Emin', 'Ahmed Muhtar', 'Şemseddin', 'Taceddin', 'Kemaleddin', 'Nureddin', 'Hayreddin', 'Bahaeddin', 'Sünbülzade', 'Mirza', 'Hocazade'],
  nicks: ['Kara', 'Koca', 'Uzun', 'Deli', 'Gazi', 'Lala', 'Topal', 'Kuyucu', 'Tiryaki', 'Kemankeş', 'Silahdar', 'Hezarpare', 'Bıyıklı', 'Cerrah', 'Kapıcıbaşı', 'Hadım', 'Sarı', 'Çelebi', 'Ak', 'Boşnak', 'Arnavut', 'Çerkes', 'Gürcü', 'Tatar', 'Kalaylıkoz', 'Semiz', 'Defterdar', 'Kılıç', 'Firari', 'Yemişçi', 'Moralı', 'Halepli', 'Kırımlı', 'Hersekzade', 'Sokollu', 'Köprülü', 'Nevşehirli', 'Çandarlı', 'Kemalpaşazade', 'Tavukçu'],
  female: ['Hatice', 'Fatma', 'Ayşe', 'Şah', 'Mihrimah', 'Hümaşah', 'Gevherhan', 'Esma', 'Zeynep', 'Rukiye', 'Emine', 'Hafsa', 'Gülfem', 'Hanzade', 'Fatma', 'Kaya', 'Atike', 'Ümmügülsüm', 'Saliha', 'Raziye', 'Hadice', 'Beyhan', 'Şahsultan', 'Nilüfer', 'Selçuk', 'Hundi', 'İsmihan', 'Fahriye', 'Dürrüşehvar', 'Cemile', 'Münire', 'Naime', 'Seniha', 'Mediha'],
  cariye: ['Hürrem', 'Gülbahar', 'Mahidevran', 'Nurbanu', 'Safiye', 'Kösem', 'Handan', 'Halime', 'Turhan', 'Gülnuş', 'Mihrişah', 'Nakşidil', 'Bezmialem', 'Pertevniyal', 'Şebsefa', 'Gülruh', 'Dilruba', 'Mahpeyker', 'Şemsiruhsar', 'Nevres', 'Lalezar', 'Ruhsar', 'Dilber', 'Mehlika', 'Nigar', 'Şevkidil', 'Neşerek', 'Nergis', 'Yasemin', 'Lale', 'Gülşah', 'Mükrime', 'Dilaşub', 'Mahfiruz', 'Şehsuvar', 'Emetullah', 'Rabia', 'Ayşe', 'Hümaşah', 'Mihrimah', 'Gülfidan', 'Meleksima', 'Perestu', 'Nurefsun', 'Cevri', 'Neveser', 'Dilfiruz', 'Zernigar', 'Tiryal', 'Hoşyar', 'Dilpezir', 'Bidar', 'Gülistu', 'Şayeste', 'Nazperver', 'Şermi', 'Ruhşah', 'Ebrureftar', 'Sitare'],
  origins: ['Çerkez', 'Gürcü', 'Rus', 'Rum', 'Boşnak', 'Arnavut', 'Macar', 'Venedikli', 'Lehli', 'Abaza', 'Ukraynalı', 'Sırp', 'Ceneviz kökenli', 'Kırım Tatarı', 'Hırvat'],
  foreign: {
    byz: ['Konstantinos', 'İoannes', 'Manuel', 'Demetrios', 'Thomas'],
    ven: ['Andrea Gritti', 'Francesco Foscari', 'Leonardo Loredan', 'Pietro Lando', 'Marcantonio Trevisan', 'Leonardo Donà', 'Marino Grimani', 'Paolo Renier', 'Ludovico Manin', 'Alvise Mocenigo', 'Niccolò da Ponte', 'Giovanni Cornaro'],
    hun: ['Jan Hunyadi', 'Mátyás', 'Ulászló', 'Lajos', 'László', 'János Zápolya'],
    kar: ['İbrahim Bey', 'Pir Ahmed Bey', 'Kasım Bey', 'İshak Bey'],
    akk: ['Uzun Hasan', 'Yakub Bey', 'Cihangir Mirza', 'Halil Bey'],
    mam: ['Kayıtbay', 'Kansu Gavri', 'Tumanbay', 'Çakmak', 'İnal', 'Hoşkadem'],
    trb: ['İoannes Komnenos', 'David Komnenos', 'Aleksios Komnenos'],
    krm: ['Hacı Giray', 'Mengli Giray', 'Nurdevlet Giray', 'Mehmed Giray'],
    kni: ['Philippe Villiers', 'Jean de La Valette', 'Pierre d\'Aubusson', 'Emmanuel de Rohan', 'Alof de Wignacourt'],
    hab: ['Ferdinand', 'Maximilian', 'Rudolf', 'Matthias', 'Leopold', 'Joseph', 'Karl', 'Franz', 'Leopold II'],
    saf: ['Şah İsmail', 'Şah Tahmasb', 'Şah Abbas', 'Şah Safi', 'Şah Süleyman', 'Şah Hüdabende', 'Kerim Han', 'Ağa Muhammed Han', 'Feth Ali Şah'],
    pol: ['Zygmunt', 'Stefan Batory', 'Jan Sobieski', 'Władysław', 'August', 'Stanisław', 'Jan Kazimierz'],
    rus: ['İvan', 'Vasili', 'Mihail', 'Aleksey', 'Fyodor', 'Petro', 'Katerina', 'Pavel', 'Aleksandr'],
    spa: ['Carlos', 'Felipe', 'Fernando', 'Carlos II'],
    fra: ['François', 'Henri', 'Louis', 'Charles', 'Louis XVI'],
  },
  sancaks: ['Manisa', 'Amasya', 'Konya', 'Trabzon', 'Kütahya', 'Kastamonu', 'Bolu', 'Teke', 'Hamid'],
  poets: ['Bâkî', 'Fuzûlî', 'Nef\'î', 'Nedîm', 'Şeyh Gâlib', 'Nâbî', 'Zâtî', 'Hayâlî', 'Necâtî', 'Ahmed Paşa', 'Nev\'î', 'Yahyâ Bey'],
  architects: ['Mimar Sinan', 'Mimar Hayreddin', 'Mimar Kemaleddin', 'Davud Ağa', 'Sedefkâr Mehmed Ağa', 'Mimar Atik Sinan', 'Mimar Kasım Ağa', 'Mimar Tahir Ağa'],
};

PH.D.mahlas = ['Muhibbî', 'Adlî', 'Selîmî', 'Avnî', 'Bahtî', 'Fârisî', 'Cemâlî', 'Şâhî', 'Mürâdî', 'Zârî', 'Kâmî', 'Rahmî', 'Hâlî', 'Garîbî', 'Hayâlî', 'Nûrî', 'Vâlî', 'Edhem', 'Câmî', 'Sırrî'];
