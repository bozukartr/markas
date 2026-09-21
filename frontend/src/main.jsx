import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Package,
  ArrowUpRight,
  Plus,
  Search,
  RefreshCw,
  Cloud,
  Monitor,
  ArrowDownRight,
  Trash2,
  X,
  Check,
  ShoppingBasket,
  ArrowRight,
  Leaf,
} from "lucide-react";
import "./style.css";
const money = (n) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    n / 100,
  );
async function api(path, options = {}) {
  const r = await fetch("/api/" + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!r.ok) {
    let b = await r.json().catch(() => ({}));
    throw Error(
      b.message || b.title || "İşlem tamamlanamadı. Yenileyip tekrar deneyin.",
    );
  }
  return r.status === 204 ? null : r.json();
}
const blank = {
  name: "",
  barcode: "",
  category: "Temel Gıda",
  priceCents: 100,
  stock: 0,
  minStock: 10,
};
function App() {
  const [products, setProducts] = useState([]),
    [summary, setSummary] = useState(null),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("Tüm ürünler"),
    [editor, setEditor] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [connected, setConnected] = useState(false),
    [busy, setBusy] = useState(false),
    [sale, setSale] = useState(null),
    [deleting, setDeleting] = useState(null),
    [loaded, setLoaded] = useState(false);
  async function refresh() {
    try {
      const [p, s] = await Promise.all([api("products"), api("sales/summary")]);
      setProducts(p);
      setSummary(s);
      setConnected(true);
      setError((current) => current.startsWith("Yerel kasaya") ? "" : current);
      setLoaded(true);
    } catch (e) {
      setConnected(false);
      setError("Yerel kasaya ulaşılamıyor. API hizmetini kontrol edin.");
    }
  }
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);
  async function action(fn, message) {
    setBusy(true);
    setError("");
    try {
      await fn();
      setNotice(message);
      await refresh();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  const critical = products.filter((p) => p.stock <= p.minStock).length;
  const shown = products.filter(
    (p) =>
      (filter !== "Kritik stok" || p.stock <= p.minStock) &&
      `${p.name} ${p.barcode} ${p.category}`
        .toLocaleLowerCase("tr")
        .includes(query.toLocaleLowerCase("tr")),
  );
  async function save(e) {
    e.preventDefault();
    if (
      await action(
        () =>
          api(editor.id ? "products/" + editor.id : "products", {
            method: editor.id ? "PUT" : "POST",
            body: JSON.stringify(editor),
          }),
        "Ürün kaydedildi.",
      )
    )
      setEditor(null);
  }
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brandmark">m</span>markas
          <span className="branddot">.</span>
        </a>
        <div className="workspace">
          <span className="store-icon">
            <ShoppingBasket size={21} />
          </span>
          <div>
            Merkez Market<small>Mağaza yönetimi</small>
          </div>
          <span className="ml-auto text-slate-400">⌄</span>
        </div>
        <div className="nav-label">ÇALIŞMA ALANI</div>
        <a href="#" className="nav-item active">
          <LayoutDashboard size={19} /> Genel bakış{" "}
          <span className="ml-auto small-dot" />
        </a>
        <a href="#products" className="nav-item">
          <Package size={19} /> Ürünler & stok{" "}
          <span className="count">{products.length}</span>
        </a>
        <a href="#sales" className="nav-item">
          <ShoppingBasket size={19} /> Son satışlar
        </a>
        <div className="sidebar-bottom">
          <div className="offline-card">
            <Cloud size={22} />
            <b>Satış kesintisiz devam eder.</b>
            <p>İnternet kesilse de satışlarınız mağazada güvenle saklanır.</p>
            <span>
              <i className="small-dot" /> Yerel SQLite
            </span>
          </div>
          <div className="profile">
            <div className="avatar">MM</div>
            <div>
              Mağaza yöneticisi<small>Merkez Market</small>
            </div>
          </div>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span>
            Çalışma alanı <span className="mx-3 text-slate-300">/</span>
            <b>Genel bakış</b>
          </span>
          <span className="connection">
            <i className={"small-dot " + (!connected ? "red" : "")} />
            {connected ? "Yerel kasa bağlı" : "Kasa bağlantısı yok"}
          </span>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">MARKETİNİZ, BİR BAKIŞTA</div>
              <h1>
                Her şey kontrolünüzde<span>.</span>
              </h1>
              <p>
                Bugünün hareketlerini takip edin, bir sonraki adımı planlayın.
              </p>
            </div>
            <div className="date">
              {new Intl.DateTimeFormat("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date())}
              <small>Merkez mağaza · Kasa 01</small>
            </div>
          </div>
          {error && (
            <div role="alert" className="error">
              <span>{error}</span>
              <button aria-label="Uyarıyı kapat" onClick={() => setError("")}>
                <X size={17} />
              </button>
            </div>
          )}
          {notice && (
            <div role="status" className="toast">
              <Check size={18} />
              {notice}
            </div>
          )}
          <section className="stats">
            <article className="stat primary">
              <div className="stat-label">
                Anlık Ciro <ArrowUpRight size={22} />
              </div>
              <strong>{summary ? money(summary.revenueCents) : "—"}</strong>
              <div className="stat-foot">
                <span className="pill-light">BUGÜN</span>
                <span>{summary?.saleCount ?? 0} tamamlanan satış</span>
              </div>
              <div className="bars" aria-hidden="true">
                {[28, 40, 34, 55, 44, 64, 48, 72, 62, 86, 75, 100].map(
                  (h, i) => (
                    <i key={i} style={{ height: h + "%" }} />
                  ),
                )}
              </div>
            </article>
            <article className="stat">
              <div className="stat-label">
                Kritik Stok{" "}
                <span className="icon-box amber">
                  <Package size={21} />
                </span>
              </div>
              <strong>
                {loaded ? String(critical).padStart(2, "0") : "—"} <em>ürün</em>
              </strong>
              <div className="stat-foot">
                <span className="amber-dot" /> Stok takviyesi bekliyor{" "}
                <button
                  aria-label="Kritik ürünleri göster"
                  onClick={() => {
                    setFilter("Kritik stok");
                    document
                      .getElementById("products")
                      .scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <ArrowRight size={19} />
                </button>
              </div>
            </article>
            <article className="stat">
              <div className="stat-label">
                Aktif Kasa{" "}
                <span className="icon-box mint">
                  <Monitor size={21} />
                </span>
              </div>
              <strong>
                {connected ? "01" : "00"} <em>/ 01</em>
              </strong>
              <div className="stat-foot">
                <i className={"small-dot " + (!connected ? "red" : "")} />
                {connected ? "Kasa 01 satışa hazır" : "Yerel hizmet bekleniyor"}
              </div>
            </article>
          </section>
          <div className="sync-strip">
            <span className="sync-icon">
              <Cloud size={22} />
            </span>
            <div>
              <b>
                {summary?.pending
                  ? `${summary.pending} satış buluta aktarılmayı bekliyor`
                  : summary?.cloudConfigured
                    ? "Satış kuyruğu güncel"
                    : "Yerel çalışma modu"}
              </b>
              <p>
                {summary?.cloudConfigured
                  ? "Bağlantı olduğunda satışlar otomatik aktarılır."
                  : "Bulut bağlantısını yapılandırın; satışlar SQLite üzerinde saklanır."}
              </p>
            </div>
            <span className="local-badge">OFFLINE-FIRST</span>
            <button
              className="quiet"
              onClick={refresh}
              aria-label="Verileri yenile"
            >
              <RefreshCw size={17} />
            </button>
          </div>
          <section id="products" className="panel">
            <div className="panel-heading">
              <div>
                <h2>Canlı fiyat & stok yönetimi</h2>
                <p>Raflarınızdaki her ürün, güncel ve düzenli.</p>
              </div>
              <button
                className="btn dark"
                onClick={() => setEditor({ ...blank })}
              >
                <Plus size={18} /> Ürün ekle
              </button>
            </div>
            <div className="toolbar">
              <div className="tabs">
                {["Tüm ürünler", "Kritik stok"].map((f) => (
                  <button
                    key={f}
                    className={filter === f ? "selected" : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                    <span>
                      {f === "Tüm ürünler" ? products.length : critical}
                    </span>
                  </button>
                ))}
              </div>
              <label className="search">
                <Search size={18} />
                <input
                  aria-label="Ürün veya barkod ara"
                  placeholder="Ürün veya barkod ara..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ÜRÜN BİLGİSİ</th>
                    <th>KATEGORİ</th>
                    <th>SATIŞ FİYATI</th>
                    <th>STOK</th>
                    <th>DURUM</th>
                    <th className="text-right">İŞLEMLER</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((p, i) => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-cell">
                          <div className={"product-icon tone" + (i % 4)}>
                            <ShoppingBasket size={22} />
                          </div>
                          <div>
                            <b>{p.name}</b>
                            <small>{p.barcode}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category">{p.category}</span>
                      </td>
                      <td>
                        <button
                          className="price"
                          onClick={() => setEditor({ ...p })}
                          aria-label={p.name + " fiyatını düzenle"}
                        >
                          {money(p.priceCents)}
                        </button>
                      </td>
                      <td>
                        <b
                          className={
                            p.stock <= p.minStock ? "text-amber-700" : ""
                          }
                        >
                          {p.stock}
                        </b>
                        <span className="text-slate-400 text-sm ml-1">
                          adet
                        </span>
                        <div className="stock-track">
                          <i
                            style={{
                              width:
                                Math.min(
                                  100,
                                  (p.stock / (p.minStock * 4 || 40)) * 100,
                                ) + "%",
                              background:
                                p.stock <= p.minStock ? "#d89b35" : "#4f8f76",
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <span
                          className={
                            "status " +
                            (p.stock <= p.minStock ? "warning" : "good")
                          }
                        >
                          ●{" "}
                          {p.stock === 0
                            ? "Tükendi"
                            : p.stock <= p.minStock
                              ? "Kritik stok"
                              : "Stokta"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            disabled={!p.stock || !connected}
                            onClick={() =>
                              setSale({
                                id: crypto.randomUUID(),
                                productId: p.id,
                                name: p.name,
                                quantity: 1,
                                price: p.priceCents,
                                stock: p.stock,
                              })
                            }
                            className="sell"
                          >
                            Satış <ArrowUpRight size={14} />
                          </button>
                          <button
                            aria-label={p.name + " ürününü sil"}
                            onClick={() => setDeleting(p)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!shown.length && (
                <div className="empty">
                  {!loaded
                    ? "Ürünler yükleniyor…"
                    : "Gösterilecek ürün bulunamadı."}
                </div>
              )}
            </div>
            <div className="table-footer">
              <span>{shown.length} ürün gösteriliyor</span>
              <span>
                <i className="small-dot" /> 4 saniyede bir güncellenir
              </span>
            </div>
          </section>
          <section id="sales" className="recent">
            <div>
              <h2>Son satışlar</h2>
              <p>Her satışın kaydı burada.</p>
            </div>
            <div className="recent-items">
              {summary?.recent.length ? (
                summary.recent.map((s) => (
                  <div className="recent-item" key={s.id}>
                    <span className="icon-box mint">
                      <ArrowDownRight size={18} />
                    </span>
                    <div>
                      <b>{s.productName}</b>
                      <small>
                        {s.quantity} adet ·{" "}
                        {new Date(s.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {s.synced ? "Buluta aktarıldı" : "Yerelde kayıtlı"}
                      </small>
                    </div>
                    <strong>{money(s.quantity * s.unitPriceCents)}</strong>
                  </div>
                ))
              ) : (
                <div className="empty-sales">
                  <Leaf size={20} /> Yeni bir gün, temiz bir başlangıç. İlk
                  satışınız burada görünecek.
                </div>
              )}
            </div>
          </section>
          <footer>
            markas<span>.</span> <span>Mağazanızın günlük ritmi.</span>
            <span className="ml-auto">MVP · Tek mağaza</span>
          </footer>
        </div>
      </main>
      {editor && (
        <Modal
          title={editor.id ? "Ürünü düzenle" : "Yeni ürün"}
          close={() => setEditor(null)}
        >
          <form onSubmit={save}>
            <div className="form-grid">
              {[
                ["name", "Ürün adı", "text"],
                ["barcode", "Barkod", "text"],
                ["category", "Kategori", "text"],
                ["priceCents", "Satış fiyatı (₺)", "number"],
                ["stock", "Stok (adet)", "number"],
                ["minStock", "Kritik stok sınırı", "number"],
              ].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input
                    required
                    maxLength={key === "name" ? 100 : 40}
                    type={type}
                    min={key === "priceCents" ? 0.01 : 0}
                    max={key === "priceCents" ? 1000000 : 1000000}
                    step={key === "priceCents" ? "0.01" : 1}
                    value={
                      key === "priceCents" ? editor[key] / 100 : editor[key]
                    }
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        [key]:
                          type === "number"
                            ? Math.round(
                                Number(e.target.value) *
                                  (key === "priceCents" ? 100 : 1),
                              )
                            : e.target.value,
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <button className="btn dark w-full mt-6" disabled={busy}>
              {" "}
              {busy ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
            </button>
          </form>
        </Modal>
      )}
      {sale && (
        <Modal title="Satışı tamamla" close={() => setSale(null)}>
          <p className="mb-5">
            {sale.name} · {money(sale.price)}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await action(
                  () =>
                    api("sales", {
                      method: "POST",
                      body: JSON.stringify({
                        id: sale.id,
                        productId: sale.productId,
                        quantity: sale.quantity,
                      }),
                    }),
                  "Satış SQLite üzerine kaydedildi.",
                )
              )
                setSale(null);
            }}
          >
            <label>
              Adet
              <input
                type="number"
                required
                min="1"
                max={Math.min(sale.stock, 1000)}
                value={sale.quantity}
                onChange={(e) =>
                  setSale({ ...sale, quantity: Number(e.target.value) })
                }
              />
            </label>
            <div className="sale-total">
              Toplam <b>{money(sale.price * sale.quantity)}</b>
            </div>
            <button disabled={busy} className="btn dark w-full">
              {busy ? "Kaydediliyor…" : "Satışı kaydet"}
            </button>
            <p className="text-sm text-slate-500 mt-3">
              Bağlantı hatasında aynı pencere üzerinden tekrar deneyin. İşlem
              kimliği korunur.
            </p>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal title="Ürün silinsin mi?" close={() => setDeleting(null)}>
          <p>{deleting.name} tablodan kaldırılacak. Geçmiş satışlar korunur.</p>
          <button
            disabled={busy}
            className="btn dark mt-6 w-full"
            onClick={async () => {
              if (
                await action(
                  () =>
                    api(`products/${deleting.id}?version=${deleting.version}`, {
                      method: "DELETE",
                    }),
                  "Ürün kaldırıldı.",
                )
              )
                setDeleting(null);
            }}
          >
            Ürünü sil
          </button>
        </Modal>
      )}
    </div>
  );
}
function Modal({ title, close, children }) {
  useEffect(() => {
    const previous = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const items = [
          ...document.querySelectorAll(
            '[role="dialog"] button,[role="dialog"] input',
          ),
        ].filter((x) => !x.disabled);
        if (e.shiftKey && document.activeElement === items[0]) {
          e.preventDefault();
          items.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document
      .querySelector('[role="dialog"] input,[role="dialog"] button')
      ?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="modal-title">{title}</h2>
          <button onClick={close} aria-label="Kapat">
            <X size={21} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
