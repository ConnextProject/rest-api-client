import { cleanDeep } from "./helpers";
import { stringify } from "querystring";

export function getSwaggerOptions(docsHost: string, version: string) {
  return {
    urlPrefix: "/documentation",
    swagger: {
      info: {
        title: "Connext Rest API Client",
        description: "testing the fastify swagger api",
        version: version,
      },
      externalDocs: {
        url: "https://docs.connext.network/",
        description: "Find more documentation here",
      },
      host: docsHost,
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      // tags: [
      // ],
    },
    exposeRoute: true,
  };
}

export const WalletSummarySchema = {
  type: "object",
  properties: {
    address: { type: "string" },
    publicIdentifier: { type: "string" },
  },
};

export const ConnectOptionsSchema = {
  type: "object",
  properties: {
    nodeUrl: { type: "string", nullable: true },
    ethProviderUrl: { type: "string", nullable: true },
  },
  nullable: true,
};

export const ChannelConfigResponseSchema = {
  type: "object",
  properties: {
    signerAddress: { type: "string" },
    multisigAddress: { type: "string" },
    nodeUrl: { type: "string" },
    userIdentifier: { type: "string" },
  },
};

export const BalanceResponseSchema = {
  type: "object",
  properties: {
    freeBalanceOffChain: { type: "string", nullable: true },
    freeBalanceOnChain: { type: "string" },
    nodeFreeBalanceOffChain: { type: "string", nullable: true },
  },
};

export const TransactionResponseSchema = {
  type: "object",
  properties: {
    txhash: { type: "string" },
  },
};

export const AppInstanceDetailsSchema = {
  type: "object",
  properties: {
    abiEncodings: {
      type: "object",
      properties: {
        actionEncoding: { type: "string" },
        stateEncoding: { type: "string" },
      },
    },
    appDefinition: { type: "string" },
    appSeqNo: { type: "string" },
    bytecode: { type: "string" },
    defaultTimeout: { type: "string" },
    identityHash: { type: "string" },
    initiatorDeposit: { type: "string" },
    initiatorDepositAssetId: { type: "string" },
    initiatorIdentifier: { type: "string" },
    latestAction: { type: "object" },
    latestState: { type: "object" },
    latestVersionNumber: { type: "string" },
    multisigAddress: { type: "string" },
    outcomeInterpreterParameters: { type: "string" },
    outcomeType: { type: "string" },
    responderDeposit: { type: "string" },
    responderDepositAssetId: { type: "string" },
    responderIdentifier: { type: "string" },
    stateTimeout: { type: "string" },
  },
};

export const EventSubscriptionParamsSchema = {
  type: "object",
  properties: {
    event: { type: "string" },
    webhook: { type: "string" },
  },
};

export const EventSubscriptionResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
};

export const GenericSuccessResponseSchema = {
  type: "object",
  description: "Successful Response",
  properties: {
    success: { type: "boolean" },
  },
};

export const GenericErrorResponseSchema = {
  type: "object",
  description: "Server Error Message",
  properties: {
    message: { type: "string" },
  },
};

export const getRoutes = (authHandler: any, legacyMode: boolean): any =>
  cleanDeep({
    get: {
      health: {
        url: "/health",
        description: "Attest server health",
        opts: {
          schema: {
            response: {
              204: {},
            },
          },
        },
      },
      hello: {
        url: "/hello",
        description: "Get test message response",
        opts: {
          schema: {
            response: {
              200: { type: "string" },
            },
          },
        },
      },
      version: {
        url: "/version",
        description: "Get client version number",
        opts: {
          schema: {
            response: {
              200: {
                type: "object",
                properties: {
                  version: { type: "string" },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      fundingWallet: {
        url: "/funding-wallet",
        description: "Get summary of funding wallet",
        opts: {
          preHandler: authHandler,
          schema: {
            response: {
              200: WalletSummarySchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      fundingBalance: {
        url: "/funding-balance/:assetId",
        description: "Get balance of funding wallet",
        opts: {
          preHandler: authHandler,
          schema: {
            response: {
              200: BalanceResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      wallets: {
        url: "/wallets",
        description: "Get summary of created wallets",
        opts: {
          preHandler: authHandler,
          schema: {
            response: {
              200: {
                type: "array",
                items: WalletSummarySchema,
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      clients: {
        url: "/clients",
        description: "Get summary of running clients",
        opts: {
          preHandler: authHandler,
          schema: {
            response: {
              200: {
                type: "array",
                items: {
                  typeof: "object",
                  properties: {
                    publicIdentifier: { type: "string" },
                    multisigAddress: { type: "string" },
                    signerAddress: { type: "string" },
                    chainId: { type: "number" },
                    token: { type: "string" },
                    tokenBalance: { type: "string" },
                    channelNonce: { type: "number" },
                    proposedApps: { type: "number" },
                    installedApps: { type: "number" },
                  },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      balance: {
        url: !legacyMode ? "/balance/:assetId/:publicIdentifier" : "/balance/:assetId",
        description: "Get on-chain and off-chain balances for specific asset",
        opts: {
          preHandler: authHandler,
          schema: {
            params: {
              type: "object",
              properties: {
                assetId: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: BalanceResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      config: {
        url: !legacyMode ? "/config/:publicIdentifier" : "/config",
        description: "Get channel configuration if client is initialized",
        opts: {
          preHandler: authHandler,
          params: !legacyMode
            ? {
                type: "object",
                properties: {
                  publicIdentifier: { type: "string" },
                },
              }
            : undefined,
          schema: {
            response: {
              200: ChannelConfigResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      hashLockStatus: {
        url: !legacyMode
          ? "/hashlock-status/:lockHash/:assetId/:publicIdentifier"
          : "/hashlock-status/:lockHash/:assetId",
        description: "Get hash lock transfer status and details",
        opts: {
          preHandler: authHandler,
          schema: {
            params: {
              type: "object",
              properties: {
                lockHash: { type: "string" },
                assetId: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: {
                type: "object",
                properties: {
                  senderIdentifier: { type: "string" },
                  receiverIdentifier: { type: "string" },
                  senderAppIdentityHash: { type: "string", nullable: true },
                  receiverAppIdentityHash: { type: "string", nullable: true },
                  assetId: { type: "string" },
                  amount: { type: "string" },
                  lockHash: { type: "string" },
                  status: { type: "string" },
                  preImage: { type: "string" },
                  expiry: { type: "string" },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      linkedStatus: {
        url: !legacyMode
          ? "/linked-status/:paymentId/:publicIdentifier"
          : "/linked-status/:paymentId",
        description: "Get linked transfer status and details",
        opts: {
          preHandler: authHandler,
          schema: {
            params: {
              type: "object",
              properties: {
                paymentId: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: {
                type: "object",
                properties: {
                  paymentId: { type: "string" },
                  createdAt: { type: "string" },
                  amount: { type: "string" },
                  assetId: { type: "string" },
                  senderIdentifier: { type: "string" },
                  receiverIdentifier: { type: "string" },
                  status: { type: "string" },
                  encryptedPreImage: { type: "string" },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      appinstanceDetails: {
        url: !legacyMode
          ? "/appinstance-details/:appIdentityHash/:publicIdentifier"
          : "/appinstance-details/:appIdentityHash",
        description: "Get app instance details",
        opts: {
          preHandler: authHandler,
          schema: {
            params: {
              type: "object",
              properties: {
                appIdentityHash: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: AppInstanceDetailsSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      transferHistory: {
        url: !legacyMode ? "/transfer-history/:publicIdentifier" : "/transfer-history",
        description: "Get all channel transfer history",
        opts: {
          preHandler: authHandler,
          schema: {
            params: !legacyMode
              ? {
                  type: "object",
                  properties: {
                    publicIdentifier: { type: "string" },
                  },
                }
              : undefined,
            response: {
              200: {
                type: "array",
                items: {
                  typeof: "object",
                  properties: {
                    paymentId: { type: "string" },
                    amount: { type: "string" },
                    assetId: { type: "string" },
                    senderIdentifier: { type: "string" },
                    receiverIdentifier: { type: "string" },
                  },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
    },
    post: {
      create: {
        url: "/create",
        description: "Create wallet for provided index",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                index: { type: "number" },
              },
            },
            response: {
              200: WalletSummarySchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      connect: {
        url: "/connect",
        description: "Connect client channel for provided publicIdentifier or default",
        opts: {
          preHandler: authHandler,
          schema: {
            body: ConnectOptionsSchema,
            response: {
              200: ChannelConfigResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      disconnect: {
        url: "/disconnect",
        description: "Disconnect client channel for provided public identifier",
        opts: {
          preHandler: authHandler,
          schema: {
            body: !legacyMode
              ? {
                  type: "object",
                  properties: {
                    publicIdentifier: { type: "string" },
                  },
                }
              : undefined,
            response: {
              200: ChannelConfigResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },

      mnemonic: {
        url: "/mnemonic",
        description: "Provide or update client's mnemonic",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                mnemonic: { type: "string" },
              },
            },
            response: {
              200: GenericSuccessResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      onchainTransfer: {
        url: "/onchain-transfer",
        description: "Submit on-chain transaction",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                amount: { type: "string" },
                assetId: { type: "string" },
                recipient: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: TransactionResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      hashLockTransfer: {
        url: "/hashlock-transfer",
        description: "Create hash lock transfer",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                amount: { type: "string" },
                assetId: { type: "string" },
                lockHash: { type: "string" },
                timelock: { type: "string" },
                recipient: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: {
                type: "object",
                properties: {
                  appInstance: AppInstanceDetailsSchema,
                  amount: { type: "string" },
                  appIdentityHash: { type: "string" },
                  assetId: { type: "string" },
                  paymentId: { type: "string" },
                  preImage: { type: "string" },
                  sender: { type: "string" },
                  recipient: { type: "string" },
                  transferMeta: { type: "object" },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      hashLockResolve: {
        url: "/hashlock-resolve",
        description: "Resolve hash lock transfer",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                preImage: { type: "string" },
                assetId: { type: "string" },
                paymentId: { type: "string", nullable: true },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: {
                type: "object",
                properties: {
                  appIdentityHash: { type: "string" },
                  sender: { type: "string" },
                  amount: { type: "string" },
                  assetId: { type: "string" },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      linkedTransfer: {
        url: "/linked-transfer",
        description: "Create linked transfer",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                amount: { type: "string" },
                assetId: { type: "string" },
                preImage: { type: "string", nullable: true },
                paymentId: { type: "string", nullable: true },
                recipient: { type: "string", nullable: true },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
                requireOnline: { type: "boolean", nullable: true },
              },
            },
            response: {
              200: {
                type: "object",
                properties: {
                  appInstance: AppInstanceDetailsSchema,
                  amount: { type: "string" },
                  appIdentityHash: { type: "string" },
                  assetId: { type: "string" },
                  paymentId: { type: "string" },
                  preImage: { type: "string" },
                  sender: { type: "string" },
                  recipient: { type: "string" },
                  transferMeta: { type: "object" },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      linkedResolve: {
        url: "/linked-resolve",
        description: "Resolve linked transfer",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                preImage: { type: "string" },
                paymentId: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: {
                type: "object",
                properties: {
                  appIdentityHash: { type: "string" },
                  sender: { type: "string" },
                  paymentId: { type: "string" },
                  amount: { type: "string" },
                  assetId: { type: "string" },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      fund: {
        url: "/fund",
        description: "Fund asset on channel from funding wallet",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                amount: { type: "string" },
                assetId: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: TransactionResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },

      deposit: {
        url: "/deposit",
        description: "Deposit asset on channel",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                amount: { type: "string" },
                assetId: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
                estimateGas: { type: "boolean" },
              },
            },
            response: {
              200: TransactionResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      requestDepositRights: {
        url: "/request-deposit-rights",
        description: "Request deposit rights for an asset on channel",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                assetId: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: {
                type: "object",
                properties: {
                  appIdentityHash: { type: "string" },
                  multisigAddress: { type: "string" },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      rescindDepositRights: {
        url: "/rescind-deposit-rights",
        description: "Rescind deposit rights for an asset on channel",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                assetId: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: {
                type: "object",
                properties: {
                  freeBalance: { type: "string" },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      requestCollateral: {
        url: "/request-collateral",
        description: "Request collateral for an asset",
        opts: {
          schema: {
            body: {
              type: "object",
              properties: {
                assetId: { type: "string" },
                amount: { type: "string", nullable: true },
              },
            },
            response: {
              200: GenericSuccessResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      swap: {
        url: "/swap",
        description: "Swap asset on channel",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                amount: { type: "string" },
                fromAssetId: { type: "string" },
                swapRate: { type: "string" },
                toAssetId: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: {
                fromAssetIdBalance: { type: "string" },
                toAssetIdBalance: { type: "string" },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      withdraw: {
        url: "/withdraw",
        description: "Withdraw asset from channel",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                amount: { type: "string" },
                assetId: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: TransactionResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      rejectInstall: {
        url: "/reject-install",
        description: "Reject Install App for provided appIdentityHash",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                appIdentityHash: { type: "string" },
                reason: { type: "string", nullable: true },
              },
            },
            response: {
              200: {
                type: "object",
                properties: {
                  appIdentityHash: { type: "string" },
                  multisigAddress: { type: "string" },
                  uninstalledApp: AppInstanceDetailsSchema,
                  action: { type: "string", nullable: true },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      subscribe: {
        url: "/subscribe",
        description: "Subscribe to client event",
        opts: {
          preHandler: authHandler,
          schema: {
            body: legacyMode
              ? EventSubscriptionParamsSchema
              : {
                  type: "object",
                  propertiers: {
                    ...EventSubscriptionParamsSchema.properties,
                    publicIdentifier: { type: "string" },
                  },
                },
            response: {
              200: EventSubscriptionResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      batchSubscribe: {
        url: "/subscribe/batch",
        description: "Batch subscribe to client events",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                params: { type: "array", items: EventSubscriptionParamsSchema },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: {
                type: "object",
                properties: {
                  subscriptions: { type: "array", items: EventSubscriptionResponseSchema },
                },
              },
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
    },
    delete: {
      subscribe: {
        url: "/subscribe",
        description: "Unsubscribe to client event",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                id: { type: "string" },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: GenericSuccessResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      batchSubscribe: {
        url: "/subscribe/batch",
        description: "Batch unsubscribe to client events",
        opts: {
          preHandler: authHandler,
          schema: {
            body: {
              type: "object",
              properties: {
                ids: { type: "array", items: { type: "string" } },
                publicIdentifier: !legacyMode ? { type: "string" } : undefined,
              },
            },
            response: {
              200: GenericSuccessResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
      subscribeAll: {
        url: "/subscribe/all",
        description: "Unsuscribe all client events",
        opts: {
          preHandler: authHandler,
          schema: {
            body: !legacyMode
              ? {
                  type: "object",
                  properties: {
                    publicIdentifier: { type: "string" },
                  },
                }
              : undefined,
            response: {
              200: GenericSuccessResponseSchema,
              500: GenericErrorResponseSchema,
            },
          },
        },
      },
    },
  });
