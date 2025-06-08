var DataSource = /* @__PURE__ */ ((DataSource2) => {
  DataSource2["SCRAPING"] = "scraping";
  DataSource2["SDK"] = "sdk";
  DataSource2["USER_INPUT"] = "user_input";
  DataSource2["TOOL_UPDATE"] = "tool_update";
  DataSource2["INFERENCE"] = "inference";
  DataSource2["IMPORT"] = "import";
  DataSource2["API"] = "api";
  return DataSource2;
})(DataSource || {});
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class MagicButtonSDK {
  constructor(config = {}) {
    __publicField(this, "config");
    __publicField(this, "isInitialized", false);
    __publicField(this, "isExtensionAvailable", false);
    __publicField(this, "messageQueue", []);
    __publicField(this, "eventHandlers", /* @__PURE__ */ new Map());
    __publicField(this, "nodeRegistry", /* @__PURE__ */ new Map());
    this.config = __spreadValues({
      namespace: "magicbutton-sdk",
      enableAutoCollection: true,
      enableUserTracking: false,
      debug: false
    }, config);
    this.log("SDK created with config:", this.config);
  }
  /**
   * Initialize the SDK and establish communication with extension
   */
  initialize() {
    return __async(this, null, function* () {
      if (this.isInitialized) {
        this.log("SDK already initialized");
        return this.isExtensionAvailable;
      }
      this.log("Initializing SDK...");
      try {
        this.isExtensionAvailable = yield this.detectExtension();
        if (this.isExtensionAvailable) {
          this.setupMessageBridge();
          yield this.registerPage();
          if (this.config.enableAutoCollection) {
            this.enableAutoCollection();
          }
          yield this.processMessageQueue();
          this.log("SDK initialized successfully");
        } else {
          this.log("Extension not detected - SDK running in standalone mode");
        }
        this.isInitialized = true;
        this.emit("sdk:initialized", { available: this.isExtensionAvailable });
        return this.isExtensionAvailable;
      } catch (error) {
        this.error("Failed to initialize SDK:", error);
        return false;
      }
    });
  }
  /**
   * Detect if Magic Button Player extension is available
   */
  detectExtension() {
    return __async(this, null, function* () {
      return new Promise((resolve) => {
        window.postMessage({
          type: "MAGICBUTTON_SDK_DETECTION",
          timestamp: Date.now()
        }, window.location.origin);
        const listener = (event) => {
          if (event.source === window && event.data.type === "MAGICBUTTON_EXTENSION_RESPONSE") {
            window.removeEventListener("message", listener);
            resolve(true);
          }
        };
        window.addEventListener("message", listener);
        setTimeout(() => {
          window.removeEventListener("message", listener);
          resolve(false);
        }, 1e3);
      });
    });
  }
  /**
   * Set up message bridge with extension
   */
  setupMessageBridge() {
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      if (event.data.type === "MAGICBUTTON_SDK_RESPONSE") {
        this.handleExtensionMessage(event.data);
      }
    });
  }
  /**
   * Register current page with extension
   */
  registerPage() {
    return __async(this, null, function* () {
      const pageData = this.collectPageData();
      yield this.sendMessage({
        type: "REGISTER_PAGE",
        data: __spreadProps(__spreadValues({}, pageData), {
          sdkVersion: "2.0.0",
          config: this.config
        })
      });
    });
  }
  /**
   * Collect basic page data
   */
  collectPageData() {
    return {
      url: window.location.href,
      title: document.title,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      // OpenGraph data
      openGraph: this.extractOpenGraphData(),
      // Schema.org data
      structuredData: this.extractStructuredData()
    };
  }
  /**
   * Extract OpenGraph metadata
   */
  extractOpenGraphData() {
    const ogData = {};
    const ogTags = document.querySelectorAll('meta[property^="og:"]');
    ogTags.forEach((tag) => {
      var _a;
      const property = (_a = tag.getAttribute("property")) == null ? void 0 : _a.replace("og:", "");
      const content = tag.getAttribute("content");
      if (property && content) {
        ogData[property] = content;
      }
    });
    return ogData;
  }
  /**
   * Extract structured data (JSON-LD)
   */
  extractStructuredData() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const structuredData = [];
    scripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent || "");
        structuredData.push(data);
      } catch (error) {
        this.log("Failed to parse structured data:", error);
      }
    });
    return structuredData;
  }
  // ============================================================================
  // Public API Methods
  // ============================================================================
  /**
   * Add a node to the user state graph
   */
  addNode(node) {
    return __async(this, null, function* () {
      const nodeId = node.id || this.generateNodeId();
      this.nodeRegistry.set(nodeId, __spreadProps(__spreadValues({}, node), { id: nodeId }));
      if (this.isExtensionAvailable) {
        yield this.sendMessage({
          type: "ADD_NODE",
          data: __spreadProps(__spreadValues({
            id: nodeId
          }, node), {
            source: DataSource.SDK,
            timestamp: Date.now()
          })
        });
      }
      this.emit("node:added", { nodeId, node });
      return nodeId;
    });
  }
  /**
   * Add an edge between nodes
   */
  addEdge(edge) {
    return __async(this, null, function* () {
      const edgeId = this.generateEdgeId();
      if (this.isExtensionAvailable) {
        yield this.sendMessage({
          type: "ADD_EDGE",
          data: __spreadProps(__spreadValues({
            id: edgeId
          }, edge), {
            source: DataSource.SDK,
            timestamp: Date.now()
          })
        });
      }
      this.emit("edge:added", { edgeId, edge });
      return edgeId;
    });
  }
  /**
   * Track user action/event
   */
  trackAction(actionType, data) {
    return __async(this, null, function* () {
      const actionData = {
        type: actionType,
        data,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      if (this.isExtensionAvailable) {
        yield this.sendMessage({
          type: "TRACK_ACTION",
          data: actionData
        });
      }
      this.emit("action:tracked", actionData);
    });
  }
  /**
   * Register for tool notifications
   */
  registerForTools(toolTypes) {
    return __async(this, null, function* () {
      if (this.isExtensionAvailable) {
        yield this.sendMessage({
          type: "REGISTER_TOOLS",
          data: { toolTypes }
        });
      }
      this.emit("tools:registered", { toolTypes });
    });
  }
  /**
   * Request user consent for data collection
   */
  requestConsent(dataTypes, purpose) {
    return __async(this, null, function* () {
      if (!this.isExtensionAvailable) {
        return false;
      }
      const response = yield this.sendMessage({
        type: "REQUEST_CONSENT",
        data: { dataTypes, purpose }
      });
      const granted = (response == null ? void 0 : response.granted) || false;
      this.emit("consent:response", { granted, dataTypes, purpose });
      return granted;
    });
  }
  /**
   * Get current user context from extension
   */
  getUserContext() {
    return __async(this, null, function* () {
      if (!this.isExtensionAvailable) {
        return null;
      }
      const response = yield this.sendMessage({
        type: "GET_USER_CONTEXT"
      });
      return (response == null ? void 0 : response.context) || null;
    });
  }
  /**
   * Subscribe to tool activation events
   */
  onToolActivated(callback) {
    this.on("tool:activated", callback);
  }
  /**
   * Subscribe to graph updates
   */
  onGraphUpdated(callback) {
    this.on("graph:updated", callback);
  }
  // ============================================================================
  // Auto-collection Features
  // ============================================================================
  /**
   * Enable automatic data collection
   */
  enableAutoCollection() {
    this.trackPageNavigation();
    if (this.config.enableUserTracking) {
      this.trackUserInteractions();
    }
    this.trackFormSubmissions();
    this.monitorDOMChanges();
  }
  /**
   * Track page navigation events
   */
  trackPageNavigation() {
    this.trackAction("page_loaded", this.collectPageData());
    window.addEventListener("beforeunload", () => {
      this.trackAction("page_unloaded", {
        url: window.location.href,
        timeOnPage: Date.now() - window.__magicButtonPageLoadTime
      });
    });
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackAction("navigation", {
        type: "pushState",
        url: window.location.href
      });
    };
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.trackAction("navigation", {
        type: "replaceState",
        url: window.location.href
      });
    };
    window.addEventListener("popstate", () => {
      this.trackAction("navigation", {
        type: "popstate",
        url: window.location.href
      });
    });
  }
  /**
   * Track user interactions
   */
  trackUserInteractions() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      this.trackAction("click", {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        href: target.getAttribute("href"),
        x: event.clientX,
        y: event.clientY
      });
    });
    let scrollTimeout;
    window.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackAction("scroll", {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
          documentHeight: document.documentElement.scrollHeight,
          viewportHeight: window.innerHeight
        });
      }, 500);
    });
  }
  /**
   * Track form submissions
   */
  trackFormSubmissions() {
    document.addEventListener("submit", (event) => {
      const form = event.target;
      const formData = new FormData(form);
      for (const [key, value] of formData.entries()) {
        if (!this.isSensitiveField(key)) ;
      }
      this.trackAction("form_submitted", {
        action: form.action,
        method: form.method,
        fieldCount: formData.size,
        hasFileUpload: Array.from(form.elements).some(
          (el) => el instanceof HTMLInputElement && el.type === "file"
        )
      });
    });
  }
  /**
   * Monitor DOM changes for dynamic content
   */
  monitorDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      let hasSignificantChanges = false;
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          hasSignificantChanges = true;
        }
      });
      if (hasSignificantChanges) {
        this.trackAction("dom_updated", {
          mutationCount: mutations.length,
          timestamp: Date.now()
        });
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  /**
   * Check if a field name indicates sensitive data
   */
  isSensitiveField(fieldName) {
    const sensitivePatterns = [
      /password/i,
      /ssn|social/i,
      /credit|card/i,
      /cvv|cvc/i,
      /bank/i,
      /secret/i,
      /token/i,
      /api[_-]?key/i
    ];
    return sensitivePatterns.some((pattern) => pattern.test(fieldName));
  }
  // ============================================================================
  // Utility Methods
  // ============================================================================
  /**
   * Send message to extension
   */
  sendMessage(message) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        if (!this.isExtensionAvailable) {
          this.messageQueue.push(message);
          resolve(null);
          return;
        }
        const messageId = this.generateMessageId();
        const timeout = setTimeout(() => {
          reject(new Error("Message timeout"));
        }, 5e3);
        const listener = (event) => {
          if (event.source === window && event.data.type === "MAGICBUTTON_SDK_RESPONSE" && event.data.messageId === messageId) {
            clearTimeout(timeout);
            window.removeEventListener("message", listener);
            resolve(event.data.response);
          }
        };
        window.addEventListener("message", listener);
        window.postMessage({
          type: "MAGICBUTTON_SDK_MESSAGE",
          messageId,
          payload: message
        }, window.location.origin);
      });
    });
  }
  /**
   * Process queued messages
   */
  processMessageQueue() {
    return __async(this, null, function* () {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        try {
          yield this.sendMessage(message);
        } catch (error) {
          this.error("Failed to send queued message:", error);
        }
      }
    });
  }
  /**
   * Handle messages from extension
   */
  handleExtensionMessage(data) {
    switch (data.type) {
      case "TOOL_ACTIVATED":
        this.emit("tool:activated", data.tool);
        break;
      case "GRAPH_UPDATED":
        this.emit("graph:updated", data.update);
        break;
      case "CONSENT_REQUEST":
        this.handleConsentRequest(data);
        break;
      default:
        this.log("Unknown message from extension:", data);
    }
  }
  /**
   * Handle consent request from extension
   */
  handleConsentRequest(data) {
    const granted = confirm(`Allow Magic Button Player to access ${data.dataTypes.join(", ")} for ${data.purpose}?`);
    window.postMessage({
      type: "MAGICBUTTON_SDK_CONSENT_RESPONSE",
      requestId: data.requestId,
      granted
    }, window.location.origin);
  }
  // ============================================================================
  // Event System
  // ============================================================================
  /**
   * Subscribe to SDK events
   */
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }
  /**
   * Unsubscribe from SDK events
   */
  off(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) return;
    if (handler) {
      const handlers = this.eventHandlers.get(eventType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(eventType);
    }
  }
  /**
   * Emit SDK event
   */
  emit(eventType, data) {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        this.error("Event handler error:", error);
      }
    });
  }
  // ============================================================================
  // ID Generation
  // ============================================================================
  generateNodeId() {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  generateEdgeId() {
    return `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  // ============================================================================
  // Logging
  // ============================================================================
  log(...args) {
    if (this.config.debug) {
      console.log("[MagicButton SDK]", ...args);
    }
  }
  error(...args) {
    console.error("[MagicButton SDK]", ...args);
  }
}
if (typeof window !== "undefined") {
  window.__magicButtonPageLoadTime = Date.now();
  const globalConfig = window.MagicButtonConfig;
  if (globalConfig || window.MagicButtonAutoInit) {
    const sdk = new MagicButtonSDK(globalConfig);
    window.MagicButton = sdk;
    window.__MagicButtonSDK = sdk;
    sdk.initialize().then((success) => {
      if (success) {
        console.log("[MagicButton] SDK initialized successfully");
      }
    });
  }
}
export {
  MagicButtonSDK,
  MagicButtonSDK as default
};
//# sourceMappingURL=magicbutton-sdk.mjs.map
