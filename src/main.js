// Import farmOS map instance factory function.
import createInstance from './instance/instance';

// Import farmOS-map CSS.
import './styles.css';

// Define window.farmOS if it isn't already.
if (typeof window.farmOS === 'undefined') {
  window.farmOS = {};
}

// Add a farmOS.map object that is available globaly.
window.farmOS.map = {

  // Initialize an array of farmOS map instances.
  instances: [],

  // Initialize map behaviors.
  // These are objects with an attach() method that will be called when a map is
  // created. They receive the instance object so that they can perform
  // modifications to the map using instance methods.
  behaviors: {},

  // Create a new farmOS map attached to a target element ID and add it to the
  // global instances array.
  create(target, options) {
    const instance = createInstance({ target, options });

    // Add the instance to the array.
    this.instances.push(instance);

    // Attach behaviors from farmOS.map.behaviors to the instance.
    // Sort by an optional weight value on each behavior.
    const behaviors = Object.keys(this.behaviors).map(i => this.behaviors[i]);
    behaviors.sort((first, second) => {
      const firstWeight = first.weight || 0;
      const secondWeight = second.weight || 0;
      if (firstWeight === secondWeight) {
        return 0;
      }
      return (firstWeight < secondWeight) ? -1 : 1;
    });
    behaviors.forEach((behavior) => {
      instance.attachBehavior(behavior);
    });

    // Return the instance.
    return instance;
  },

  // Destroy a farmOS map instance and remove it from the instances array.
  destroy(target) {
    const i = this.targetIndex(target);
    if (i > -1) {

      // Detach behaviors from the instance.
      Object.keys(this.behaviors).forEach((key) => {
        this.instances[i].detachBehavior(this.behaviors[key]);
      });

      // Destroy the map.
      this.instances[i].map.setTarget(null);
      this.instances.splice(i, 1);
    }
  },

  // Look up an instance index based on its target element ID.
  targetIndex(target) {
    return this.instances.findIndex(instance => instance.target === target);
  },
};
