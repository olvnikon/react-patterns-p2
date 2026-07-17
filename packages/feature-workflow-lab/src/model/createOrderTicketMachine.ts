import {
  assign,
  fromPromise,
  setup,
} from 'xstate';

import type {
  CheckDecision,
  DemoOutcome,
  OrderDraft,
  OrderReceipt,
  OrderSide,
  OrderTicketInput,
  OrderTicketParentRef,
  OrderTicketServices,
} from './orderTicketTypes';

type OrderTicketContext = {
  ticketId: string;
  draft: OrderDraft;
  outcome: DemoOutcome;
  idempotencyKey: string;
  decision?: CheckDecision;
  receipt?: OrderReceipt;
  errorMessage?: string;
  parent?: OrderTicketParentRef;
};

export type OrderTicketEvent =
  | {
      type: 'INSTRUMENT_CHANGED';
      value: string;
    }
  | {
      type: 'SIDE_CHANGED';
      value: OrderSide;
    }
  | {
      type: 'QUANTITY_CHANGED';
      value: number;
    }
  | {
      type: 'OUTCOME_CHANGED';
      value: DemoOutcome;
    }
  | {
      type: 'SUBMIT';
    }
  | {
      type: 'CONFIRM';
    }
  | {
      type: 'EDIT';
    }
  | {
      type: 'RECONCILE';
    }
  | {
      type: 'RETRY';
    }
  | {
      type: 'RESET';
    };

function validateDraft(draft: OrderDraft): string | undefined {
  if (draft.instrumentId.trim().length === 0) {
    return 'Instrument is required.';
  }

  if (!Number.isFinite(draft.quantity) || draft.quantity <= 0) {
    return 'Quantity must be greater than zero.';
  }

  return undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Workflow operation failed.';
}

export function createOrderTicketMachine(
  services: OrderTicketServices,
) {
  return setup({
    types: {
      context: {} as OrderTicketContext,
      events: {} as OrderTicketEvent,
      input: {} as OrderTicketInput,
    },
    actors: {
      checkOrder: fromPromise(
        ({
          input,
          signal,
        }: {
          input: {
            draft: OrderDraft;
            outcome: DemoOutcome;
          };
          signal: AbortSignal;
        }) =>
          services.checkOrder({
            ...input,
            signal,
          }),
      ),
      submitOrder: fromPromise(
        ({
          input,
          signal,
        }: {
          input: {
            draft: OrderDraft;
            outcome: DemoOutcome;
            idempotencyKey: string;
          };
          signal: AbortSignal;
        }) =>
          services.submitOrder({
            ...input,
            signal,
          }),
      ),
      reconcileOrder: fromPromise(
        ({
          input,
          signal,
        }: {
          input: {
            idempotencyKey: string;
          };
          signal: AbortSignal;
        }) =>
          services.reconcileOrder({
            ...input,
            signal,
          }),
      ),
    },
  }).createMachine({
    id: 'orderTicket',
    initial: 'editing',
    context: ({ input }) => ({
      ticketId: input.ticketId,
      draft: {
        instrumentId: input.initialInstrumentId ?? 'INST-ALPHA',
        side: 'BUY',
        quantity: 100,
      },
      outcome: 'accepted',
      idempotencyKey: crypto.randomUUID(),
      parent: input.parent,
    }),
    states: {
      // Finite states define which events are legal; context stores workflow data.
      editing: {
        entry: assign({
          decision: undefined,
          receipt: undefined,
        }),
        on: {
          INSTRUMENT_CHANGED: {
            actions: assign({
              draft: ({ context, event }) => ({
                ...context.draft,
                instrumentId: event.value,
              }),
              errorMessage: undefined,
            }),
          },
          SIDE_CHANGED: {
            actions: assign({
              draft: ({ context, event }) => ({
                ...context.draft,
                side: event.value,
              }),
            }),
          },
          QUANTITY_CHANGED: {
            actions: assign({
              draft: ({ context, event }) => ({
                ...context.draft,
                quantity: event.value,
              }),
              errorMessage: undefined,
            }),
          },
          OUTCOME_CHANGED: {
            actions: assign({
              outcome: ({ event }) => event.value,
            }),
          },
          SUBMIT: [
            {
              guard: ({ context }) =>
                validateDraft(context.draft) === undefined,
              target: 'checking',
              actions: assign({
                errorMessage: undefined,
              }),
            },
            {
              actions: assign({
                errorMessage: ({ context }) => validateDraft(context.draft),
              }),
            },
          ],
        },
      },
      checking: {
        // Invoked work starts and stops with the state that owns it.
        invoke: {
          src: 'checkOrder',
          input: ({ context }) => ({
            draft: context.draft,
            outcome: context.outcome,
          }),
          onDone: [
            {
              guard: ({ event }) => event.output.status === 'approved',
              target: 'confirming',
              actions: assign({
                decision: ({ event }) => event.output,
              }),
            },
            {
              target: 'blocked',
              actions: assign({
                decision: ({ event }) => event.output,
              }),
            },
          ],
          onError: {
            target: 'failed',
            actions: assign({
              errorMessage: ({ event }) => getErrorMessage(event.error),
            }),
          },
        },
      },
      blocked: {
        entry: ({ context }) => {
          context.parent?.send({
            type: 'ticket.blocked',
            ticketId: context.ticketId,
            message: context.decision?.message ?? 'Order blocked.',
          });
        },
        on: {
          EDIT: {
            target: 'editing',
          },
        },
      },
      confirming: {
        on: {
          CONFIRM: {
            target: 'submitting',
          },
          EDIT: {
            target: 'editing',
          },
        },
      },
      submitting: {
        entry: assign({
          errorMessage: undefined,
        }),
        invoke: {
          src: 'submitOrder',
          input: ({ context }) => ({
            draft: context.draft,
            outcome: context.outcome,
            idempotencyKey: context.idempotencyKey,
          }),
          onDone: {
            target: 'accepted',
            actions: assign({
              receipt: ({ event }) => event.output,
            }),
          },
          onError: {
            target: 'failed',
            actions: assign({
              errorMessage: ({ event }) => getErrorMessage(event.error),
            }),
          },
        },
        after: {
          800: {
            // A client timeout means unknown outcome, not business rejection.
            guard: ({ context }) =>
              context.outcome === 'timeout-reconciles' ||
              context.outcome === 'timeout-not-found',
            target: 'outcomeUnknown',
          },
        },
      },
      outcomeUnknown: {
        on: {
          RECONCILE: {
            target: 'reconciling',
          },
        },
      },
      reconciling: {
        // Reuse the idempotency key before deciding whether retry is safe.
        invoke: {
          src: 'reconcileOrder',
          input: ({ context }) => ({
            idempotencyKey: context.idempotencyKey,
          }),
          onDone: [
            {
              guard: ({ event }) => event.output !== null,
              target: 'accepted',
              actions: assign({
                receipt: ({ event }) => event.output ?? undefined,
              }),
            },
            {
              target: 'failed',
              actions: assign({
                errorMessage:
                  'No accepted order was found during reconciliation.',
              }),
            },
          ],
          onError: {
            target: 'failed',
            actions: assign({
              errorMessage: ({ event }) => getErrorMessage(event.error),
            }),
          },
        },
      },
      accepted: {
        // Child actors report facts; they never mutate parent state directly.
        entry: ({ context }) => {
          context.parent?.send({
            type: 'ticket.accepted',
            ticketId: context.ticketId,
            orderId: context.receipt?.orderId ?? 'ORD-UNKNOWN',
          });
        },
        on: {
          RESET: {
            target: 'editing',
            actions: assign({
              idempotencyKey: () => crypto.randomUUID(),
              errorMessage: undefined,
              decision: undefined,
              receipt: undefined,
            }),
          },
        },
      },
      failed: {
        entry: ({ context }) => {
          context.parent?.send({
            type: 'ticket.failed',
            ticketId: context.ticketId,
            message: context.errorMessage ?? 'Order workflow failed.',
          });
        },
        on: {
          RETRY: {
            target: 'editing',
            actions: assign({
              idempotencyKey: () => crypto.randomUUID(),
              errorMessage: undefined,
            }),
          },
        },
      },
    },
  });
}

export type OrderTicketLogic = ReturnType<typeof createOrderTicketMachine>;
