import { useState, useEffect } from 'react';

const API_MASCOTAS = 'http://127.0.0.1:8000/api/mascotas/';
const API_REFUGIOS = 'http://127.0.0.1:8000/api/refugios/';

const FORM_INICIAL = {
  nombre: '',
  tipo: '',
  edad: '',
  descripcion: '',
  estado: 'adopcion',
  ultima_ubicacion: '',
  contacto: '',
  refugio: ''
};

const celda = { padding: '10px', borderBottom: '1px solid #ddd' };

function TablaMascotas({ lista, perdidas, onEliminar }) {
  if (lista.length === 0) {
    return <p>{perdidas ? 'No hay mascotas perdidas reportadas.' : 'No hay mascotas en adopción.'}</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
      <thead>
        <tr style={{ background: '#eee' }}>
          <th style={{ ...celda, textAlign: 'left' }}>Nombre</th>
          <th style={{ ...celda, textAlign: 'left' }}>Tipo</th>
          <th style={{ ...celda, textAlign: 'left' }}>Edad</th>
          <th style={{ ...celda, textAlign: 'left' }}>Descripción</th>
          {perdidas ? (
            <>
              <th style={{ ...celda, textAlign: 'left' }}>Última ubicación</th>
              <th style={{ ...celda, textAlign: 'left' }}>Contacto</th>
            </>
          ) : (
            <th style={{ ...celda, textAlign: 'left' }}>Refugio</th>
          )}
          <th style={{ ...celda, textAlign: 'center' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {lista.map(m => (
          <tr key={m.id}>
            <td style={celda}>{m.nombre}</td>
            <td style={celda}>{m.tipo}</td>
            <td style={celda}>{m.edad}</td>
            <td style={celda}>{m.descripcion}</td>
            {perdidas ? (
              <>
                <td style={celda}>{m.ultima_ubicacion || '-'}</td>
                <td style={celda}>{m.contacto || '-'}</td>
              </>
            ) : (
              <td style={celda}>{m.nombre_refugio || '-'}</td>
            )}
            <td style={{ ...celda, textAlign: 'center' }}>
              <button
                onClick={() => onEliminar(m.id)}
                style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
              >
                🗑️ Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Mascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [resMascotas, resRefugios] = await Promise.all([
          fetch(API_MASCOTAS),
          fetch(API_REFUGIOS)
        ]);
        if (!resMascotas.ok || !resRefugios.ok) throw new Error('No se pudieron cargar los datos');
        setMascotas(await resMascotas.json());
        setRefugios(await resRefugios.json());
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch(API_MASCOTAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          tipo: form.tipo,
          edad: Number(form.edad),
          descripcion: form.descripcion,
          estado: form.estado,
          ultima_ubicacion: form.estado === 'perdida' ? form.ultima_ubicacion : '',
          contacto: form.estado === 'perdida' ? form.contacto : '',
          refugio: form.refugio ? Number(form.refugio) : null
        })
      });
      if (!respuesta.ok) throw new Error('Error al registrar la mascota');
      setMascotas([...mascotas, await respuesta.json()]);
      setForm(FORM_INICIAL);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta mascota?')) return;
    try {
      const respuesta = await fetch(`${API_MASCOTAS}${id}/`, { method: 'DELETE' });
      if (!respuesta.ok) throw new Error('No se pudo eliminar');
      setMascotas(mascotas.filter(m => m.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando) return <p>🔄 Cargando mascotas...</p>;

  const enAdopcion = mascotas.filter(m => m.estado === 'adopcion');
  const perdidas = mascotas.filter(m => m.estado === 'perdida');
  const esPerdida = form.estado === 'perdida';

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🐾 Mascotas</h2>

      {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}

      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Registrar mascota</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="adopcion">En adopción</option>
              <option value="perdida">Perdida</option>
            </select>

            <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
            <input type="text" name="tipo" placeholder="Tipo (perro, gato...)" value={form.tipo} onChange={handleChange} required />
            <input type="number" name="edad" placeholder="Edad" min="0" value={form.edad} onChange={handleChange} required />
            <input type="text" name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />

            {esPerdida && (
              <>
                <input type="text" name="ultima_ubicacion" placeholder="Última ubicación donde se vio" value={form.ultima_ubicacion} onChange={handleChange} required />
                <input type="text" name="contacto" placeholder="Teléfono de contacto" value={form.contacto} onChange={handleChange} required />
              </>
            )}

            <select name="refugio" value={form.refugio} onChange={handleChange} required={!esPerdida}>
              <option value="">
                {esPerdida ? 'Sin refugio (opcional)' : 'Selecciona un refugio'}
              </option>
              {refugios.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>
          <button type="submit" style={{ padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>
            ✅ Registrar Mascota
          </button>
        </form>
      </div>

      <h3>🏡 En adopción</h3>
      <TablaMascotas lista={enAdopcion} perdidas={false} onEliminar={handleEliminar} />

      <h3>🔍 Mascotas perdidas</h3>