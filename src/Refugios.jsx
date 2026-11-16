import { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/refugios/';

export default function Refugios() {
  const [refugios, setRefugios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    ciudad: ''
  });

  useEffect(() => {
    const fetchRefugios = async () => {
      setCargando(true);
      try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error("No se pudo cargar los refugios");
        setRefugios(await respuesta.json());
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    fetchRefugios();
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
      if (!respuesta.ok) throw new Error("Error al registrar el refugio");
      setRefugios([...refugios, await respuesta.json()]);
      setForm({ nombre: '', direccion: '', telefono: '', ciudad: '' });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este refugio?")) return;
    try {
      const respuesta = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      if (!respuesta.ok) throw new Error("No se pudo eliminar");
      setRefugios(refugios.filter(r => r.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando && refugios.length === 0) return <p>🔄 Cargando refugios...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🏠 Refugios</h2>

      {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Registrar nuevo refugio</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
            <input type="text" name="nombre" placeholder="Nombre del refugio" value={form.nombre} onChange={handleChange} required />
            <input type="text" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} required />
            <input type="text" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
            <input type="text" name="ciudad" placeholder="Ciudad" value={form.ciudad} onChange={handleChange} required />
          </div>
          <button type="submit" disabled={cargando} style={{ padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>
            {cargando ? 'Guardando...' : '✅ Registrar Refugio'}
          </button>
        </form>
      </div>

      <h3>Lista de refugios</h3>
      {refugios.length === 0 ? (
        <p>No hay refugios registrados.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#eee' }}>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Nombre</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Dirección</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Teléfono</th>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Ciudad</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {refugios.map(r => (
              <tr key={r.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{r.nombre}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{r.direccion}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{r.telefono}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{r.ciudad}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                  <button onClick={() => handleEliminar(r.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}