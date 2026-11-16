import Refugios from './Refugios'
import Mascotas from './Mascotas'

function App() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>🐶 Huellitas - Refugio de Mascotas 🐱</h1>
      <Refugios />
      <hr style={{ margin: '40px 0' }} />
      <Mascotas />
    </div>
  )
}

export default App
