const introText = document.getElementById("intro-text");
const playerInput = document.getElementById("player-name");
const nextBtn = document.getElementById("next-btn");
const introSound = document.getElementById("intro-sound");

let step = 0;
let playerName = "";

const pirateLines = [
  "☠️ ¡Ahoy, marinero! Has llegado al juego de la suerte y el honor... 💀",
  "Pero antes de apostar tu alma... dime, ¿cómo te llamas, pirata? 🏴‍☠️",
];

function typeEffect(text, callback) {
  introText.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    introText.innerHTML += text.charAt(i);
    i++;
    if (i === text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 40);
}

function nextDialogue() {
  if (step === 0) {
    typeEffect(pirateLines[0], () => setTimeout(() => {
      step++;
      nextDialogue();
    }, 2000));
  } 
  else if (step === 1) {
    typeEffect(pirateLines[1], () => {
      playerInput.style.display = "block";
      playerInput.focus();
    });
  } 
  else if (step === 2) {
    playerName = playerInput.value.trim() || "Pirata sin nombre";
    playerInput.style.display = "none";
    typeEffect(`Bienvenido, ${playerName} ¿Listo para apostar tu 
        alma y vendérsela a Renna? MUA A A A 💀`, () => {
      nextBtn.textContent = "⚓ Continuar";
      nextBtn.style.display = "inline-block";
    });
  } 
  else if (step === 3) {
    // Selección de rondas
    showRoundSelection();
  } 
  else if (step === 4) {
    // Selección de dificultad
    showDifficultySelection();
  }
}

function showRoundSelection() {
  nextBtn.style.display = "none";
  introText.innerHTML = `
    <strong>${playerName}</strong>, elige cuántas rondas deseas jugar:<br><br>
    <button class="round-btn" data-rounds="3">⚔️ 3 Rondas</button>
    <button class="round-btn" data-rounds="5">🏴‍☠️ 5 Rondas</button>
    <button class="round-btn" data-rounds="7">💀 7 Rondas</button>
  `;

  document.querySelectorAll(".round-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const rounds = btn.getAttribute("data-rounds");
      
      // 🧭 Guarda las rondas elegidas
      localStorage.setItem("rondasSeleccionadas", rounds);

      introText.innerHTML = `Has elegido jugar <strong>${rounds}</strong> rondas.<br><br>Ahora elige la dificultad, ${playerName}.`;
      setTimeout(() => {
        step = 4;
        showDifficultySelection();
      }, 1500);
    });
  });
}

function showDifficultySelection() {
  nextBtn.style.display = "none";

  introText.innerHTML = `
    <div class="difficulty-title">
      ⚓ <strong>${playerName}</strong>, selecciona la dificultad:
    </div>

    <div class="difficulty-wrapper">
      <div class="difficulty-container">
        <button class="diff-btn" data-diff="Pirata Novato">🪶 PIRATA NOVATO</button>
        <div class="diff-desc">
          Un marinero que apenas aprendió a tirar los dados.<br>
          La suerte te sonreirá… a veces.
        </div>
      </div>

      <div class="difficulty-container">
        <button class="diff-btn" data-diff="Capitán">🦜 CAPITÁN</button>
        <div class="diff-desc">
          Has surcado mares y vencido tormentas.<br>
          Pero recuerda… el mar siempre cobra su deuda.
        </div>
      </div>

      <div class="difficulty-container">
        <button class="diff-btn" data-diff="Kraken">🐙 KRAKEN</button>
        <div class="diff-desc">
          Solo los locos y los valientes desafían al Kraken.<br>
          No habrá piedad… ni segundas oportunidades.
        </div>
      </div>
    </div>
  `;

  const whisper = new Audio("https://cdn.pixabay.com/download/audio/2023/05/13/audio_d6dce9b5da.mp3?filename=wind-howl-14675.mp3");
  whisper.volume = 0.3;
  whisper.play();

  document.querySelectorAll(".diff-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const diff = btn.getAttribute("data-diff");

      // 🧭 Guarda la dificultad elegida
      localStorage.setItem("dificultadSeleccionada", diff);

      introText.innerHTML = `
        Excelente, <strong>${playerName}</strong>.<br>
        Has elegido la senda de <em>${btn.textContent}</em>.<br><br>
        ¡Que los dados decidan tu destino! 🎲
      `;

      const sound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_9e8cb9b7e6.mp3?filename=coin-collect-6466.mp3");
      sound.volume = 0.4;
      sound.play();

      setTimeout(() => {
        startGameAnimation();
      }, 2500);
    });
  });
}


function startGameAnimation() {
  // 🧭 Guarda también el nombre del jugador por si quieres usarlo en la mesa
  localStorage.setItem("nombreJugador", playerName);

  introText.innerHTML = `
    <img src="assets/ui/Pergament2.png" alt="scroll" style="width:200px;opacity:0.8;"><br>
    <strong>⚔️ Comenzando el juego...</strong><br>
    Las manos se preparan, los dados tintinean... 🎲
  `;

  setTimeout(() => {
    window.location.href = "mesa.html";
  }, 3000);
}


nextBtn.addEventListener("click", () => {
  step++;
  nextDialogue();
});

playerInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    step++;
    nextDialogue();
  }
});

window.onload = () => {
  introSound.play();
  nextDialogue();
};
