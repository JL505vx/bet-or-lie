console.log("✅ Script cargado correctamente");

// 🎮 --- MENÚ PRINCIPAL ---

document.getElementById("local-btn").addEventListener("click", () => {
  swordTransition("juegolocal.html");
});

document.getElementById("online-btn").addEventListener("click", () => {
  alert("🌐 El modo Online está en desarrollo.\n¡Pronto podrás desafiar a otros piratas reales!");
});

document.getElementById("tbtn").addEventListener("click", () => {
  swordTransition("tutorial.html");
});



// ⚔️ --- EFECTO DE TRANSICIÓN TIPO ESPADA ---
function swordTransition(destino) {
  const sword = document.createElement("div");
  sword.style.position = "fixed";
  sword.style.inset = "0";
  sword.style.background = "linear-gradient(90deg, rgba(255,255,255,0.7), transparent)";
  sword.style.animation = "slashOut 0.6s ease-out forwards";
  sword.style.zIndex = "9999";
  sword.style.pointerEvents = "none";
  document.body.appendChild(sword);

  const sound = new Audio("https://cdn.pixabay.com/download/audio/2023/05/04/audio_aa418c7e64.mp3?filename=sword-slice-103233.mp3");
  sound.volume = 0.4;
  sound.play();

  setTimeout(() => {
    window.location.href = destino;
  }, 600);

  setTimeout(() => {
    sword.remove();
  }, 1200);
}

// ⚙️ --- ANIMACIÓN CSS DE LA ESPADA ---
const style = document.createElement("style");
style.textContent = `
@keyframes slashOut {
  0% { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); opacity: 1; }
  50% { clip-path: polygon(0 0, 50% 50%, 100% 50%, 100% 100%, 0 100%); opacity: 0.9; }
  100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); opacity: 0; }
}`;
document.head.appendChild(style);
