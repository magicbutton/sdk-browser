/**
 * Magic Button Player V2 - TypeScript Definitions
 */

export interface SDKConfig {
  namespace?: string;
  enableAutoCollection?: boolean;
  enableUserTracking?: boolean;
  apiKey?: string;
  debug?: boolean;
}

export interface SDKNode {
  type: string;
  data: any;
  id?: string;
  metadata?: Record<string, any>;
}

export interface SDKEdge {
  fromNodeId: string;
  toNodeId: string;
  type: string;
  data?: any;
}

export interface ToolContext {
  toolId: string;
  permissions: string[];
  data: any;
}

export declare class MagicButtonSDK {
  constructor(config?: SDKConfig);
  
  initialize(): Promise<boolean>;
  addNode(node: SDKNode): Promise<string>;
  addEdge(edge: SDKEdge): Promise<string>;
  trackAction(actionType: string, data: any): Promise<void>;
  registerForTools(toolTypes: string[]): Promise<void>;
  requestConsent(dataTypes: string[], purpose: string): Promise<boolean>;
  getUserContext(): Promise<any>;
  
  onToolActivated(callback: (tool: ToolContext) => void): void;
  onGraphUpdated(callback: (update: any) => void): void;
  on(eventType: string, handler: Function): void;
  off(eventType: string, handler?: Function): void;
}

declare global {
  interface Window {
    MagicButton?: MagicButtonSDK;
    MagicButtonConfig?: SDKConfig;
    MagicButtonAutoInit?: boolean;
  }
}

export default MagicButtonSDK;