"use client";

import { useEffect, useState, useRef } from "react";

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  vendor: { name: string };
}

export default function LojasPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores(city?: string) {
    setLoading(true);
    const url = city ? `/api/stores?city=${encodeURIComponent(city)}` : "/api/stores";
    const res = await fetch(url);
    const data = await res.json();
    setStores(data.stores || []);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchStores(search || undefined);
  }

  function openInGoogleMaps(store: Store) {
    if (store.lat && store.lng) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`,
        "_blank"
      );
    } else {
      const query = `${store.address}, ${store.city}, ${store.state}`;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
        "_blank"
      );
    }
  }

  function getDirections(store: Store) {
    if (store.lat && store.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`,
        "_blank"
      );
    } else {
      const query = `${store.address}, ${store.city}, ${store.state}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`,
        "_blank"
      );
    }
  }

  // Stores with coordinates for the map view
  const storesWithCoords = stores.filter((s) => s.lat && s.lng);

  function getMapEmbedUrl() {
    if (selectedStore && selectedStore.lat && selectedStore.lng) {
      return `https://www.google.com/maps?q=${selectedStore.lat},${selectedStore.lng}&z=15&output=embed`;
    }
    if (storesWithCoords.length > 0) {
      // Center on the first store
      const s = storesWithCoords[0];
      return `https://www.google.com/maps?q=${s.lat},${s.lng}&z=12&output=embed`;
    }
    return null;
  }

  const mapUrl = getMapEmbedUrl();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Encontrar Lojas</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cidade..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
        >
          Buscar
        </button>
      </form>

      {/* Toggle mapa */}
      {storesWithCoords.length > 0 && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowMap(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              !showMap
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setShowMap(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              showMap
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Mapa
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🏪</div>
          <p className="text-gray-500">Nenhuma loja encontrada</p>
        </div>
      ) : showMap ? (
        /* Vista do mapa */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div ref={mapRef} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {mapUrl ? (
                <iframe
                  width="100%"
                  height="300"
                  className="sm:h-[450px]"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapUrl}
                />
              ) : (
                <div className="flex items-center justify-center h-[300px] sm:h-[450px] text-gray-400">
                  Nenhuma loja com coordenadas cadastradas
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {stores.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition hover:shadow-md ${
                  selectedStore?.id === store.id
                    ? "ring-2 ring-emerald-500 border-emerald-300"
                    : ""
                }`}
              >
                <h3 className="font-bold text-gray-800 text-sm">{store.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{store.address}</p>
                <p className="text-xs text-gray-500">
                  {store.city} - {store.state}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openInGoogleMaps(store);
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    Ver no Maps
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      getDirections(store);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Como chegar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Vista de lista */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition"
            >
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                {store.name}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{store.address}</p>
                <p>
                  {store.city} - {store.state}
                </p>
                {store.phone && <p>{store.phone}</p>}
                <p className="text-xs text-gray-400">
                  Vendedor: {store.vendor.name}
                </p>
              </div>

              {/* Mini mapa preview */}
              {store.lat && store.lng && (
                <div className="mt-3 rounded-lg overflow-hidden border">
                  <iframe
                    width="100%"
                    height="150"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${store.lat},${store.lng}&z=15&output=embed`}
                  />
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`/cliente/comprar?storeId=${store.id}`}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                >
                  Comprar
                </a>
                <button
                  onClick={() => openInGoogleMaps(store)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                >
                  Ver no Maps
                </button>
                <button
                  onClick={() => getDirections(store)}
                  className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                >
                  Como chegar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
