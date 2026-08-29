export class HUD {
  constructor() {
    this.initDOM();
  }

  initDOM() {
    const styleTag = document.createElement("style");
    styleTag.textContent = `
      @keyframes pulseAlert {
        0% { opacity: 0.3; transform: translateX(-50%) scale(0.98); }
        50% { opacity: 1; transform: translateX(-50%) scale(1.02); }
        100% { opacity: 0.3; transform: translateX(-50%) scale(0.98); }
      }

      @keyframes OLEDGlitch {
        0% { opacity: 0.98; }
        50% { opacity: 1; }
        52% { opacity: 0.94; }
        54% { opacity: 1; }
        100% { opacity: 0.99; }
      }

      .watch-hud-container {
        position: fixed;
        bottom: 24px;
        left: 24px;
        pointer-events: auto;
        user-select: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        z-index: 100;
      }

      .watch-casing {
        position: relative;
        width: 210px;
        height: 210px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #2a2520 0%, #120e0b 70%, #050403 100%);
        border: 6px solid #382c21;
        box-shadow: 
          0 0 0 2px #0a0806,
          0 12px 28px rgba(0, 0, 0, 0.8),
          inset 0 2px 4px rgba(255, 200, 150, 0.15),
          inset 0 -4px 12px rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
      }

      .watch-casing::after {
        content: "";
        position: absolute;
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
        width: 10px;
        height: 24px;
        background: linear-gradient(180deg, #443528 0%, #1a140f 100%);
        border-radius: 3px;
        border: 1px solid #1a120b;
      }

      .watch-screen {
        position: relative;
        width: 172px;
        height: 172px;
        border-radius: 50%;
        background: radial-gradient(circle, #1a120b 0%, #0a0704 100%);
        border: 2px solid rgba(255, 170, 0, 0.25);
        box-shadow: inset 0 0 25px rgba(0, 0, 0, 0.95);
        padding: 16px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        animation: OLEDGlitch 0.25s infinite;
        overflow: hidden;
      }

      .glass-crack-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
        opacity: 0.7;
      }

      .watch-body {
        width: 100%;
        z-index: 5;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .metric-group {
        width: 100%;
        margin-bottom: 6px;
      }

      .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.8px;
        color: #e69d35;
        margin-bottom: 2px;
      }

      .bar-track {
        width: 100%;
        height: 7px;
        background: rgba(15, 10, 5, 0.9);
        border: 1px solid rgba(230, 157, 53, 0.35);
        border-radius: 4px;
        padding: 1px;
        box-sizing: border-box;
      }

      .bar-fill {
        height: 100%;
        width: 100%;
        border-radius: 2px;
        transition: width 0.15s ease-out, background-color 0.2s ease;
      }

      .health-fill {
        background: #ff8800;
        box-shadow: 0 0 6px rgba(255, 136, 0, 0.6);
      }

      .stamina-fill {
        background: #ffcc00;
        box-shadow: 0 0 6px rgba(255, 204, 0, 0.6);
      }

      .status-badge {
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 1.2px;
        color: #ffaa00;
        text-transform: uppercase;
        margin-bottom: 8px;
        text-shadow: 0 0 8px rgba(255, 170, 0, 0.4);
      }

      .watch-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-top: 4px;
        padding-top: 4px;
        border-top: 1px solid rgba(230, 157, 53, 0.2);
        font-size: 10px;
        font-weight: 700;
        color: #e69d35;
      }

      .light-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .light-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ffaa00;
        box-shadow: 0 0 6px #ffaa00;
      }
    `;
    document.head.appendChild(styleTag);

    this.hudContainer = document.createElement("div");
    this.hudContainer.id = "scifi-hud";
    this.hudContainer.className = "watch-hud-container";

    this.hudContainer.innerHTML = `
      <div class="watch-casing">
        <div class="watch-screen">
          <svg class="glass-crack-overlay" viewBox="0 0 172 172">
            <path d="M 160,20 L 110,65 L 75,50 L 25,100 L 10,150 M 110,65 L 125,125 L 80,105 M 75,50 L 35,25" 
                  stroke="rgba(255, 255, 255, 0.4)" stroke-width="1.2" fill="none" />
            <path d="M 110,65 L 145,75 M 75,50 L 85,15" 
                  stroke="rgba(255, 180, 100, 0.25)" stroke-width="0.8" fill="none" />
          </svg>

          <div class="watch-body">
            <div class="status-badge" id="hud-status-text">NOMINAL</div>

            <div class="metric-group">
              <div class="metric-header">
                <span>HEALTH</span>
                <span id="hud-health-val">100%</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill health-fill" id="hud-health-fill"></div>
              </div>
            </div>

            <div class="metric-group">
              <div class="metric-header">
                <span>STAMINA</span>
                <span id="hud-stamina-val">100%</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill stamina-fill" id="hud-stamina-fill"></div>
              </div>
            </div>

            <div class="watch-footer">
              <div class="light-indicator">
                <div class="light-dot" id="hud-light-dot"></div>
                <span id="hud-flashlight-status">BEAM ON [F]</span>
              </div>
              <span style="opacity: 0.6; font-size: 9px;">SYS.02</span>
            </div>
          </div>
        </div>
      </div>

      <div id="hud-warning" style="
        display: none;
        position: fixed;
        bottom: 36px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #ff3333;
        background: rgba(18, 4, 4, 0.92);
        padding: 10px 22px;
        border: 2px solid #ff3333;
        border-radius: 6px;
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
        animation: pulseAlert 0.8s infinite ease-in-out;
        white-space: nowrap;
      ">
        ⚠️ ATMOSPHERIC HAZARD DETECTED ⚠️
      </div>

      <div id="hud-interact-prompt" style="
        display: none;
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #ffaa00;
        background: rgba(10, 6, 2, 0.88);
        padding: 10px 28px;
        border: 1.5px solid #ffaa00;
        border-radius: 6px;
        box-shadow: 0 0 16px rgba(255, 170, 0, 0.3);
        pointer-events: none;
        white-space: nowrap;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        [ E ]&nbsp;&nbsp;INTERACT
      </div>

      <div id="start-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(4, 3, 2, 0.94);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        pointer-events: auto;
        cursor: pointer;
        color: #ffaa00;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 2px;
          border: 2px solid #ffaa00;
          padding: 16px 36px;
          border-radius: 8px;
          box-shadow: 0 0 30px rgba(255, 170, 0, 0.25);
          background: rgba(20, 10, 0, 0.85);
        ">
          CLICK TO INITIALIZE SUIT
        </div>
        <p style="color: #aa7733; font-size: 12px; margin-top: 14px; font-weight: 600;">
          Locks controls and syncs neural audio
        </p>
      </div>
    `;

    document.body.appendChild(this.hudContainer);

    this.healthFillEl = document.getElementById("hud-health-fill");
    this.staminaFillEl = document.getElementById("hud-stamina-fill");
    this.healthValEl = document.getElementById("hud-health-val");
    this.staminaValEl = document.getElementById("hud-stamina-val");
    this.statusTextEl = document.getElementById("hud-status-text");
    this.warningEl = document.getElementById("hud-warning");
    this.flashlightStatusEl = document.getElementById("hud-flashlight-status");
    this.lightDotEl = document.getElementById("hud-light-dot");
    this.overlayEl = document.getElementById("start-overlay");

    this.interactPromptEl = document.getElementById("hud-interact-prompt");

    this.isToxicZone = false;
    this._onStart = null;

    this.overlayEl.addEventListener("click", () => {
      if (this._onStart) this._onStart();
      this.overlayEl.style.display = "none";
    });
  }

  setOnStart(callback) {
    this._onStart = callback;
  }

  updateVitals(
    health,
    maxHealth,
    stamina,
    maxStamina,
    isExhausted,
    isTakingDamage,
  ) {
    const healthPct = Math.max(
      0,
      Math.min(100, (health / maxHealth) * 100),
    ).toFixed(0);
    const staminaPct = Math.max(
      0,
      Math.min(100, (stamina / maxStamina) * 100),
    ).toFixed(0);

    this.healthFillEl.style.width = `${healthPct}%`;
    this.staminaFillEl.style.width = `${staminaPct}%`;

    this.healthValEl.innerText = `${healthPct}%`;
    this.staminaValEl.innerText = `${staminaPct}%`;

    if (isExhausted) {
      this.staminaFillEl.style.backgroundColor = "#ff3300";
      this.staminaFillEl.style.boxShadow = "0 0 6px #ff3300";
    } else {
      this.staminaFillEl.style.backgroundColor = "#ffcc00";
      this.staminaFillEl.style.boxShadow = "0 0 6px #ffcc00";
    }

    if (this.isToxicZone) {
      this.statusTextEl.innerText = "TOXIC GAS";
      this.statusTextEl.style.color = "#ff2200";
      this.healthFillEl.style.backgroundColor = "#ff2200";
      return;
    }

    if (isTakingDamage) {
      this.warningEl.innerText = "⚠️ HAZARD DETECTED ⚠️";
      this.warningEl.style.display = "block";
      this.statusTextEl.innerText = "WARNING";
      this.statusTextEl.style.color = "#ff3333";
      this.healthFillEl.style.backgroundColor = "#ff0000";
      this.healthFillEl.style.boxShadow = "0 0 10px #ff0000";
    } else if (health / maxHealth < 0.3) {
      this.statusTextEl.innerText = "LOW VITAL";
      this.statusTextEl.style.color = "#ff6600";
      this.healthFillEl.style.backgroundColor = "#ff5500";
    } else {
      this.statusTextEl.innerText = "NOMINAL";
      this.statusTextEl.style.color = "#ffaa00";
      this.healthFillEl.style.backgroundColor = "#ff8800";
    }
  }

  showToxicGasWarning(isOut) {
    this.isToxicZone = isOut;
    if (isOut) {
      this.statusTextEl.innerText = "TOXIC GAS";
      this.statusTextEl.style.color = "#ff2200";
      this.warningEl.innerText = "☣️ WARNING: TOXIC GAS EXPOSURE DETECTED ☣️";
      this.warningEl.style.borderColor = "#ff3300";
      this.warningEl.style.color = "#ff3300";
      this.warningEl.style.display = "block";
    } else {
      this.warningEl.style.display = "none";
      this.warningEl.style.borderColor = "#ff3333";
      this.warningEl.style.color = "#ff3333";
      this.statusTextEl.innerText = "NOMINAL";
      this.statusTextEl.style.color = "#ffaa00";
    }
  }

  updateFlashlightStatus(isOn) {
    this.flashlightStatusEl.innerText = isOn ? "BEAM ON [F]" : "BEAM OFF [F]";
    this.flashlightStatusEl.style.color = isOn ? "#e69d35" : "#775533";
    this.lightDotEl.style.backgroundColor = isOn ? "#ffaa00" : "#443322";
    this.lightDotEl.style.boxShadow = isOn ? "0 0 6px #ffaa00" : "none";
  }

  clearDamageWarning() {
    if (!this.isToxicZone) {
      this.warningEl.style.display = "none";
      this.statusTextEl.innerText = "NOMINAL";
      this.statusTextEl.style.color = "#ffaa00";
    }
  }

  showInteractPrompt(visible) {
    this.interactPromptEl.style.display = visible ? "block" : "none";
  }

  showDeathState() {
    this.statusTextEl.innerText = "NO SIGNAL";
    this.statusTextEl.style.color = "#ff0000";
    this.warningEl.innerText = "☠ CRITICAL BIOMETRIC COLLAPSE ☠";
    this.warningEl.style.display = "block";
  }
}
