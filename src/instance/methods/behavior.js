// Import pre-defined behaviors from src/behavior.
import behaviors from '../../behavior';

/**
 * Add a behavior by name.
 */
export function addBehavior(name, options = {}) {
  this.attachBehavior(behaviors[name], options);
}

/**
 * Attach a behavior to the farmOS-map instance.
 */
export function attachBehavior(behavior, options = {}) {
  behavior.attach(this, options);
}

/**
 * Detach a behavior from the farmOS-map instance.
 */
export function detachBehavior(behavior) {
  behavior.detach(this);
}
