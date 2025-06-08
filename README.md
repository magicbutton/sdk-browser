# Magic Button Player V2 - Content SDK

Integrate your website with Magic Button Player V2 to enable intelligent automation and user state tracking.

## Quick Start

### Option 1: Auto-initialization

Add this script tag to your HTML:

```html
<script src="https://cdn.magicbutton.cloud/sdk/v2/magicbutton-init.js"></script>
```

### Option 2: Manual initialization

```html
<!-- Configure before loading -->
<script>
  window.MagicButtonConfig = {
    enableAutoCollection: true,
    enableUserTracking: false,
    debug: true
  };
</script>
<script src="https://cdn.magicbutton.cloud/sdk/v2/magicbutton-sdk.umd.js"></script>
```

### Option 3: ES Module

```javascript
import MagicButtonSDK from './magicbutton-sdk.es.js';

const sdk = new MagicButtonSDK({
  enableAutoCollection: true,
  debug: true
});

await sdk.initialize();
```

## Usage Examples

### Add nodes to the user state graph

```javascript
// Add a product node
const productId = await window.MagicButton.addNode({
  type: 'product',
  data: {
    title: 'Gaming Laptop',
    price: 1299,
    brand: 'TechCorp'
  }
});

// Add a person node
const personId = await window.MagicButton.addNode({
  type: 'person',
  data: {
    name: 'John Doe',
    role: 'Software Engineer'
  }
});
```

### Create relationships

```javascript
// Link person to product (interested_in)
await window.MagicButton.addEdge({
  fromNodeId: personId,
  toNodeId: productId,
  type: 'interested_in',
  data: { weight: 0.8 }
});
```

### Track user actions

```javascript
// Track custom events
await window.MagicButton.trackAction('product_viewed', {
  productId: 'laptop-123',
  viewDuration: 30000,
  source: 'search'
});

// Track form completion
await window.MagicButton.trackAction('form_completed', {
  formType: 'contact',
  fields: ['name', 'email', 'message']
});
```

### Subscribe to tool events

```javascript
// Listen for tool activations
window.MagicButton.onToolActivated((tool) => {
  console.log('Tool activated:', tool.toolId);
  
  if (tool.toolId === 'price-comparison') {
    // Provide product data to the tool
    tool.setData({
      products: getProductsOnPage()
    });
  }
});
```

### Request user consent

```javascript
// Request permission to collect specific data
const granted = await window.MagicButton.requestConsent(
  ['browsing_history', 'form_data'],
  'product_recommendations'
);

if (granted) {
  // Enable enhanced tracking
  enableDetailedTracking();
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `namespace` | string | 'magicbutton-sdk' | SDK namespace for storage |
| `enableAutoCollection` | boolean | true | Auto-collect page data |
| `enableUserTracking` | boolean | false | Track user interactions |
| `apiKey` | string | undefined | API key for authentication |
| `debug` | boolean | false | Enable debug logging |

## Events

The SDK emits the following events:

- `sdk:initialized` - SDK is ready
- `node:added` - Node added to graph
- `edge:added` - Edge added to graph
- `action:tracked` - User action tracked
- `tool:activated` - Tool was activated
- `graph:updated` - Graph was updated
- `consent:response` - Consent request response

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Privacy

The SDK respects user privacy and requires explicit consent for data collection. All sensitive form fields are automatically excluded from tracking.

## TypeScript Support

TypeScript definitions are included. Import the types:

```typescript
import { MagicButtonSDK, SDKConfig, SDKNode } from './magicbutton-sdk';
```