import { LitElement, html, css, nothing } from "lit";
import {
  VERSION,
  VIEWS,
  MODES,
  MESSAGE_ICONS,
  normalizeLayers,
  rgbToHex,
  hexToRgb,
  displayPayload,
} from "./card-model.js";

export class IDotMatrixCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    config: { attribute: false },
    _layers: { state: true },
    _view: { state: true },
    _size: { state: true },
    _trigger: { state: true },
    _fonts: { state: true },
    _designs: { state: true },
    _name: { state: true },
    _preview: { state: true },
    _previewError: { state: true },
    _previewPending: { state: true },
    _busy: { state: true },
    _status: { state: true },
    _error: { state: true },
    _mode: { state: true },
    _values: { state: true },
    _gifPath: { state: true },
    _interval: { state: true },
    _message: { state: true },
    _confirmDelete: { state: true },
  };
  static styles = css`
    :host {
      container-type: inline-size;
      display: block;
      min-width: 0;
      color: var(--primary-text-color, #212121);
      font-family: var(--paper-font-body1_-_font-family, inherit);
      font-size: 14px;
      line-height: 1.5;
    }
    * {
      box-sizing: border-box;
    }
    ha-card {
      display: block;
      padding: 20px;
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border: 1px solid var(--divider-color, #ddd);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
    }
    .header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      line-height: 1.2;
    }
    .muted,
    .hint {
      color: var(--secondary-text-color, #666);
      font-size: 12px;
    }
    .hint {
      margin: 6px 0 0;
    }
    .size {
      width: 110px;
      flex-shrink: 0;
    }
    nav {
      display: flex;
      border-bottom: 1px solid var(--divider-color, #ddd);
      margin-bottom: 20px;
      gap: 4px;
    }
    nav button {
      border: 0;
      border-radius: 0;
      background: none;
      padding: 10px 8px;
      flex: 1;
      color: var(--secondary-text-color, #666);
      border-bottom: 2px solid transparent;
      font-size: 13px;
    }
    nav button[aria-selected="true"] {
      color: var(--primary-text-color, #212121);
      border-bottom-color: var(--primary-color, #03a9f4);
      font-weight: 600;
    }
    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px;
    }
    p {
      margin: 0 0 14px;
    }
    .row,
    .actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .actions {
      margin-top: 16px;
    }
    .actions > button {
      flex: 1;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .wide {
      grid-column: 1/-1;
    }
    label {
      display: grid;
      gap: 5px;
      min-width: 0;
      font-size: 12px;
      color: var(--secondary-text-color, #666);
    }
    input,
    select,
    textarea,
    button {
      font: inherit;
      color: var(--primary-text-color, #212121);
    }
    input,
    select,
    textarea {
      width: 100%;
      min-width: 0;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 6px;
      background: var(--card-background-color, #fff);
      padding: 9px 10px;
      min-height: 40px;
      font-size: 14px;
    }
    textarea {
      resize: vertical;
      min-height: 74px;
      line-height: 1.5;
    }
    textarea.template {
      font-family: ui-monospace, monospace;
      font-size: 13px;
    }
    input[type="color"] {
      padding: 3px;
      min-width: 44px;
    }
    input[type="range"] {
      padding: 0;
      border: 0;
    }
    input[type="checkbox"] {
      width: 18px;
      min-height: 18px;
      margin: 0;
      accent-color: var(--primary-color, #03a9f4);
    }
    .check {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      margin-top: 12px;
      color: var(--primary-text-color, #212121);
    }
    button {
      cursor: pointer;
      background: transparent;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 6px;
      padding: 9px 12px;
      min-height: 40px;
      line-height: 1.3;
    }
    button.primary {
      background: var(--idotmatrix-button-background, #0277bd);
      color: var(--idotmatrix-button-color, #fff);
      border-color: var(--idotmatrix-button-background, #0277bd);
    }
    button:hover:not(:disabled) {
      filter: brightness(0.94);
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    button.danger {
      color: var(--error-color, #c62828);
    }
    button.small {
      font-size: 12px;
      padding: 5px 9px;
      min-height: 34px;
    }
    :is(button, input, select, textarea, summary):focus-visible {
      outline: 2px solid var(--primary-color, #0288d1);
      outline-offset: 3px;
    }
    @container (min-width: 650px) {
      .designer-layout {
        display: grid;
        grid-template-columns: 240px minmax(0, 1fr);
        gap: 20px;
        align-items: start;
      }
      .layers-block .layer:first-child {
        border-top: 0;
        padding-top: 0;
      }
    }
    .preview {
      max-width: 256px;
      width: 100%;
      aspect-ratio: 1;
      margin: 0 auto;
      background: #000;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 6px;
      overflow: hidden;
      display: grid;
      place-items: center;
    }
    .preview img {
      display: block;
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
      object-fit: contain;
    }
    .preview .hint {
      color: #aaa;
      padding: 20px;
      text-align: center;
    }
    .preview-caption {
      text-align: center;
      font-size: 12px;
      color: var(--secondary-text-color, #666);
      margin: 8px 0 16px;
      min-height: 18px;
    }
    .layer {
      border-top: 1px solid var(--divider-color, #ddd);
      padding: 16px 0;
    }
    .layer-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 12px;
    }
    .layer-head strong {
      font-size: 14px;
    }
    .layer-head .row {
      gap: 4px;
    }
    .numbers {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }
    .empty {
      padding: 24px 0;
      text-align: center;
      color: var(--secondary-text-color, #666);
    }
    details {
      border-top: 1px solid var(--divider-color, #ddd);
      margin-top: 16px;
      padding-top: 12px;
    }
    summary {
      cursor: pointer;
      font-weight: 500;
      padding: 4px 0;
      min-height: 36px;
    }
    details > .grid,
    details > .row {
      margin-top: 10px;
    }
    .status {
      border-left: 3px solid var(--primary-color, #03a9f4);
      padding: 8px 10px;
      margin: 16px 0 0;
      font-size: 13px;
      overflow-wrap: anywhere;
    }
    .status.error {
      border-color: var(--error-color, #c62828);
      color: var(--error-color, #c62828);
    }
    .connection {
      font-size: 12px;
    }
    .connection .actions {
      margin-top: 4px;
    }
    .mode-note {
      color: var(--secondary-text-color, #666);
      font-size: 13px;
      margin: 10px 0 16px;
    }
    .confirm {
      margin-top: 12px;
    }
    .confirm p {
      margin-bottom: 6px;
    }
    @media (max-width: 420px) {
      ha-card {
        padding: 14px;
      }
      .header h2 {
        font-size: 18px;
      }
      .size {
        width: 100px;
      }
      nav {
        gap: 0;
      }
      nav button {
        padding: 10px 4px;
        font-size: 12px;
      }
      .numbers {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .grid {
        grid-template-columns: 1fr;
      }
      .actions > button {
        min-width: 100px;
      }
      .layer-head {
        align-items: flex-start;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
      }
    }
  `;
  constructor() {
    super();
    Object.assign(this, {
      _layers: [],
      _view: "designer",
      _size: 32,
      _trigger: "",
      _fonts: [{ filename: "Rain-DRM3.otf", name: "Rain DRM3" }],
      _designs: {},
      _name: "",
      _preview: "",
      _previewError: "",
      _previewPending: false,
      _busy: "",
      _status: "",
      _error: false,
      _mode: "clock",
      _values: {},
      _gifPath: "",
      _interval: 5,
      _message: {
        message: "",
        style: "card",
        font: "pixel",
        duration: 15,
        rainbow: false,
        color: "#ffffff",
        icon: "",
      },
      _confirmDelete: false,
    });
    this._subscriptions = new Map();
    this._connection = null;
    this._previewSerial = 0;
  }
  setConfig(config) {
    if (!config || typeof config !== "object")
      throw new Error("Card configuration is required.");
    const size = Number(config.screen_size ?? 32);
    if (![16, 32, 64].includes(size))
      throw new Error("screen_size must be 16, 32, or 64.");
    if (config.layers !== undefined && !Array.isArray(config.layers))
      throw new Error("layers must be a list.");
    this.config = { ...config };
    this._size = size;
    this._trigger = config.trigger_entity || "";
    this._layers = normalizeLayers(
      config.layers ?? [
        {
          template: config.template ?? "{{ now().strftime('%H:%M') }}",
          x: config.x ?? 0,
          y: config.y ?? 8,
          color: [0, 255, 0],
          font_size: 10,
        },
      ],
    );
    this._view = VIEWS.includes(config.default_view)
      ? config.default_view
      : "designer";
    this._gifPath = config.gif_path ?? "";
    this._interval = config.gif_interval ?? 5;
    this._mode = MODES[config.default_mode] ? config.default_mode : "clock";
    this._values = structuredClone(config.display_options || {});
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        {
          name: "screen_size",
          selector: { select: { options: ["16", "32", "64"] } },
        },
        { name: "default_view", selector: { select: { options: VIEWS } } },
        { name: "trigger_entity", selector: { entity: {} } },
        { name: "gif_path", selector: { text: {} } },
        {
          name: "default_mode",
          selector: { select: { options: Object.keys(MODES) } },
        },
        { name: "display_options", selector: { object: {} } },
        { name: "mac_address", selector: { text: { placeholder: "AA:BB:CC:DD:EE:FF" } } },
      ],
      computeLabel: (s) =>
        ({
          title: "Card title",
          screen_size: "Panel resolution",
          default_view: "Default section",
          trigger_entity: "Designer refresh entity",
          gif_path: "Default GIF path",
          default_mode: "Default display mode",
          display_options: "Display defaults (by mode)",
          mac_address: "Panel MAC address",
        })[s.name] || s.name,
    };
  }
  static getStubConfig() {
    return { title: "iDotMatrix", screen_size: 32, default_view: "designer", mac_address: "" };
  }
  connectedCallback() {
    super.connectedCallback();
    this.requestUpdate("hass");
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanup();
  }
  _cleanup() {
    for (const record of this._subscriptions.values()) record.unsub?.();
    this._subscriptions.clear();
    this._connection = null;
    clearTimeout(this._previewTimer);
    this._previewSerial++;
  }
  updated(changed) {
    if (!this.isConnected) return;
    // Apply selection after option children exist (including first render).
    for (const select of this.renderRoot.querySelectorAll("select")) {
      const selected = select.querySelector("option[selected]");
      if (selected) select.value = selected.value;
    }
    const connection = this.hass?.connection;
    if (connection !== this._connection) {
      this._cleanup();
      this._connection = connection;
      if (connection) {
        this._fetchResources(connection);
        this._syncSubscriptions();
        this._queuePreview();
      }
    }
    if (changed.has("_layers")) {
      this._syncSubscriptions();
      this._queuePreview();
    }
    if (changed.has("_size") || changed.has("_view")) this._queuePreview();
  }
  async _fetchResources(connection) {
    try {
      const [fonts, designs] = await Promise.all([
        connection.sendMessagePromise({
          type: "call_service",
          domain: "idotmatrix",
          service: "list_fonts",
          service_data: {},
          return_response: true,
        }),
        connection.sendMessagePromise({ type: "idotmatrix/list_designs" }),
      ]);
      if (this._connection !== connection) return;
      if (fonts?.response?.fonts?.length) this._fonts = fonts.response.fonts;
      this._designs = designs.designs || {};
    } catch (error) {
      if (this._connection === connection)
        this._notify(
          `Could not load saved designs or fonts: ${error.message || error}`,
          true,
        );
    }
  }
  _syncSubscriptions() {
    const wanted = new Map();
    for (const layer of this._layers)
      for (const field of ["template", "icon_template", "condition_template"])
        if (layer[field]) wanted.set(`${layer.id}:${field}`, layer[field]);
    for (const [key, record] of this._subscriptions)
      if (
        wanted.get(key) !== record.template ||
        record.connection !== this._connection
      ) {
        record.unsub?.();
        this._subscriptions.delete(key);
      }
    if (!this._connection || !this.isConnected) return;
    for (const [key, template] of wanted) {
      if (this._subscriptions.has(key)) continue;
      const record = { template, connection: this._connection };
      this._subscriptions.set(key, record);
      Promise.resolve(
        this._connection.subscribeMessage(
          (message) => {
            if (this._subscriptions.get(key) !== record) return;
            const result = JSON.stringify(message);
            if (result !== record.result) {
              record.result = result;
              this._queuePreview();
            }
          },
          { type: "render_template", template, variables: {} },
        ),
      )
        .then((unsub) => {
          if (this._subscriptions.get(key) !== record || !this.isConnected)
            unsub();
          else record.unsub = unsub;
        })
        .catch((error) => {
          if (this._subscriptions.get(key) === record) {
            this._subscriptions.delete(key);
            this._previewError = `Template subscription failed: ${error.message || error}`;
          }
        });
    }
  }
  _queuePreview() {
    clearTimeout(this._previewTimer);
    this._previewSerial++;
    if (this._view !== "designer" || !this._connection || !this.isConnected)
      return;
    this._previewTimer = setTimeout(() => this._renderPreview(), 180);
  }
  async _renderPreview() {
    const serial = ++this._previewSerial;
    const connection = this._connection;
    if (!connection || !this.isConnected) return;
    this._previewPending = true;
    try {
      const result = await connection.sendMessagePromise({
        type: "call_service",
        domain: "idotmatrix",
        service: "render_preview",
        service_data: {
          face: { layers: this._layers },
          screen_size: this._size,
        },
        return_response: true,
      });
      if (serial !== this._previewSerial || !this.isConnected) return;
      const response = result?.response;
      if (!response?.image)
        throw new Error(response?.error || "No preview returned");
      this._preview = response.image;
      this._previewError = "";
    } catch (error) {
      if (serial === this._previewSerial)
        this._previewError = `Preview unavailable: ${error.message || error}`;
    } finally {
      if (serial === this._previewSerial) this._previewPending = false;
    }
  }
  _notify(text, error = false) {
    this._status = text;
    this._error = error;
  }
  _hasService(name) {
    return Boolean(
      this.hass?.connection &&
      (!this.hass.services || this.hass.services.idotmatrix?.[name]),
    );
  }
  async _call(service, data = {}) {
    if (!this._hasService(service))
      throw new Error(
        `The ${service} action is unavailable. Update or enable the iDotMatrix integration.`,
      );
    const serviceData = {...data};
    if (this.config.mac_address) {
      serviceData.mac_address = this.config.mac_address;
    }
    return this.hass.callService("idotmatrix", service, serviceData);
  }
  async _run(label, action, success) {
    if (this._busy) return false;
    this._busy = label;
    this._notify(label);
    try {
      await action();
      this._notify(success);
      return true;
    } catch (error) {
      this._notify(error.message || String(error), true);
      return false;
    } finally {
      this._busy = "";
    }
  }
  _changeView(view) {
    this._view = view;
    this._confirmDelete = false;
    if (!this._busy) this._status = "";
  }
  _tabKey(event, index) {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? VIEWS.length - 1
          : (index + step + VIEWS.length) % VIEWS.length;
    this._changeView(VIEWS[next]);
    this.updateComplete.then(() =>
      this.renderRoot.querySelector(`#tab-${VIEWS[next]}`).focus(),
    );
  }
  _updateLayer(index, key, value) {
    const layers = this._layers.map((l) => ({ ...l }));
    layers[index][key] = value;
    if (key === "template") delete layers[index].content;
    this._layers = layers;
  }
  _removeLayer(index) {
    this._layers = this._layers.filter((_, i) => i !== index);
  }
  _moveLayer(index, step) {
    const layers = [...this._layers];
    [layers[index], layers[index + step]] = [
      layers[index + step],
      layers[index],
    ];
    this._layers = layers;
  }
  _addLayer() {
    this._layers = normalizeLayers([
      ...this._layers,
      { template: "", x: 0, y: 0, color: [255, 255, 255], font_size: 10 },
    ]);
  }
  async _saveToDevice() {
    return this._run(
      "Sending design…",
      () =>
        this._call("set_face", {
          face: {
            layers: this._layers,
            screen_size: this._size,
            trigger_entity: this._trigger || null,
          },
        }),
      "Design sent to the panel.",
    );
  }
  async _saveDesign() {
    const name = this._name.trim();
    if (!name) {
      this._notify("Enter a name for this design.", true);
      return false;
    }
    return this._run(
      "Saving design…",
      async () => {
        await this._connection.sendMessagePromise({
          type: "idotmatrix/save_design",
          name,
          layers: this._layers,
          screen_size: this._size,
          trigger_entity: this._trigger || null,
        });
        const result = await this._connection.sendMessagePromise({
          type: "idotmatrix/list_designs",
        });
        this._designs = result.designs || {};
        this._name = name;
      },
      "Design saved.",
    );
  }
  _loadDesign(name) {
    const design = this._designs[name];
    if (!design) return;
    this._name = name;
    this._layers = normalizeLayers(design.layers || []);
    if ([16, 32, 64].includes(design.screen_size))
      this._size = design.screen_size;
    this._trigger = design.trigger_entity || "";
    this._confirmDelete = false;
    this._notify("Design loaded. Send it when ready.");
  }
  async _deleteDesign() {
    const name = this._name;
    return this._run(
      "Deleting design…",
      async () => {
        await this._connection.sendMessagePromise({
          type: "idotmatrix/delete_design",
          name,
        });
        this._designs = { ...this._designs };
        delete this._designs[name];
        this._name = "";
        this._confirmDelete = false;
      },
      "Saved design deleted.",
    );
  }
  _setValue(key, value) {
    this._values = {
      ...this._values,
      [this._mode]: { ...this._values[this._mode], [key]: value },
    };
  }
  async _sendDisplay() {
    if (!this.renderRoot.querySelector("#display-form")?.reportValidity())
      return;
    return this._run(
      "Updating display…",
      () =>
        this._call(
          MODES[this._mode].service,
          displayPayload(
            this._mode,
            this._values[this._mode] || {},
            this._size,
          ),
        ),
      `${MODES[this._mode].label} sent to the panel.`,
    );
  }
  async _sendGif() {
    if (!this.renderRoot.querySelector("#gif-form")?.reportValidity()) return;
    return this._run(
      "Uploading GIFs…",
      () =>
        this._call("display_gif", {
          path: this._gifPath.trim(),
          rotation_interval: Number(this._interval),
        }),
      "GIF upload complete.",
    );
  }
  async _sendMessage() {
    if (!this.renderRoot.querySelector("#message-form")?.reportValidity())
      return;
    return this._run(
      "Sending message…",
      () => {
        if (![32, 64].includes(this._size))
          throw new Error("Messages need a 32×32 or 64×64 panel.");
        const data = {
          ...this._message,
          message: this._message.message.trim(),
          duration: Number(this._message.duration),
          color: hexToRgb(this._message.color),
          pixel_size: this._size,
        };
        if (!data.message) throw new Error("Enter a message.");
        if (!data.icon) delete data.icon;
        return this._call("show_message", data);
      },
      "Message sent to the panel.",
    );
  }
  _messageValue(key, value) {
    this._message = { ...this._message, [key]: value };
  }
  _entityField(
    key,
    label,
    domain,
    required = false,
    values = this._values[this._mode] || {},
  ) {
    return html`<label
      >${label}${required ? " *" : ""}<input
        type="text"
        list=${`entities-${domain}`}
        .value=${values[key] || ""}
        ?required=${required}
        placeholder=${`${domain}.…`}
        @input=${(e) => this._setValue(key, e.target.value)}
    /></label>`;
  }
  _color(label, value, onChange) {
    return html`<label
      >${label}<input
        type="color"
        .value=${value || "#ffffff"}
        @input=${(e) => onChange(e.target.value)}
    /></label>`;
  }
  _check(label, value, onChange) {
    return html`<label class="check"
      ><input
        type="checkbox"
        .checked=${value}
        @change=${(e) => onChange(e.target.checked)}
      />${label}</label
    >`;
  }
  _number(index, layer, key, label, min, max) {
    return html`<label
      >${label}<input
        type="number"
        min=${min}
        max=${max}
        .value=${String(layer[key] ?? (key === "font_size" ? 10 : key === "icon_size" ? 16 : 0))}
        @change=${(e) => this._updateLayer(index, key, Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
    /></label>`;
  }
  _designer() {
    return html` <div class="designer-layout">
      <div class="preview-block">
        <div
          class="preview"
          role="img"
          aria-label=${`Design preview at ${this._size} by ${this._size} pixels`}
        >
          ${this._preview ? html`<img src=${this._preview} alt="Rendered design preview" />` : html`<span class="hint">${this._previewError || "Preparing preview…"}</span>`}
        </div>
        <div class="preview-caption" role="status">
          ${this._previewError || (this._previewPending ? "Updating preview…" : `${this._size} × ${this._size} · rendered by Home Assistant`)}
        </div>
      </div>
      <div class="layers-block">
        ${
          this._layers.length
            ? this._layers.map(
                (layer, index) =>
                  html`<section
                    class="layer"
                    aria-label=${`Layer ${index + 1}`}
                  >
                    <div class="layer-head">
                      <strong>Layer ${index + 1}</strong>
                      <div class="row">
                        <button
                          class="small"
                          aria-label=${`Move layer ${index + 1} up`}
                          ?disabled=${index === 0}
                          @click=${() => this._moveLayer(index, -1)}
                        >
                          ↑</button
                        ><button
                          class="small"
                          aria-label=${`Move layer ${index + 1} down`}
                          ?disabled=${index === this._layers.length - 1}
                          @click=${() => this._moveLayer(index, 1)}
                        >
                          ↓</button
                        ><button
                          class="small danger"
                          aria-label=${`Remove layer ${index + 1}`}
                          @click=${() => this._removeLayer(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <label
                      >Text or Jinja template<textarea
                        class="template"
                        .value=${layer.template}
                        @input=${(e) => this._updateLayer(index, "template", e.target.value)}
                      ></textarea>
                    </label>
                    <div class="grid" style="margin-top:12px">
                      <label
                        >Icon or icon template<input
                          placeholder="mdi:weather-sunny"
                          .value=${layer.icon_template}
                          @input=${(e) => this._updateLayer(index, "icon_template", e.target.value)} /></label
                      >${this._color("Text and icon color", rgbToHex(layer.color), (v) => this._updateLayer(index, "color", hexToRgb(v)))}
                    </div>
                    <details>
                      <summary>Position and typography</summary>
                      <div class="numbers">
                        ${this._number(index, layer, "x", "X position", -64, 64)}${this._number(index, layer, "y", "Y position", -64, 64)}${this._number(index, layer, "font_size", "Font size", 1, 64)}${this._number(index, layer, "icon_size", "Icon size", 1, 64)}${this._number(index, layer, "spacing_x", "Letter spacing", -8, 20)}
                      </div>
                      <div class="grid" style="margin-top:12px">
                        <label
                          >Font<select
                            .value=${layer.font || "Rain-DRM3.otf"}
                            @change=${(e) => this._updateLayer(index, "font", e.target.value)}
                          >
                            ${this._fonts.map((font) => html`<option value=${font.filename} ?selected=${font.filename === (layer.font || "Rain-DRM3.otf")}>${font.name}</option>`)}
                          </select></label
                        ><label
                          >Sharpness / blur · ${layer.blur ?? 5}<input
                            type="range"
                            min="0"
                            max="10"
                            .value=${String(layer.blur ?? 5)}
                            @input=${(e) => this._updateLayer(index, "blur", Number(e.target.value))}
                        /></label>
                      </div>
                    </details>
                  </section>`,
              )
            : html`<p class="empty">No layers. Add one to start a design.</p>`
        }
        <div class="actions">
          <button @click=${this._addLayer}>Add layer</button
          ><button
            class="primary"
            ?disabled=${!!this._busy || !this._hasService("set_face")}
            @click=${this._saveToDevice}
          >
            Send design
          </button>
        </div>
        <details>
          <summary>Auto-refresh</summary>
          <label
            >Refresh when this entity changes<input
              list="entities-all"
              .value=${this._trigger}
              placeholder="sensor.time"
              @input=${(e) => (this._trigger = e.target.value)}
          /></label>
          <p class="hint">
            The panel also follows entities referenced by your templates.
          </p>
        </details>
        <details>
          <summary>Saved designs</summary>
          <div class="grid">
            <label
              >Load a design<select
                .value=${""}
                @change=${(e) => {
                  this._loadDesign(e.target.value);
                  e.target.value = "";
                }}
              >
                <option value="">Choose a saved design</option>
                ${Object.keys(this._designs)
                  .sort()
                  .map((name) => html`<option value=${name}>${name}</option>`)}
              </select></label
            ><label
              >Design name<input
                .value=${this._name}
                @input=${(e) => {
                  this._name = e.target.value;
                  this._confirmDelete = false;
                }}
            /></label>
          </div>
          <div class="actions">
            <button ?disabled=${!!this._busy} @click=${this._saveDesign}>
              Save design</button
            ><button
              class="danger"
              ?disabled=${!!this._busy || !this._designs[this._name]}
              @click=${() => (this._confirmDelete = true)}
            >
              Delete saved design
            </button>
          </div>
          ${
            this._confirmDelete
              ? html`<div class="confirm">
                  <p>Delete “${this._name}” from saved designs?</p>
                  <div class="row">
                    <button class="danger" @click=${this._deleteDesign}>
                      Confirm delete</button
                    ><button @click=${() => (this._confirmDelete = false)}>
                      Cancel
                    </button>
                  </div>
                </div>`
              : nothing
          }
        </details>
      </div>
    </div>`;
  }
  _displays() {
    const mode = MODES[this._mode],
      values = this._values[this._mode] || {};
    return html`<form
      id="display-form"
      @submit=${(e) => {
        e.preventDefault();
        this._sendDisplay();
      }}
    >
      <label
        >Display mode<select
          .value=${this._mode}
          @change=${(e) => {
            this._mode = e.target.value;
            if (!this._busy) this._status = "";
          }}
        >
          ${Object.entries(MODES).map(([key, m]) => html`<option value=${key} ?selected=${key === this._mode}>${m.label}</option>`)}
        </select></label
      >
      <p class="mode-note">${mode.note}</p>
      <div class="grid">
        ${(this._mode === "weather" ? mode.fields.slice(0, 1) : mode.fields).map((field) => this._entityField(...field))}${
          this._mode === "clock"
            ? html`<label
                >Clock face<select
                  .value=${values.face ?? "pixel"}
                  @change=${(e) => this._setValue("face", e.target.value)}
                >
                  <option
                    value="pixel"
                    ?selected=${(values.face ?? "pixel") === "pixel"}
                  >
                    Pixel
                  </option>
                  <option value="analog" ?selected=${values.face === "analog"}>
                    Analog
                  </option>
                  ${Array.from({ length: 8 }, (_, i) => html`<option value=${String(i)} ?selected=${String(values.face) === String(i)}>Native ${i}</option>`)}
                </select></label
              >`
            : nothing
        }${["color", "clock"].includes(this._mode) ? this._color(this._mode === "color" ? "Panel color" : "Clock accent", values.color || "#3399ff", (v) => this._setValue("color", v)) : nothing}
      </div>
      ${
        this._mode === "weather"
          ? html`<details>
              <summary>Sensor overrides</summary>
              <div class="grid">
                ${mode.fields.slice(1).map((field) => this._entityField(...field))}
              </div>
            </details>`
          : nothing
      }${["clock", "sun"].includes(this._mode) ? this._check("24-hour time", values.hour24 ?? true, (v) => this._setValue("hour24", v)) : nothing}${this._mode === "clock" ? this._check("Show date", values.show_date ?? true, (v) => this._setValue("show_date", v)) : nothing}${this._mode !== "color" ? this._check("Keep automatically updated", values.follow ?? true, (v) => this._setValue("follow", v)) : nothing}
      <div class="actions">
        <button
          type="submit"
          class="primary"
          ?disabled=${!!this._busy || !this._hasService(mode.service)}
        >
          Show ${mode.label.toLowerCase()}</button
        >${mode.stop ? html`<button type="button" ?disabled=${!!this._busy || !this._hasService(mode.stop)} @click=${() => this._run("Stopping updates…", () => this._call(mode.stop), "Automatic updates stopped.")}>Stop updates</button>` : nothing}
      </div>
    </form>`;
  }
  _gifs() {
    return html`<h3>GIFs and carousels</h3>
      <p class="mode-note">
        Send one file, or a folder of up to 12 randomly selected GIFs. Prepare
        GIFs at your panel’s resolution.
      </p>
      <form
        id="gif-form"
        @submit=${(e) => {
          e.preventDefault();
          this._sendGif();
        }}
      >
        <label
          >GIF file or folder path<input
            required
            .value=${this._gifPath}
            placeholder="/media/idotmatrix/gifs/"
            @input=${(e) => (this._gifPath = e.target.value)} /></label
        ><label style="margin-top:12px"
          >Carousel interval (seconds)<input
            required
            type="number"
            min="1"
            max="255"
            .value=${String(this._interval)}
            @input=${(e) => (this._interval = e.target.value)}
        /></label>
        <p class="hint">
          Applies to folders. The panel loops the uploaded GIFs itself.
        </p>
        <div class="actions">
          <button
            type="submit"
            class="primary"
            ?disabled=${!!this._busy || !this._hasService("display_gif")}
          >
            Send GIFs</button
          ><button
            type="button"
            ?disabled=${!!this._busy || !this._hasService("stop_gif_rotation")}
            @click=${() => this._run("Stopping GIFs…", () => this._call("stop_gif_rotation"), "GIF display stopped.")}
          >
            Stop GIFs
          </button>
        </div>
      </form>`;
  }
  _messages() {
    const m = this._message;
    return html`<h3>Send a message</h3>
      <p class="mode-note">
        Temporarily replace the current dashboard. It returns when the message
        finishes.
      </p>
      <form
        id="message-form"
        @submit=${(e) => {
          e.preventDefault();
          this._sendMessage();
        }}
      >
        <label
          >Message<textarea
            required
            .value=${m.message}
            placeholder="Front door open"
            @input=${(e) => this._messageValue("message", e.target.value)}
          ></textarea>
        </label>
        <div class="grid" style="margin-top:12px">
          <label
            >Style<select
              .value=${m.style}
              @change=${(e) => this._messageValue("style", e.target.value)}
            >
              ${["card", "alert", "marquee", "party", "typewriter"].map((v) => html`<option value=${v} ?selected=${v === m.style}>${v[0].toUpperCase() + v.slice(1)}</option>`)}
            </select></label
          ><label
            >Icon<select
              .value=${m.icon}
              @change=${(e) => this._messageValue("icon", e.target.value)}
            >
              <option value="">No icon</option>
              ${MESSAGE_ICONS.map((v) => html`<option value=${v} ?selected=${v === m.icon}>${v}</option>`)}
            </select></label
          ><label
            >Font<select
              .value=${m.font}
              @change=${(e) => this._messageValue("font", e.target.value)}
            >
              <option value="pixel" ?selected=${m.font === "pixel"}>
                Pixel
              </option>
              <option value="arcade" ?selected=${m.font === "arcade"}>
                Arcade
              </option>
              <option value="tiny" ?selected=${m.font === "tiny"}>Tiny</option>
            </select></label
          ><label
            >Duration (seconds)<input
              type="number"
              required
              min="0"
              max="3600"
              .value=${String(m.duration)}
              @input=${(e) => this._messageValue("duration", e.target.value)} /></label
          >${this._color("Message color", m.color, (v) => this._messageValue("color", v))}
        </div>
        ${this._check("Rainbow text", m.rainbow, (v) => this._messageValue("rainbow", v))}
        <p class="hint">
          Set duration to 0 to keep the message until you stop it.
        </p>
        <div class="actions">
          <button
            type="submit"
            class="primary"
            ?disabled=${!!this._busy || !this._hasService("show_message")}
          >
            Send message</button
          ><button
            type="button"
            ?disabled=${!!this._busy || !this._hasService("stop_message")}
            @click=${() => this._run("Restoring display…", () => this._call("stop_message"), "Previous display restored.")}
          >
            Stop message
          </button>
        </div>
      </form>`;
  }
  render() {
    if (!this.config) return nothing;
    return html`<ha-card
      ><div class="header">
        <div>
          <h2>${this.config.title || "iDotMatrix"}</h2>
          <span class="muted">Display designer & controls</span>
        </div>
        <label class="size"
          >Panel size<select
            .value=${String(this._size)}
            @change=${(e) => (this._size = Number(e.target.value))}
          >
            ${[16, 32, 64].map((v) => html`<option value=${String(v)} ?selected=${v === this._size}>${v} × ${v}</option>`)}
          </select></label
        >
      </div>
      <nav role="tablist" aria-label="Card sections">
        ${VIEWS.map((view, i) => html`<button id=${`tab-${view}`} role="tab" aria-selected=${this._view === view} aria-controls="card-panel" tabindex=${this._view === view ? "0" : "-1"} @click=${() => this._changeView(view)} @keydown=${(e) => this._tabKey(e, i)}>${{ designer: "Designer", displays: "Displays", gifs: "GIFs", messages: "Messages" }[view]}</button>`)}
      </nav>
      ${!this.hass?.connection ? html`<p class="status error" role="status">Waiting for Home Assistant…</p>` : nothing}
      <div
        id="card-panel"
        role="tabpanel"
        aria-labelledby=${`tab-${this._view}`}
      >
        ${this._view === "designer" ? this._designer() : this._view === "displays" ? this._displays() : this._view === "gifs" ? this._gifs() : this._messages()}
      </div>
      ${this._status ? html`<p class=${`status ${this._error ? "error" : ""}`} role=${this._error ? "alert" : "status"} aria-live="polite">${this._status}</p>` : nothing}
      <details class="connection">
        <summary>Panel connection</summary>
        <p class="hint">
          Disconnect to use the phone app. Reconnect to resume Home Assistant
          control. Affects all connected panels.
        </p>
        <div class="actions">
          <button
            ?disabled=${!!this._busy || !this._hasService("disconnect")}
            @click=${() => this._run("Disconnecting…", () => this._call("disconnect"), "Panel disconnected. You can use the phone app.")}
          >
            Disconnect</button
          ><button
            ?disabled=${!!this._busy || !this._hasService("reconnect")}
            @click=${() => this._run("Reconnecting…", () => this._call("reconnect"), "Panel reconnected.")}
          >
            Reconnect
          </button>
        </div>
      </details>
      ${(this._view === "designer"
        ? ["all"]
        : this._view === "displays"
          ? [...new Set(MODES[this._mode].fields.map((field) => field[2]))]
          : []
      ).map(
        (domain) =>
          html`<datalist id=${`entities-${domain}`}>
            ${Object.values(this.hass?.states || {})
              .filter(
                (s) => domain === "all" || s.entity_id.startsWith(domain + "."),
              )
              .map(
                (s) =>
                  html`<option value=${s.entity_id}>
                    ${s.attributes?.friendly_name || s.entity_id}
                  </option>`,
              )}
          </datalist>`,
      )}</ha-card
    >`;
  }
  getCardSize() {
    return this._view === "designer"
      ? Math.max(8, 6 + this._layers.length * 3)
      : 7;
  }
}
if (!customElements.get("idotmatrix-card"))
  customElements.define("idotmatrix-card", IDotMatrixCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "idotmatrix-card"))
  window.customCards.push({
    type: "idotmatrix-card",
    name: "iDotMatrix Card",
    description: "Designer, dashboards, GIFs and messages for iDotMatrix",
    preview: true,
    documentationURL: "https://github.com/tukies/iDotMatrix-HomeAssistant",
  });
console.info(`iDotMatrix Card v${VERSION} `);
