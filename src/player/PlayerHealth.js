export class PlayerHealth {
  constructor() {
    this.maxHealth = 100;
    this.health = 100;
    this.isDead = false;
    this.onDeath = null;
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) this._die();
  }

  _die() {
    this.isDead = true;
    if (this.onDeath) this.onDeath();
  }
}
