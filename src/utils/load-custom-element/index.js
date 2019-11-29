const loadCustomElement = importer => ({
  async as(namespace) {
    let _namespace = namespace;
    // load custom element script
    let customElement = await importer();
    if (customElement.default) customElement = customElement.default;
    // if no name was specified, use default provided by the custom element
    if (
      !_namespace &&
      customElement.is &&
      typeof customElement.is === 'string'
    ) {
      _namespace = customElement.is;
    }
    // if we get to this point without any name, just give up
    if (!_namespace) {
      throw new Error('Please a specify a name for custom element');
    }
    // check if not already defined
    const alreadyExisting = window.customElements.get(_namespace);
    if (alreadyExisting) {
      // if it was, with the same element, everything is fine
      if (alreadyExisting === customElement) return _namespace;
      throw new Error('This name is already used by another component');
    }
    window.customElements.define(_namespace, customElement);
    return _namespace;
  },
});

export default loadCustomElement;
