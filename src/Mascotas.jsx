import { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/mascotas/';
const REFUGIOS_URL = 'http://127.0.0.1:8000/api/refugios/';

export default function Mascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    tipo: '',
    edad: '',
    descripcion: '',
    refugio: ''
  });

  useEffect(() => {
    const fetchDatos = async () => {
      setCargando(true);
      try {
        const resMascotas = await fetch(API_URL);
        if (!resMascotas.ok) throw new Error("No se pudieron cargar las mascotas");
        setMascotas(await resMascotas.json());

        const resRefugios = await fetch(REFUGIOS_URL);
        if (!resRefugios.ok) throw new Error("No se pudieron cargar los refugios");
        setRefugios(await resRefugios.json());

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    fetchDatos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!respuesta.ok) throw new Error("Error al registrar la mascota");
      setMascotas([...mascotas, await respuesta.json()]);
      setForm({ nombre: '', tipo: '', edad: '', descripcion: '', refugio: '' });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta mascota?")) return;
    try {
      const respuesta = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      if (!respuesta.ok) throw new Error("No se pudo eliminar");
      setMascotas(mascotas.filter(m => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando && mascotas.length === 0) return <p>🔄 Cargando mascotas...</p>;
  if (error) return <p style={{ color: 'red' }}>❌ Error: {error}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🐾 Mascotas en Adopción</h2>

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Registrar nueva mascota</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
            <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
            <input type="text" name="tipo" placeholder="Tipo (perro, gato...)" value={form.tipo} onChange={handleChange} required />
            <input type="number" name="edad" placeholder="Edad" value={form.edad} onChange={handleChange} required />
            <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
            <select name="refugio" value={form.refugio} onChange={handleChange} required>
              <option value="">-- Selecciona un refugio --</option>
              {refugios.map(r => (<option key={r.id} value={r.id}>{r.nombre}</option>))}
            </select>
          </div>
          <button type="submit" disabled={cargando} style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
            {cargando ? 'Guardando...' : '✅ Registrar'}
          </button>
        </form>
      </div>

      <h3>Lista de mascotas</h3>
      {mascotas.length === 0 ? (<p>No hay mascotas registradas.</p>) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {mascotas.map(m => (
            <div key={m.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
              <h4>{m.nombre}</h4>
              <p><strong>Tipo:</strong> {m.tipo}</p>
              <p><strong>Edad:</strong> {m.edad} años</p>
              <p><strong>Refugio:</strong> {m.nombre_refugio}</p>
              <p>{m.descripcion}</p>
              <button onClick={() => handleEliminar(m.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                🗑️ Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
