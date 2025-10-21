// Pi Network SDK Type Definitions

export interface PiUser {
  uid: string;
  username: string;
  accessToken?: string;
}

export interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  from_address: string;
  to_address: string;
  direction: 'user_to_app' | 'app_to_user';
  created_at: string;
  network: 'Pi Network' | 'Pi Testnet';
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction?: {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

export interface PaymentDTO {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
}

export interface PiCallbacks {
  onReadyForServerApproval?: (paymentId: string) => void;
  onReadyForServerCompletion?: (paymentId: string, txid: string) => void;
  onCancel?: (paymentId: string) => void;
  onError?: (error: Error, payment?: PiPayment) => void;
}

export interface PiSDK {
  init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
  authenticate: (scopes: string[], onIncompletePaymentFound?: (payment: PiPayment) => void) => Promise<PiUser>;
  createPayment: (paymentData: PaymentDTO, callbacks: PiCallbacks) => Promise<PiPayment>;
  openShareDialog: (title: string, message: string) => Promise<void>;
}

declare global {
  interface Window {
    Pi: PiSDK;
  }
}

export {};
