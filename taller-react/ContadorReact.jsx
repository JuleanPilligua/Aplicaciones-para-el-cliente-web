// 1. Extraer el Hook useState desde React
const { useState } = React;

// 2. Componente con un estado "likes" iniciado en 0
function BotonMeGusta() {
  const [likes, setLikes] = useState(0);

  // 3. Botón que suma 1 al estado en cada clic
  return (
    <button onClick={() => setLikes(likes + 1)}>
      Me gusta (React): {likes}
    </button>
  );
}

// 4. Dibujar el componente dentro del elemento "root"
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<BotonMeGusta />);
