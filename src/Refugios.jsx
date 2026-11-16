import { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:8000/api/refugios/';

export default function Refugios() {
  const [refugios, setRefugios] = useState([]);

  useEffect(() => {
    const fetchRefugios = async () => {
      const respuesta = await fetch(API_URL);
      setRefugios(await respuesta.json());
    };
    fetchRefugios();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🏠 Refugios</h2>

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
            </tr>
          </thead>
          <tbody>
            {refugios.map(r => (
              <tr key={r.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{r.nombre}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{r.direccion}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{r.telefono}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{r.ciudad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}