// src/app/pesanan/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Client-side "detail order + fake tracking" page
 * - fetches order from /api/pesanan/[id] (if exists)
 * - generates deterministic fake route & locations for given id
 * - displays progress, timeline, and a simple SVG map-like visualization
 */

/* ---------- Helpers ---------- */

function seededRandom(seed: string) {
    // simple deterministic RNG from string
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return function () {
        h += 0x6D2B79F5;
        let t = Math.imul(h ^ (h >>> 15), 1 | h);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// small list of fake place names (Indonesia flavored)
const PLACE_NAMES = [
    "Gudang Jakarta Utara",
    "Pusat Logistik Bekasi",
    "Sorting Cikarang",
    "Depo Bandung",
    "Sentra Pengiriman Surabaya",
    "Cabang Semarang",
    "Transit Yogyakarta",
    "Area Pengantaran Depok",
    "Dropzone Tangerang",
    "Kurir Lokal"
];

function generateFakeRoute(orderId: string, points = 5) {
    // deterministic from orderId
    const rnd = seededRandom(String(orderId));
    // base coordinates (Jakarta center) — small offsets to simulate route
    const baseLat = -6.200000;
    const baseLng = 106.816666;
    const route: { lat: number; lng: number; place: string; ts: string }[] = [];
    const now = Date.now();

    for (let i = 0; i < points; i++) {
        // small jitter dependent on rnd
        const lat = baseLat + (rnd() - 0.5) * 0.5 + (i * 0.02);
        const lng = baseLng + (rnd() - 0.5) * 0.7 + (i * 0.03);
        const place = PLACE_NAMES[Math.floor(rnd() * PLACE_NAMES.length)];
        // timestamps earlier for previous steps
        const ts = new Date(now - (points - i - 1) * 1000 * 60 * (30 + Math.floor(rnd() * 100))).toISOString();
        route.push({ lat, lng, place, ts });
    }
    return route;
}

function currentStepFromStatus(status?: string, routeLen = 5) {
    if (!status) return 0;
    const map: Record<string, number> = {
        created: 0,
        pending: 0,
        dibuat: 0,
        diproses: 1,
        processed: 1,
        dikirim: 2,
        shipped: 2,
        selesai: 3,
        done: 3,
    };
    const key = (status || "").toLowerCase();
    return map[key] ?? Math.min(routeLen - 1, 0);
}

/* ---------- Component ---------- */

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [route, setRoute] = useState<{ lat: number; lng: number; place: string; ts: string }[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        // normalize id to a single string (use first element if array)
        const orderId = Array.isArray(id) ? id[0] : id;
        if (!orderId) return;
        setLoading(true);

        // try fetch order from API
        fetch(`/api/pesanan/${encodeURIComponent(orderId)}`)
            .then(async (res) => {
                if (!res.ok) {
                    // not found — still generate fake route so user can test tracking
                    return null;
                }
                return res.json();
            })
            .then((d) => {
                setOrder(d);
            })
            .catch((e) => {
                console.error("fetch order error", e);
                setOrder(null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        const orderId = Array.isArray(id) ? id[0] : id;
        if (!orderId) return;
        const idStr = String(orderId);
        const r = generateFakeRoute(idStr, 5 + (idStr.length % 3));
        setRoute(r);
        // active index = last step by default (simulate where it is)
        setActiveIndex(r.length - 1);
    }, [id]);

    // determine current step from real order status if exists else from route
    const steps = ["Dibuat", "Diproses", "Dikirim", "Selesai"];
    const currentStep = order ? Math.max(0, currentStepFromStatus(order.Status, steps.length)) : Math.max(0, Math.floor((route.length - 1) * 0.6));

    // map bounds for simple SVG projection (normalize lat/lng to box)
    const lats = route.map((p) => p.lat);
    const lngs = route.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    function project(lat: number, lng: number, w = 600, h = 200) {
        // handle degenerate case
        const latSpan = Math.max(0.0001, maxLat - minLat);
        const lngSpan = Math.max(0.0001, maxLng - minLng);
        const x = ((lng - minLng) / lngSpan) * (w - 40) + 20;
        // invert lat to y
        const y = ((maxLat - lat) / latSpan) * (h - 40) + 20;
        return { x, y };
    }

    if (loading) return <div style={{ padding: 24 }}>Memuat pesanan…</div>;
    if (!order && !route.length) return <div style={{ padding: 24 }}>Pesanan tidak ditemukan.</div>;

    return (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Pesanan #{id}</h2>
                <div>
                    <button onClick={() => router.back()} className="btn-pink" style={{ marginRight: 8 }}>Kembali</button>
                    <button onClick={() => window.location.reload()} style={{ background: "white", border: "1px solid var(--pink-soft)", color: "var(--pink-primary)", padding: "6px 10px", borderRadius: 8 }}>Segarkan</button>
                </div>
            </div>

            <div className="card" style={{ padding: 16, marginTop: 12 }}>
                <h4>Status Pengiriman</h4>

                {/* Progress bar */}
                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    {steps.map((s, i) => {
                        const done = i <= currentStep;
                        return (
                            <div key={s} style={{ textAlign: "center", flex: 1 }}>
                                <div style={{
                                    height: 12,
                                    borderRadius: 999,
                                    background: done ? "var(--pink-primary)" : "#e5e7eb",
                                    transition: "background .2s"
                                }} />
                                <div style={{ marginTop: 8 }}>{s}</div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: 12, color: "#6b7280" }}>
                    {order ? (
                        <>
                            <div><b>Status server:</b> {order.Status ?? "pending"}</div>
                            <div><b>Tanggal pesan:</b> {new Date(order.Tanggal_Pesan ?? order.Tanggal ?? Date.now()).toLocaleString("id-ID")}</div>
                            <div><b>Alamat:</b> {order.Alamat ?? "-"}</div>
                        </>
                    ) : (
                        <div>Data pesanan tidak tersedia di server — menampilkan tracking demo berdasarkan ID.</div>
                    )}
                </div>
            </div>

            {/* Map-like visualization */}
            <div className="card" style={{ marginTop: 12, padding: 16 }}>
                <h4>Lokasi & Jalur (demo)</h4>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 300 }}>
                        <svg width="100%" height={240} viewBox={`0 0 600 240`} style={{ borderRadius: 8, background: "#fff" }}>
                            {/* polyline for route */}
                            <polyline
                                fill="none"
                                stroke="#fbcfe8"
                                strokeWidth={4}
                                points={route.map((p) => {
                                    const pt = project(p.lat, p.lng, 600, 240);
                                    return `${pt.x},${pt.y}`;
                                }).join(" ")}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* nodes */}
                            {route.map((p, i) => {
                                const pt = project(p.lat, p.lng, 600, 240);
                                const isActive = i === activeIndex;
                                return (
                                    <g key={i}>
                                        <circle cx={pt.x} cy={pt.y} r={isActive ? 8 : 6} fill={isActive ? "var(--pink-primary)" : "#fff"} stroke={isActive ? "#fff" : "#f472b6"} strokeWidth={isActive ? 3 : 2} />
                                        <text x={pt.x + 10} y={pt.y + 4} fontSize={11} fill="#374151">{p.place}</text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    <div style={{ width: 320, minWidth: 260 }}>
                        <h5>Timeline Lokasi</h5>
                        <div style={{ display: "grid", gap: 8 }}>
                            {route.map((p, i) => (
                                <div key={i} onMouseEnter={() => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(route.length - 1)} style={{ padding: 10, borderRadius: 8, background: i === activeIndex ? "#fff1f7" : "#fff", border: "1px solid #fde8f2", cursor: "pointer" }}>
                                    <div style={{ fontWeight: 700 }}>{p.place}</div>
                                    <div style={{ fontSize: 13, color: "#6b7280" }}>{new Date(p.ts).toLocaleString("id-ID")}</div>
                                    <div style={{ fontSize: 13, color: "#374151", marginTop: 6 }}>Koordinat: {p.lat.toFixed(5)}, {p.lng.toFixed(5)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 12, color: "#6b7280" }}>
                    Tip: Arahkan mouse ke timeline untuk melihat titik di peta.
                </div>
            </div>

            {/* Products & info */}
            <div className="card" style={{ marginTop: 12, padding: 16 }}>
                <h4>Produk</h4>
                <div>
                    {(order?.Items ?? order?.Produk ?? []).map((p: any, idx: number) => (
                        <div key={p.ID_Item ?? p.ID_Produk ?? idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                            <div style={{ maxWidth: 560 }}>
                                <div style={{ fontWeight: 700 }}>{p.Produk?.Nama_Produk ?? p.Nama_Produk ?? p.Nama ?? "-"}</div>
                                <div style={{ fontSize: 13, color: "#6b7280" }}>{p.Kuantitas ?? p.Jumlah ?? p.Kuantitas ?? 1} × Rp{Number(p.Harga_Unit ?? p.Harga ?? p.Harga_Saat_Itu ?? 0).toLocaleString("id-ID")}</div>
                            </div>
                            <div style={{ fontWeight: 700 }}>Rp{(Number(p.Subtotal ?? (p.Harga_Unit ?? p.Harga ?? 0)) * Number(p.Kuantitas ?? p.Jumlah ?? 1)).toLocaleString("id-ID")}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
