const leftHand = document.querySelector(".left");
const rightHand = document.querySelector(".right");
const cup = document.querySelector(".cup");
const shakeBtn = document.getElementById("shake-btn");
const shakeSound = document.getElementById("shake-sound");
const revealSound = document.getElementById("reveal-sound");

const betPanel = document.getElementById("bet-panel");
const aiBetText = document.getElementById("ai-bet");
const playerDiceDiv = document.getElementById("player-dice");
const raiseBtn = document.getElementById("raise-btn");
const doubtBtn = document.getElementById("doubt-btn");
const revealPanel = document.getElementById("reveal-panel");
const roundEndPanel = document.getElementById("round-end");
const betInputDiv = document.getElementById("player-input");
const betText = document.getElementById("bet-text");
const submitBet = document.getElementById("submit-bet");

// HUD
const hudRound = document.getElementById("hud-round");
const hudTotal = document.getElementById("hud-total");
const hudDifficulty = document.getElementById("hud-difficulty");
const hudPlayerDice = document.getElementById("hud-player-dice");
const hudAIDice = document.getElementById("hud-ai-dice");

let round = 1;
let totalRounds = parseInt(localStorage.getItem("rondasSeleccionadas")) || 5;
let playerLives = 5;
let aiLives = 5;
let difficulty = localStorage.getItem("dificultadSeleccionada") || "Capitán";

// ====================== ⚙️ CONFIGURACIÓN DE DIFICULTAD ======================
let iaConfig = {};

// 🔹 Define comportamiento según dificultad
function setAIBehavior(difficulty) {
  switch (difficulty) {
    case "Pirata Novato":
      iaConfig = {
        doubtChance: 0.25,  // Duda poco
        errorMargin: 0.4,   // Apuesta mal seguido
        personality: "novato"
      };
      break;

    case "Capitán":
      iaConfig = {
        doubtChance: 0.4,   // Duda equilibrado
        errorMargin: 0.2,   // Algo preciso
        personality: "capitan"
      };
      break;

    case "Kraken":
      iaConfig = {
        doubtChance: 0.7,   // Duda mucho
        errorMargin: 0.50,  // Casi perfecto
        personality: "kraken"
      };
      break;
  }
}

setAIBehavior(difficulty);

// 💬 Frases según el tipo de IA
function getAIPhrase(type) {
  const phrases = {
    novato: {
      raise: [
        "😅 Eh... creo que subiré un poco, jeje...",
        "¡Vamos a probar suerte! Digo... ¡estrategia!",
        "Subo a..."
      ],
      doubt: [
        "¿Mientes?... nah, no puede ser... ¿o sí?",
        "¡Mientes! (creo...)",
        "😅 Esto no pinta bien, ¡mientes!"
      ]
    },
    capitan: {
      raise: [
        "⛵ Subo la apuesta, marinero.",
        "Hmm... puedo superar eso.",
        "Vamos a ver si el destino te favorece..."
      ],
      doubt: [
        "No te creo, ¡mientes!",
        "El mar huele a engaño... ¡mientes!",
        "¿Pretendes engañarme? ¡Mientes!"
      ]
    },
    kraken: {
      raise: [
        "🐙 ¡El abismo reclama más! Subo a...",
        "No escaparás, humano. ¡Apuesto más!",
        "Tu miedo alimenta mis apuestas..."
      ],
      doubt: [
        "🐙 ¡Mientes! Y pagarás con tu alma...",
        "Nada escapa a mis ojos del abismo... ¡mientes!",
        "¡Ja! Tu suerte está podrida, mortal. ¡Mientes!"
      ]
    }
  };

  const set = phrases[iaConfig.personality][type];
  return set[Math.floor(Math.random() * set.length)];
}

//-----//

let playerDice = [];
let aiDice = [];
// 🧩 Nuevas variables separadas para guardar las apuestas de ambos
let playerBet = { count: 0, value: 0 };
let machineBet = { count: 0, value: 0 };


let playerName = localStorage.getItem("nombreJugador") || "Pirata";
document.getElementById("hud-player-name").textContent = playerName;


hudDifficulty.textContent = difficulty;
hudRound.textContent = round;
hudTotal.textContent = totalRounds;
hudPlayerDice.textContent = playerLives;
hudAIDice.textContent = aiLives;

// Si tienes una barra o texto con el estado:
const countDisplay = document.getElementById("dice-count-display");
if (countDisplay) {
  countDisplay.innerHTML = `
    <p>💀 <strong>Máquina:</strong> 🎲🎲🎲🎲🎲 (${aiLives})</p>
    <p>🧔 <strong>${playerName}:</strong> 🎲🎲🎲🎲🎲 (${playerLives})</p>
  `;
}

function finDePartida() {
  localStorage.removeItem("rondasSeleccionadas");
  localStorage.removeItem("dificultadSeleccionada");
  localStorage.removeItem("nombreJugador");
}


// Animación inicial
window.onload = () => {
  setTimeout(() => {
    leftHand.style.opacity = 1;
    leftHand.style.transform = "translateX(0)";
    rightHand.style.opacity = 1;
    rightHand.style.transform = "translateX(0)";
  }, 800);

  setTimeout(() => {
    cup.style.opacity = 1;
    cup.style.transform = "translateY(0)";
  }, 1500);
};


// 🎲 Agitar el tarro sin saltar la pantalla en móviles
shakeBtn.addEventListener("click", (event) => {
  event.preventDefault(); // evita comportamiento inesperado en móviles
  shakeBtn.blur();        // ✅ evita el scroll causado por el enfoque del botón

  // 🧭 Mantiene el scroll actual
  const scrollY = window.scrollY;

  shakeBtn.disabled = true;
  shakeBtn.textContent = "🌀 Agitando...";
  shakeSound.currentTime = 0;
  shakeSound.play();

  let rotation = 0;
  const interval = setInterval(() => {
    rotation = rotation === 0 ? 15 : -15;
    cup.style.transform = `rotate(${rotation}deg)`;
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    cup.style.transform = "rotate(0deg)";
    revealSound.play();
    startRound();

    // 🔒 Reancla la vista exactamente al mismo punto
    window.scrollTo(0, scrollY);
  }, 2500);
});



let lastLoser = null; // nuevo: guarda quién perdió la ronda anterior ("player" o "ai")

function startRound() {
  shakeBtn.classList.add("hidden");
  roundEndPanel.classList.add("hidden");
  revealPanel.classList.add("hidden");

  playerDice = Array.from({ length: playerLives }, () => Math.ceil(Math.random() * 6));
  aiDice = Array.from({ length: aiLives }, () => Math.ceil(Math.random() * 6));

  showPlayerDice();

  // ⚖️ decide quién empieza
  if (lastLoser === "player") {
    aiBetText.innerHTML = "💀 Has perdido la ronda anterior, así que comienzas tú.";
    setTimeout(() => playerStartsBet(), 2000);
  } else {
    aiMakeBet();
  }
}

function playerStartsBet() {
  betPanel.classList.remove("hidden");
  betInputDiv.classList.remove("hidden");
  raiseBtn.disabled = true;
  doubtBtn.disabled = true;

  aiBetText.innerHTML = "Haz tu apuesta inicial, capitán.";
}

submitBet.addEventListener("click", () => {
  const text = betText.value.trim().toLowerCase();
  const match = text.match(/(\d+)\s*(\d+)/);

  if (!match) {
    alert("Formato inválido. Ejemplo: 6 5 (seis cincos)");
    return;
  }

  const count = parseInt(match[1]);
  const value = parseInt(match[2]);

  if (value < 1 || value > 6) {
    alert("El valor del dado debe estar entre 1 y 6.");
    return;
  }

  // 🧭 Guarda la apuesta del jugador
  playerBet.count = count;
  playerBet.value = value;

  // 🧩 Si ya había una apuesta anterior de la IA, la conservamos
  if (aiBet && aiBet.count && aiBet.value) {
    machineBet.count = aiBet.count;
    machineBet.value = aiBet.value;
  }

  // 🧩 También actualiza el estado general de la apuesta activa
  aiBet.playerCount = count;
  aiBet.playerValue = value;
  aiBet.count = count;
  aiBet.value = value;

  // 💬 Muestra tu apuesta en pantalla
  aiBetText.innerHTML = `⚔️ Tú apuestas que hay <strong>${count}</strong> dados de <strong>${value}</strong>.`;

  // 🔒 Limpieza visual y control de botones
  betInputDiv.classList.add("hidden");
  raiseBtn.disabled = false;
  doubtBtn.disabled = false;
  betText.value = "";

  // ⚖️ Si tú empezaste, la IA responde; si no, sigue flujo normal
  if (lastLoser === "player") {
    lastLoser = null;
    setTimeout(() => aiRespond(), 2000);
  } else {
    setTimeout(() => aiRespond(), 1500);
  }
});



function showPlayerDice() {
  playerDiceDiv.innerHTML = `
    <p><strong>Tus dados:</strong> ${playerDice.map(n => `🎲${n}`).join(" ")}</p>
  `;
}

function aiMakeBet() {
  const randomValue = Math.ceil(Math.random() * 6);
  const randomCount = Math.ceil(Math.random() * (playerLives + aiLives) / 2);
  aiBet = { count: randomCount, value: randomValue };
  aiBet.aiCount = randomCount;
  aiBet.aiValue = randomValue;

  machineBet.count = randomCount;
  machineBet.value = randomValue;


  aiBetText.innerHTML = `🤖 La máquina apuesta que hay <strong>${randomCount}</strong> dados con el número <strong>${randomValue}</strong>.`;
  betPanel.classList.remove("hidden");
}

raiseBtn.addEventListener("click", () => {
  betInputDiv.classList.remove("hidden");
  raiseBtn.disabled = true;
});

doubtBtn.addEventListener("click", () => {
  revealPanel.classList.remove("hidden");
  revealPanel.innerHTML = "💀 ¡Revelando los dados!...";
  setTimeout(() => animatedReveal(), 1000);
});

function aiRespond() {
  const willDoubt = Math.random() < iaConfig.doubtChance;

  if (willDoubt) {
    let phrase = getAIPhrase("doubt");
    aiBetText.innerHTML = `🤖 ${phrase}`;
    setTimeout(() => animatedReveal(true), 1000);
  } else {
    // IA sube la apuesta
    // Dependiendo de su nivel, a veces se equivoca
    let newCount = aiBet.count + 1;
    let newValue = aiBet.value;

    // En niveles bajos puede fallar en el número elegido
    if (Math.random() < iaConfig.errorMargin) {
      newValue = Math.ceil(Math.random() * 6);
    }

    aiBet = { count: newCount, value: newValue };

    let phrase = getAIPhrase("raise");
    aiBetText.innerHTML = `🤖 ${phrase} <strong>${newCount}</strong> dados de <strong>${newValue}</strong>.`;
  }
}

function difficultyIntro() {
  let introMsg = "";

  if (difficulty === "Pirata Novato")
    introMsg = "🪶 Un joven marinero se une a la mesa... la suerte decidirá.";
  if (difficulty === "Capitán")
    introMsg = "⛵ Un capitán curtido en mil batallas toma asiento.";
  if (difficulty === "Kraken")
    introMsg = "🐙 Desde las profundidades... el Kraken abre sus ojos.";

  const introDiv = document.createElement("div");
  introDiv.classList.add("intro-msg");
  introDiv.innerHTML = introMsg;
  document.body.appendChild(introDiv);

  setTimeout(() => introDiv.remove(), 4000);
}

difficultyIntro();


// 🎬 Animación de revelación
function animatedReveal(aiChallenged = false) {
  const total = [...playerDice, ...aiDice];
  const actualCount = total.filter(n => n === aiBet.value).length;

  revealPanel.innerHTML = `<strong>🎲 Revelación:</strong><br>`;
  let index = 0;

  const revealInterval = setInterval(() => {
    if (index < total.length) {
      revealPanel.innerHTML += `🎲${total[index]} `;
      index++;
      revealSound.currentTime = 0;
      revealSound.play();
    } else {
      clearInterval(revealInterval);
      setTimeout(() => {
        revealOutcome(aiChallenged, actualCount);
      }, 500);
    }
  }, 300);
}

function revealOutcome(aiChallenged, actualCount) {
  let msg = `<br><br>⚓ <strong>Revelación Final:</strong><br>`;

  // 🧾 Mostrar apuestas anteriores
  msg += `<p style="margin-top:8px;">
  🧔 <strong>Tu apuesta:</strong> ${playerBet.count || "—"} dados de ${playerBet.value || "—"}<br>
  🤖 <strong>Apuesta de la máquina:</strong> ${machineBet.count || "—"} dados de ${machineBet.value || "—"}
  </p>`;


  // 🎲 Mostrar los dados
  msg += `<div style="margin-top:10px; text-align:center;">`;
  msg += `<p>💀 <strong>Máquina:</strong> ${aiDice.map(n => `🎲${n}`).join(" ")} (${aiLives})</p>`;
  msg += `<p>🧔 <strong>Tú:</strong> ${playerDice.map(n => `🎲${n}`).join(" ")} (${playerLives})</p>`;
  msg += `</div>`;

  // 💬 Mostrar coincidencias
  msg += `<p style="margin-top:10px;">🎯 Coincidencias con el número <strong>${aiBet.value}</strong>: <strong>${actualCount}</strong></p>`;

  // 🧩 Nueva lógica: determinar resultado
  let resultText = "";
  const playerClaim = aiBet.playerCount || 0;
  const aiClaim = aiBet.aiCount || aiBet.count;

  if (actualCount === aiClaim && aiChallenged) {
    resultText = "⚖️ Empate. Ambos estuvieron cerca del destino.";
  } 
  else if (actualCount < aiClaim && !aiChallenged) {
    resultText = "🤖 ¡La máquina mintió! Pierde un dado.";
    aiLives--;
    lastLoser = "ai";
  } 
  else if (actualCount >= aiClaim && !aiChallenged) {
    resultText = "💀 La máquina tenía razón... pierdes un dado.";
    playerLives--;
    lastLoser = "player";
  } 
  else if (actualCount < playerClaim && aiChallenged) {
    resultText = "💀 Tu apuesta fue falsa... pierdes un dado.";
    playerLives--;
    lastLoser = "player";
  } 
  else if (actualCount >= playerClaim && aiChallenged) {
    resultText = "🤖 Dudó en vano. Tú tenías razón.";
    aiLives--;
    lastLoser = "ai";
  } 
  else {
    resultText = "⚖️ Nadie gana esta ronda. El mar guarda silencio...";
  }

  // 🎭 Mostrar todo
  revealPanel.classList.remove("hidden");
  revealPanel.innerHTML = `
    <div style="
      background: rgba(0,0,0,0.65);
      border: 2px solid #b08d57;
      border-radius: 10px;
      padding: 15px;
      box-shadow: 0 0 20px rgba(255,215,0,0.3);
      margin-top: 10px;
      animation: fadeIn 1.2s ease;">
      ${msg}
      <p style="margin-top:12px; font-weight:bold; color:#f7e6a3;">${resultText}</p>
    </div>
  `;

  updateHUD();
  raiseBtn.disabled = true;
  doubtBtn.disabled = true;

 // 🕰️ En lugar del auto avance, agrega un botón "Continuar"
const continueBtn = document.createElement("button");
continueBtn.textContent = "➡️ Continuar";
continueBtn.style.marginTop = "12px";
continueBtn.style.padding = "10px 20px";
continueBtn.style.fontSize = "1.1em";
continueBtn.style.border = "2px solid #b08d57";
continueBtn.style.borderRadius = "8px";
continueBtn.style.background = "linear-gradient(180deg, #3e2723 0%, #2c1810 100%)";
continueBtn.style.color = "#f5e6b3";
continueBtn.style.cursor = "pointer";
continueBtn.style.transition = "all 0.3s ease";
continueBtn.onmouseenter = () => continueBtn.style.transform = "scale(1.1)";
continueBtn.onmouseleave = () => continueBtn.style.transform = "scale(1)";

continueBtn.addEventListener("click", () => {
  continueBtn.remove();
  endRound(); // ⚓ avanza solo cuando el jugador hace clic
});

revealPanel.appendChild(continueBtn);

}



function updateHUD() {
  hudAIDice.textContent = aiLives;
  hudPlayerDice.textContent = playerLives;

  // Mostrar dados visuales
  const aiIcons = "🎲".repeat(aiLives);
  const playerIcons = "🎲".repeat(playerLives);

  const countDisplay = document.getElementById("dice-count-display");
  countDisplay.innerHTML = `
    <p>💀 <strong>Máquina:</strong> ${aiIcons || "— sin dados —"} (${aiLives})</p>
    <p>🧔 <strong>Tú:</strong> ${playerIcons || "— sin dados —"} (${playerLives})</p>
  `;
}


function endRound() {
  round++;
  hudRound.textContent = round;

  if (playerLives <= 0 || aiLives <= 0) {
    endGame();
    return;
  }

  if (round > totalRounds) {
    endGame();
    return;
  }

  roundEndPanel.classList.remove("hidden");
  typeWriter(roundEndPanel, "⚓ Preparando la siguiente ronda...", 40);
  setTimeout(() => {
    raiseBtn.disabled = false;
    doubtBtn.disabled = false;
    startRound();
  }, 3500);
}


function endGame() {
  let title = "";
  let reason = "";
  let flavor = "";

  // 🏴‍☠️ Determina resultado
  if (playerLives <= 0) {
    title = "💀 ¡Has perdido tu alma, pirata!";
    reason = "Tus dados se esfumaron con el viento del mar... la suerte te dio la espalda.";
  } else if (aiLives <= 0) {
    title = "🏴‍☠️ ¡Victoria, pirata!";
    reason = "Has dejado a la máquina sin dados... el destino estuvo de tu lado esta vez.";
  } else {
    title = "⚓ Fin de la partida";
    reason = "El tiempo del duelo terminó, y los dados callan por ahora.";
  }

  // 🧠 Frase según dificultad y resultado
  switch (difficulty) {
    case "Pirata Novato":
      flavor = playerLives > aiLives
        ? "☀️ *La suerte te sonríe, aprendiz del mar. Disfrútalo... mientras dure.*"
        : "🌊 *El mar no perdona a los inexpertos. Aprende y vuelve más fuerte.*";
      break;

    case "Capitán":
      flavor = playerLives > aiLives
        ? "🦜 *Buena jugada, Capitán. Pero recuerda... el mar siempre cobra su deuda.*"
        : "⚓ *Incluso los capitanes caen ante la marea. Hoy, el mar te venció.*";
      break;

    case "Kraken":
      flavor = playerLives > aiLives
        ? "🐙 *¿Cómo...? ¡Imposible! Nadie derrota al Kraken... nadie...*"
        : "🐙 *Tu alma me pertenece, mortal. El abismo te espera...*";
      break;
  }

  // 🪶 Animación de texto final
  roundEndPanel.classList.remove("hidden");
  roundEndPanel.innerHTML = `
    <div class="final-message">
      <h2>${title}</h2>
      <p>${reason}</p>
      <em>${flavor}</em>
    </div>
  `;

  // ✨ Animación visual de victoria/derrota
  roundEndPanel.style.animation = "fadeIn 1.5s ease";
  roundEndPanel.style.textAlign = "center";

  // Limpia los datos guardados
  finDePartida();

  setTimeout(() => {
    handleEndGameReaction();
  }, 4500);
}


// ✍️ efecto de texto tipo narrador pirata
function typeWriter(element, text, speed) {
  element.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    element.innerHTML += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

// 💥 vibración al perder
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0% { transform: translate(0px, 0px); }
    25% { transform: translate(3px, -3px); }
    50% { transform: translate(-3px, 3px); }
    75% { transform: translate(3px, 3px); }
    100% { transform: translate(0px, 0px); }
  }
  .shake {
    animation: shake 0.4s ease;
  }
`;
document.head.appendChild(style);


function handleEndGameReaction() {
  const reactionDiv = document.createElement("div");
  reactionDiv.classList.add("reaction-panel");

  let message = "";
  let offerRevenge = false;

  // 💀 --- Ganas la partida ---
  if (aiLives <= 0 || aiLives < playerLives) {
    switch (difficulty) {
      case "Pirata Novato":
        message = "🤖 *Oh... parece que la suerte te sonrió, capitán.*";
        break;

      case "Capitán":
        message = "🤖 *Buen juego... pero no creas que terminará así.*";
        offerRevenge = true;
        break;

      case "Kraken":
        message = "🐙 *¡Imposible! ¡Has osado desafiar al abismo! Exijo un duelo final: un solo tiro... una oportunidad.*";
        offerRevenge = true;
        break;
    }
  }

  // ⚓ --- Pierdes la partida ---
  else if (playerLives <= 0 || playerLives < aiLives) {
    switch (difficulty) {
      case "Pirata Novato":
        message = "🤖 *Tranquilo, marinero. Aprende y vuelve más fuerte.*";
        break;
      case "Capitán":
        message = "🤖 *He ganado. Pero admito... fue una buena pelea.*";
        break;
      case "Kraken":
        message = "🐙 *¡Patético! Ni siquiera vales mi tiempo, mortal.*";
        break;
    }
  }

  // 💬 Muestra mensaje
  reactionDiv.innerHTML = `<p>${message}</p>`;

  // 🔥 Si hay revancha, muestra botones
  if (offerRevenge) {
    reactionDiv.innerHTML += `
      <div class="revenge-buttons">
        <button id="accept-revenge">🔥 Aceptar duelo del destino</button>
        <button id="deny-revenge">❌ Negar y salir</button>
      </div>
    `;
  } else {
    reactionDiv.innerHTML += `
      <div class="revenge-buttons">
        <button id="back-to-menu">🏠 Regresar al menú</button>
      </div>
    `;
  }

  document.body.appendChild(reactionDiv);

  // 🎮 Botones
  if (offerRevenge) {
    document.getElementById("accept-revenge").onclick = () => {
      reactionDiv.remove();
      startFinalDuel();
    };
    document.getElementById("deny-revenge").onclick = () => {
      alert("🐙 El Kraken te expulsa de la taberna...");
      window.location.href = "juego.html";
    };
  } else {
    document.getElementById("back-to-menu").onclick = () => {
      window.location.href = "juego.html";
    };
  }
}

function startFinalDuel() {
  // Reinicia todo
  round = 1;
  totalRounds = 1;
  playerLives = 1;
  aiLives = 1;

  // Limpia cualquier panel previo
  document.querySelectorAll(".reaction-panel, .final-message, .intro-msg").forEach(e => e.remove());
  roundEndPanel.classList.add("hidden");
  betPanel.classList.add("hidden");
  revealPanel.classList.add("hidden");

  // Mensaje especial
  const intro = document.createElement("div");
  intro.classList.add("intro-msg");
  intro.innerHTML = `
    <h2>🔥 Duelo del Destino 🔥</h2>
    <p>Un solo tiro... una oportunidad...<br><em>El Kraken te observa.</em></p>
  `;
  document.body.appendChild(intro);

  // Transición visual
  document.body.style.transition = "background 2s ease";
  document.body.style.background = "radial-gradient(circle at center, #0b0b0b 30%, #111 70%, #000 100%)";

  setTimeout(() => {
    intro.remove();
    updateHUD();
    startRound(); // 🔥 Esto hace que el jugador pueda jugar normalmente
  }, 4000);
}


function restartGame() {
  round = 1;
  playerLives = 5;
  aiLives = 5;
  updateHUD();
  roundEndPanel.innerHTML = "⚓ ¡Nueva partida! La máquina busca venganza...";
  setTimeout(() => startRound(), 2000);
}
