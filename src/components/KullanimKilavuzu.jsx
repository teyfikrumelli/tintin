import React from 'react';
import { HelpCircle, Brain, Calendar, Sparkles, AlertCircle, Play } from 'lucide-react';

const KullanimKilavuzu = () => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-6 rounded-3xl flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <HelpCircle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Kullanım Kılavuzu</h2>
            <p className="text-slate-400 text-sm">KarteiKarten ile Almanca öğrenme rehberi</p>
          </div>
        </div>
      </div>

      {/* Spaced Repetition explanation */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-2xl flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="text-indigo-400" size={20} />
          Aralıklı Tekrar (Spaced Repetition) Nedir?
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Aralıklı tekrar, bilgileri unutmaya en yakın olduğunuz anlarda tekrar etmenizi sağlayan bilimsel bir öğrenme yöntemidir. 
          Bu uygulama, dünyaca ünlü <strong>SuperMemo-2 (SM-2)</strong> algoritmasını kullanır. 
          Bir kelimeyi her doğru bildiğinizde, o kelimeyi bir sonraki görüşünüz arasındaki süre (aralık) katlanarak artar. Böylece bildiğiniz kelimeleri sürekli tekrar etmek yerine, zorlandığınız kelimelere odaklanırsınız.
        </p>
      </div>

      {/* Button levels explanation */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-2xl flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="text-indigo-400" size={20} />
          Zorluk Dereceleri Ne Anlama Gelir?
        </h3>
        <p className="text-slate-300 text-sm mb-2">
          Kartı çevirdikten sonra kelimeyi ne kadar iyi hatırladığınıza bağlı olarak 5 farklı seviyeden birini seçersiniz:
        </p>
        
        <div className="space-y-3">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <h4 className="text-red-400 font-bold text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Nochmal (Tekrar)
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              Kelimeyi hatırlayamadıysanız veya yanlış çevirdiyseniz seçin. Kart sıfırlanır ve <strong>mevcut çalışma oturumunun sonuna eklenerek</strong> bugün size tekrar sorulur.
            </p>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h4 className="text-blue-400 font-bold text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Schwer (Zor)
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              Kelimeyi doğru hatırladınız ama hatırlarken çok zorlandınız. Kelime bir sonraki gün (<strong>1 gün sonra</strong>) tekrar sorulur.
            </p>
          </div>

          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <h4 className="text-green-400 font-bold text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              Gut (İyi)
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              Kelimeyi normal bir duraksamadan sonra doğru hatırladınız. Kelime <strong>3 gün sonra</strong> tekrar sorulur.
            </p>
          </div>

          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <h4 className="text-indigo-400 font-bold text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Einfach (Kolay)
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              Kelimeyi duraksamadan, rahatça hatırladınız. Kelime <strong>7 gün sonra</strong> tekrar sorulur.
            </p>
          </div>

          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <h4 className="text-purple-400 font-bold text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              Bekannt (Bildiğim)
            </h4>
            <p className="text-slate-300 text-xs mt-1">
              Kelimeyi zaten çok iyi biliyorsunuz. Kelime doğrudan <strong>21 gün (3 hafta) sonra</strong> sorulmak üzere ertelenir, böylece gün aşırı karşınıza çıkıp vaktinizi almaz.
            </p>
          </div>
        </div>
      </div>

      {/* Daily Limits & Schedule explanation */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-2xl flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="text-indigo-400" size={20} />
          Günlük Limitler Nasıl Çalışır?
        </h3>
        <div className="text-slate-300 text-sm space-y-3 leading-relaxed">
          <p>
            Almanca kelime listenizde binlerce kart bulunabilir. Hepsini bir anda çalışmak ezberlemeyi zorlaştırır ve motivasyonu düşürür. Bu yüzden sistemimiz günlük limit uygular:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>
              <strong>Yeni Kart Limiti (Varsayılan 20):</strong> Her gün, seçtiğiniz desteden en fazla 20 tane daha önce hiç görmediğiniz yeni kelime çalışmaya dahil edilir. Bu limiti <strong>Genel Bakış (Übersicht)</strong> sayfasından dilediğiniz gibi değiştirebilirsiniz.
            </li>
            <li>
              <strong>Tekrar Kartları (Sınırsız):</strong> Geçmişte öğrendiğiniz ve tam bugün tekrar edilmesi gereken (vadesi gelen) kartlar limitsizdir. Unutmamak için onları her gün çalışmanız gerekir.
            </li>
            <li>
              <strong>Kart Neden Bugün Tekrar Çıkmıyor?:</strong> Bir karta <em>Schwer</em>, <em>Gut</em>, <em>Einfach</em> veya <em>Bekannt</em> dediğinizde, o kartın bugünkü çalışması biter ve ertelenir. Bugün o kartı bir daha görmezsiniz; vadesi geldiğinde (1, 3 veya 7 gün sonra) tekrar karşınıza çıkar.
            </li>
            <li>
              <strong>Ekstra Çalışma:</strong> Eğer bugünün 20 yeni kelimesini bitirdiyseniz ve daha fazla çalışmak istiyorsanız, bitiş ekranındaki <strong>"Weitere 20 neue Karten lernen"</strong> butonuna tıklayarak o desteden 20 yeni kelime daha çekebilirsiniz.
            </li>
          </ul>
        </div>
      </div>

      {/* Custom Cards */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6 rounded-2xl flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertCircle className="text-indigo-400" size={20} />
          Kendi Kartlarımı Nasıl Eklerim?
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Kitap okurken, film izlerken veya ders çalışırken karşılaştığınız yeni Almanca kelimeleri uygulamaya ekleyebilirsiniz. 
          Bunun için üst menüdeki <strong>Editor</strong> sayfasına gidin. Sol taraftaki formu doldurarak kelimeleri ve örnek cümleleri kaydedebilir, sağ taraftaki panelden ise oluşturduğunuz tüm kartları arayabilir, destelere göre filtreleyebilir veya silebilirsiniz. Oluşturduğunuz desteler ana sayfada ayrı birer deste olarak görünür ve spaced repetition algoritmasına dahil edilir.
        </p>
      </div>
    </div>
  );
};

export default KullanimKilavuzu;
