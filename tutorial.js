const pasos = [
  {
    texto: "En <strong>BET OR LIE</strong>, el honor y la suerte están en juego.<br><br>Cada jugador lanza sus dados en secreto y declara una apuesta inicial.",
    img: "assets/tutorial/imagen1.jpg"
  },
  {
    texto: "El siguiente jugador puede subir la apuesta o gritar <strong>¡Mentira!</strong>.<br><br>Si mientes, pierdes un dado. Si aciertas, tu rival pierde uno.",
    img: "assets/tutorial/imagen2.jpg"
  },
  {
    texto: "Gana quien conserve sus dados al final.<br><br>Confía en tu suerte... pero nunca en tus enemigos.",
    img: "assets/tutorial/imagen3.jpg"
  },
  {
    texto: "En la imagen de abajo se muestra cómo será el juego.<br><br>Observa bien la mecánica antes de comenzar tu apuesta.",
    img: "assets/tutorial/imagen3.jpg" // puedes cambiar esta a otra imagen final
  }
];

let pasoActual = 0;
const texto = document.getElementById("tutorial-text");
const imagen = document.getElementById("tutorial-image");
const nextBtn = document.getElementById("next-btn");
const volverBtn = document.getElementById("volver");

nextBtn.addEventListener("click", () => {
  texto.style.opacity = 0;
  imagen.style.opacity = 0;

  setTimeout(() => {
    pasoActual++;

    if (pasoActual < pasos.length) {
      texto.innerHTML = pasos[pasoActual].texto;
      imagen.src = pasos[pasoActual].img;
      texto.style.opacity = 1;
      imagen.style.opacity = 1;
    }

    if (pasoActual === pasos.length - 1) {
      nextBtn.style.display = "none";
      volverBtn.style.display = "inline-block";
    }
  }, 400);
});

volverBtn.addEventListener("click", () => {
  const sword = document.createElement('div');
  sword.style.position = 'fixed';
  sword.style.inset = '0';
  sword.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.6), transparent)';
  sword.style.animation = 'slashOut 0.6s ease-out forwards';
  sword.style.zIndex = '100';
  document.body.appendChild(sword);

  const sound = new Audio("https://cdn.pixabay.com/download/audio/2023/05/04/audio_aa418c7e64.mp3?filename=sword-slice-103233.mp3");
  sound.volume = 0.4;
  sound.play();

  setTimeout(() => {
    window.location.href = "juego.html";
  }, 600);
});

// animación de espada
const style = document.createElement('style');
style.textContent = `
@keyframes slashOut {
  0% { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
  50% { clip-path: polygon(0 0, 50% 50%, 100% 50%, 100% 100%, 0 100%); }
  100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); opacity: 0; }
}`;
document.head.appendChild(style);
