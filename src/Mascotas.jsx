import { useState, useEffect } from 'react';

const API_MASCOTAS = 'http://127.0.0.1:8000/api/mascotas/';
const API_REFUGIOS = 'http://127.0.0.1:8000/api/refugios/';

const ADOPCION_INICIAL = { nombre: '', tipo: '', edad: '', descripcion: '', refugio: '' };
const PERDIDA_INICIAL = {
  nombre: '', tipo: '', edad: '', descripcion: '',
  ultima_ubicacion: '', contacto: '', refugio: ''
};

const celda = { padding: '10px', borderBottom: '1px solid #ddd' };
const caja = { padding: '20px', borderRadius: '8px', marginBottom: '30px' };
const boton = { padding: '8px 16px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

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
                style={{ ...boton, background: '#e74c3c', padding: '5px 10px' }}
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
  const [formAdopcion, setFormAdopcion] = useState(ADOPCION_INICIAL);
  const [formPerdida, setFormPerdida] = useState(PERDIDA_INICIAL);

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

  const registrar = async (datos) => {
    const respuesta = await fetch(API_MASCOTAS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!respuesta.ok) throw new Error('Error al registrar la mascota');
    setMascotas(prev => [...prev, null].slice(0, -1));
    return respuesta.json();
  };

  const handleSubmitAdopcion = async (e) => {
    e.preventDefault();
    try {
      const nueva = await registrar({
        nombre: formAdopcion.nombre,
        tipo: formAdopcion.tipo,
        edad: Number(formAdopcion.edad),
        descripcion: formAdopcion.descripcion,
        estado: 'adopcion',
        refugio: Number(formAdopcion.refugio)
      });
      setMascotas(prev => [...prev, nueva]);
      setFormAdopcion(ADOPCION_INICIAL);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitPerdida = async (e) => {
    e.preventDefault();
    try {
      const nueva = await registrar({
        nombre: formPerdida.nombre,
        tipo: formPerdida.tipo,
        edad: Number(formPerdida.edad),
        descripcion: formPerdida.descripcion,
        estado: 'perdida',
        ultima_ubicacion: formPerdida.ultima_ubicacion,
        contacto: formPerdida.contacto,
        refugio: formPerdida.refugio ? Number(formPerdida.refugio) : null
      });
      setMascotas(prev => [...prev, nueva]);
      setFormPerdida(PERDIDA_INICIAL);
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
      setMascotas(prev => prev.filter(m => m.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const cambiarAdopcion = (e) => setFormAdopcion({ ...formAdopcion, [e.target.name]: e.target.value });
  const cambiarPerdida = (e) => setFormPerdida({ ...formPerdida, [e.target.name]: e.target.value });

  if (cargando) return <p>🔄 Cargando mascotas...</p>;

  const enAdopcion = mascotas.filter(m => m.estado === 'adopcion');
  const perdidas = mascotas.filter(m => m.estado === 'perdida');

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🐾 Mascotas</h2>

      {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}

      <div style={{ ...caja, background: '#f5f5f5' }}>
        <h3>🏡 Registrar mascota en adopción</h3>
        <form onSubmit={handleSubmitAdopcion}>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
            <input type="text" name="nombre" placeholder="Nombre" value={formAdopcion.nombre} onChange={cambiarAdopcion} required />
            <input type="text" name="tipo" placeholder="Tipo (perro, gato...)" value={formAdopcion.tipo} onChange={cambiarAdopcion} required />
            <input type="number" name="edad" placeholder="Edad" min="0" value={formAdopcion.edad} onChange={cambiarAdopcion} required />
            <input type="text" name="descripcion" placeholder="Descripción" value={formAdopcion.descripcion} onChange={cambiarAdopcion} required />
            <select name="refugio" value={formAdopcion.refugio} onChange={cambiarAdopcion} required>
              <option value="">Selecciona un refugio</option>
              {refugios.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>
          <button type="submit" style={{ ...boton, background: '#3498db' }}>
            ✅ Registrar para adopción
          </button>
        </form>
      </div>

      <div style={{ ...caja, background: '#fff4e5', border: '1px solid #f0c987' }}>
        <h3>🔍 Reportar mascota perdida</h3>
        <form onSubmit={handleSubmitPerdida}>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
            <input type="text" name="nombre" placeholder="Nombre de la mascota" value={formPerdida.nombre} onChange={cambiarPerdida} required />
            <input type="text" name="tipo" placeholder="Tipo (perro, gato...)" value={formPerdida.tipo} onChange={cambiarPerdida} required />
            <input type="number" name="edad" placeholder="Edad aproximada" min="0" value={formPerdida.edad} onChange={cambiarPerdida} required />
            <input type="text" name="descripcion" placeholder="Descripción (color, raza, señas)" value={formPerdida.descripcion} onChange={cambiarPerdida} required />
            <input type="text" name="ultima_ubicacion" placeholder="Última ubicación donde se vio" value={formPerdida.ultima_ubicacion} onChange={cambiarPerdida} required />
            <input type="text" name="contacto" placeholder="Teléfono de contacto" value={formPerdida.contacto} onChange={cambiarPerdida} required />
            <select name="refugio" value={formPerdida.refugio} onChange={cambiarPerdida}>
              <option value="">Sin refugio (opcional)</option>
              {refugios.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>
          <button type="submit" style={{ ...boton, background: '#e67e22' }}>
            📢 Reportar mascota perdida
          </button>
        </form>
      </div>

      <h3>🏡 En adopción</h3>
      <TablaMascotas lista={enAdopcion} perdidas={false} onEliminar={handleEliminar} />

      <h3>🔍 Mascotas perdidas</h3>
      <TablaMascotas lista={perdidas} perdidas={true} onEliminar={handleEliminar} />
    </div>
  );
}