import React, { useEffect, useRef, useState } from 'react';

/* ─── Status config ─── */
const STATUS_STEPS = [
  { key: 'placed',     label: 'Order Placed',    icon: '🛍️', desc: 'Your order has been confirmed' },
  { key: 'processing', label: 'Processing',       icon: '⚙️', desc: 'Being packed at our warehouse' },
  { key: 'shipped',    label: 'Shipped',          icon: '🚚', desc: 'Out for delivery' },
  { key: 'delivered',  label: 'Delivered',        icon: '✅', desc: 'Package delivered successfully' },
];

function getStepIndex(status) {
  if (status === 'Processing') return 1;
  if (status === 'Shipped')    return 2;
  if (status === 'Delivered')  return 3;
  return 0;
}

/* ─── SVG icons for markers ─── */
const TRUCK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" width="64" height="40">
  <rect x="2" y="10" width="38" height="22" rx="4" fill="#e91e8c"/>
  <polygon points="40,14 56,14 60,22 60,32 40,32" fill="#c2185b"/>
  <rect x="42" y="16" width="12" height="10" rx="2" fill="#80deea"/>
  <circle cx="12" cy="34" r="6" fill="#333"/>
  <circle cx="12" cy="34" r="3" fill="#aaa"/>
  <circle cx="48" cy="34" r="6" fill="#333"/>
  <circle cx="48" cy="34" r="3" fill="#aaa"/>
  <rect x="4" y="14" width="8" height="6" rx="1" fill="#80deea"/>
</svg>`;

const WAREHOUSE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <polygon points="20,2 38,14 38,38 2,38 2,14" fill="#7c3aed"/>
  <rect x="14" y="22" width="12" height="16" fill="#5b21b6"/>
  <rect x="16" y="8" width="8" height="8" fill="#ddd6fe"/>
</svg>`;

const HOME_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <polygon points="20,2 38,18 32,18 32,38 8,38 8,18 2,18" fill="#10b981"/>
  <rect x="14" y="24" width="12" height="14" fill="#065f46"/>
  <rect x="17" y="12" width="6" height="6" fill="#d1fae5"/>
</svg>`;

/* ─── Route points ─── */
const WAREHOUSE = [13.0827, 80.2707];
const DELIVERY  = [13.0604, 80.2496];
const STEPS_COUNT = 200;

function buildRoutePoints() {
  const points = [];
  for (let i = 0; i <= STEPS_COUNT; i++) {
    const t = i / STEPS_COUNT;
    const curve = Math.sin(t * Math.PI) * 0.008;
    points.push([
      WAREHOUSE[0] + (DELIVERY[0] - WAREHOUSE[0]) * t + curve,
      WAREHOUSE[1] + (DELIVERY[1] - WAREHOUSE[1]) * t,
    ]);
  }
  return points;
}

const routePoints = buildRoutePoints();

/* ─── TrackingMap component ─── */
function TrackingMap({ order }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const animFrameRef = useRef(null);
  const [truckProgress, setTruckProgress] = useState(0);

  const stepIndex = getStepIndex(order.status);

  // Inject Leaflet CSS
  useEffect(() => {
    if (document.getElementById('leaflet-css')) return;
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  // Init map and animate
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [(WAREHOUSE[0] + DELIVERY[0]) / 2, (WAREHOUSE[1] + DELIVERY[1]) / 2],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      // Warehouse marker
      L.marker(WAREHOUSE, {
        icon: L.divIcon({ html: WAREHOUSE_SVG, className: '', iconSize: [40, 40], iconAnchor: [20, 40] }),
      }).addTo(map).bindPopup('<b>📦 Hikari Warehouse</b><br/>Chennai, TN');

      // Home marker
      L.marker(DELIVERY, {
        icon: L.divIcon({ html: HOME_SVG, className: '', iconSize: [40, 40], iconAnchor: [20, 40] }),
      }).addTo(map).bindPopup('<b>🏠 Delivery Address</b>');

      // Route line
      L.polyline(routePoints, { color: '#e91e8c', weight: 3, dashArray: '8 6', opacity: 0.7 }).addTo(map);

      // Truck marker
      const truck = L.marker(routePoints[0], {
        icon: L.divIcon({ html: TRUCK_SVG, className: '', iconSize: [64, 40], iconAnchor: [32, 40] }),
        zIndexOffset: 1000,
      }).addTo(map).bindPopup('<b>🚚 Your Order</b><br/>En route!');

      mapInstanceRef.current = map;

      // Target based on status
      const targetProgress = stepIndex === 0 ? 0.02 : stepIndex === 1 ? 0.15 : stepIndex === 2 ? 0.65 : 1.0;

      let current = 0;
      const speed = 0.003;

      const animate = () => {
        if (cancelled) return;
        if (current >= targetProgress) {
          current = targetProgress;
          const idx = Math.min(Math.floor(current * STEPS_COUNT), STEPS_COUNT);
          truck.setLatLng(routePoints[idx]);
          setTruckProgress(Math.round(current * 100));
          return;
        }
        current = Math.min(current + speed, targetProgress);
        const idx = Math.min(Math.floor(current * STEPS_COUNT), STEPS_COUNT);
        truck.setLatLng(routePoints[idx]);
        setTruckProgress(Math.round(current * 100));
        animFrameRef.current = requestAnimationFrame(animate);
      };

      setTimeout(() => {
        if (!cancelled) animFrameRef.current = requestAnimationFrame(animate);
      }, 600);
    });

    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stepIndex]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapRef} style={{ height: 300, width: '100%', borderRadius: 16, overflow: 'hidden', zIndex: 1 }} />
      <div style={{
        position: 'absolute', bottom: 12, left: 12, right: 12,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
        borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)', zIndex: 999,
      }}>
        <span style={{ fontSize: 18 }}>🚚</span>
        <div style={{ flex: 1 }}>
          <div style={{ height: 6, background: '#fce7f3', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${truckProgress}%`,
              background: 'linear-gradient(90deg, #ec4899, #e11d8c)',
              borderRadius: 4, transition: 'width 0.1s linear',
            }} />
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#db2777', minWidth: 36 }}>{truckProgress}%</span>
      </div>
    </div>
  );
}

/* ─── Main OrderTracker Modal ─── */
export default function OrderTracker({ order, onClose }) {
  const stepIndex = getStepIndex(order.status);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,8,20,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1a1525 0%, #0f0c1a 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 20, width: '100%', maxWidth: 620,
          maxHeight: '90vh', overflowY: 'auto', color: '#f8f4f0', position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #be185d, #7c3aed)',
          borderRadius: '20px 20px 0 0', padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>LIVE TRACKING</p>
            <h2 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800 }}>Order #{order.orderId}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700,
            }}>{order.status}</span>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Live Map */}
          <TrackingMap order={order} />

          {/* Location labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, marginBottom: 24, fontSize: 12, color: 'rgba(248,244,240,0.5)' }}>
            <span>📦 Hikari Warehouse, Chennai</span>
            <span>🏠 Your Address</span>
          </div>

          {/* Timeline Steps */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(248,244,240,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Delivery Progress
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {STATUS_STEPS.map((step, i) => {
                const done   = i <= stepIndex;
                const active = i === stepIndex;
                const isLast = i === STATUS_STEPS.length - 1;

                return (
                  <div key={step.key}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: done ? (active ? 'linear-gradient(135deg, #ec4899, #7c3aed)' : 'rgba(16,185,129,0.2)') : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${done ? (active ? '#ec4899' : '#10b981') : 'rgba(255,255,255,0.1)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                          boxShadow: active ? '0 0 16px rgba(236,72,153,0.5)' : 'none',
                          transition: 'all 0.4s', position: 'relative',
                        }}>
                          {done && !active ? '✓' : step.icon}
                          {active && (
                            <div style={{
                              position: 'absolute', inset: -4, borderRadius: '50%',
                              border: '2px solid rgba(236,72,153,0.4)',
                              animation: 'orderTrackerPing 1.5s ease-in-out infinite',
                            }} />
                          )}
                        </div>
                        {!isLast && (
                          <div style={{
                            width: 2, height: 40,
                            background: i < stepIndex ? 'linear-gradient(180deg, #10b981, #3b82f6)' : 'rgba(255,255,255,0.08)',
                            margin: '4px 0', transition: 'background 0.5s',
                          }} />
                        )}
                      </div>
                      <div style={{ paddingTop: 10, flex: 1 }}>
                        <p style={{
                          margin: 0, fontWeight: active ? 800 : 600, fontSize: 15,
                          color: done ? (active ? '#f9a8d4' : '#6ee7b7') : 'rgba(248,244,240,0.3)',
                        }}>{step.label}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: done ? 'rgba(248,244,240,0.5)' : 'rgba(248,244,240,0.2)' }}>{step.desc}</p>
                        {active && (
                          <span style={{
                            display: 'inline-block', marginTop: 6,
                            background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)',
                            color: '#f9a8d4', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                          }}>● CURRENT STATUS</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '16px',
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(248,244,240,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Order Details
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.products.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'rgba(248,244,240,0.8)' }}>{p.name} <span style={{ color: 'rgba(248,244,240,0.4)' }}>×{p.quantity}</span></span>
                  <span style={{ color: '#f9a8d4', fontWeight: 700 }}>₹{p.price * p.quantity}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: '#f8f4f0' }}>Total</span>
                <span style={{ color: '#ec4899', fontWeight: 800, fontSize: 16 }}>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {order.status === 'Delivered' && (
            <div style={{
              marginTop: 16, background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 12, padding: '14px 18px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎉</p>
              <p style={{ color: '#6ee7b7', fontWeight: 700, fontSize: 14, margin: 0 }}>Your order has been delivered!</p>
              <p style={{ color: 'rgba(248,244,240,0.5)', fontSize: 12, margin: '4px 0 0' }}>Thank you for shopping with Hikari's Luxe</p>
            </div>
          )}
        </div>

        <style>{`
          @keyframes orderTrackerPing {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
