import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [mensaje, setMensaje] = useState('Cargando...');

  useEffect(() => {
    axios
      .get('http://localhost:3000/')
      .then((res) => setMensaje(res.data))
      .catch(() => setMensaje('Error de conexion'));
  }, []);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#007bff',
        color: 'white',
        fontSize: '2rem',
        fontWeight: 'bold',
      }}
    >
      {mensaje}
    </div>
  );
}

export default App;
