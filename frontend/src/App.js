import { useState } from "react";
import axios from "axios";

const containerStyle = {
  maxWidth: "960px",
  margin: "0 auto",
  padding: "24px",
  fontFamily: "Arial, sans-serif"
};

const listStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px",
  marginTop: "24px"
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "12px",
  backgroundColor: "#fff"
};

function App() {
  const [url, setUrl] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("Ingresa una URL de Instagram.");
      return;
    }

    setLoading(true);
    setError("");
    setItems([]);

    try {
      const response = await axios.post("http://localhost:3000/scrape", {
        url: url.trim()
      });

      setItems(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (requestError) {
      const message =
        requestError.response?.data?.error ||
        "No se pudo scrapear el perfil.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NUEVA FUNCIÓN: DESCARGA ZIP
  const handleDownload = async () => {
    if (!items.length) {
      alert("No hay datos para descargar.");
      return;
    }

    setDownloading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/download",
        { data: items },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "scraping_result.zip");

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error al descargar el ZIP.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main style={containerStyle}>
      <h1>Instagram Scraping Tool</h1>
      <p>Pega el URL del perfil y extrae hasta 10 posts.</p>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.instagram.com/usuario/"
          style={{ flex: "1 1 340px", padding: "10px" }}
        />

        <button
          onClick={handleScrape}
          disabled={loading}
          style={{ padding: "10px 16px" }}
        >
          {loading ? "Scrapeando..." : "Scrapear"}
        </button>

        {/* 🔥 BOTÓN DESCARGA */}
        <button
          onClick={handleDownload}
          disabled={downloading || !items.length}
          style={{ padding: "10px 16px" }}
        >
          {downloading ? "Descargando..." : "Descargar ZIP"}
        </button>
      </div>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      {!loading && items.length === 0 && !error ? (
        <p>Sin resultados todavía.</p>
      ) : null}

      <section style={listStyle}>
        {items.map((item, index) => (
          <article key={`${item.img}-${index}`} style={cardStyle}>
            <img
              src={item.img}
              alt="post"
              style={{
                width: "100%",
                borderRadius: "6px",
                objectFit: "cover"
              }}
            />

            <p>
              <strong>Descripción:</strong>{" "}
              {item.description || "Sin descripción"}
            </p>

            <p>
              <strong>Likes:</strong> {item.likes ?? 0}
            </p>

            <p>
              <strong>Comentarios:</strong> {item.comments ?? 0}
            </p>

            <p>
              <strong>Fecha:</strong> {item.date || "No disponible"}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;