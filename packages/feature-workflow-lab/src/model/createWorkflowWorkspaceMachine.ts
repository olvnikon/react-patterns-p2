import {
  assign,
  fromCallback,
  setup,
  stopChild,
  type ActorRefFrom,
} from 'xstate';

import type { OrderSide } from './orderTicketTypes';
import type {
  OrderTicketLogic,
} from './createOrderTicketMachine';
import type {
  OrderTicketParentEvent,
  OrderTicketParentRef,
} from './orderTicketTypes';
import type { ExternalContextSource } from './externalContextSource';

export type OrderTicketActor = ActorRefFrom<OrderTicketLogic>;

type WorkflowWorkspaceContext = {
  tickets: Record<string, OrderTicketActor>;
  selectedTicketId?: string;
  activity: string[];
  nextTicketNumber: number;
};

export type WorkflowWorkspaceEvent =
  | {
      type: 'ticket.open';
    }
  | {
      type: 'ticket.close';
      ticketId: string;
    }
  | {
      type: 'ticket.select';
      ticketId: string;
    }
  | {
      type: 'workspace.side.change';
      side: OrderSide;
    }
  | {
      type: 'external.instrument.selected';
      instrumentId: string;
    }
  | OrderTicketParentEvent;

function appendActivity(
  activity: string[],
  message: string,
): string[] {
  return [message, ...activity].slice(0, 8);
}

export function createWorkflowWorkspaceMachine(
  orderTicketLogic: OrderTicketLogic,
  externalContextSource: ExternalContextSource,
) {
  // Adapt the external callback API into the workspace event protocol.
  const externalContextActor = fromCallback<
    WorkflowWorkspaceEvent
  >(({ sendBack }) =>
    externalContextSource.subscribeInstrument((instrumentId) => {
      sendBack({
        type: 'external.instrument.selected',
        instrumentId,
      });
    }),
  );

  return setup({
    types: {
      context: {} as WorkflowWorkspaceContext,
      events: {} as WorkflowWorkspaceEvent,
    },
    actors: {
      externalContextActor,
      orderTicket: orderTicketLogic,
    },
    guards: {
      ticketExists: ({ context, event }) =>
        event.type === 'ticket.close' &&
        context.tickets[event.ticketId] !== undefined,
    },
  }).createMachine({
    id: 'workflowWorkspace',
    context: {
      tickets: {},
      selectedTicketId: undefined,
      activity: [],
      nextTicketNumber: 4,
    },
    entry: assign({
      // Spawned tickets share logic but own independent state and mailboxes.
      tickets: ({ spawn, self }) => {
        const parent = self as OrderTicketParentRef;
        const ticketOne = spawn('orderTicket', {
          id: 'order-ticket-TICKET-01',
          input: {
            ticketId: 'TICKET-01',
            initialInstrumentId: 'INST-ALPHA',
            parent,
          },
        });
        const ticketTwo = spawn('orderTicket', {
          id: 'order-ticket-TICKET-02',
          input: {
            ticketId: 'TICKET-02',
            initialInstrumentId: 'INST-BETA',
            parent,
          },
        });
        const ticketThree = spawn('orderTicket', {
          id: 'order-ticket-TICKET-03',
          input: {
            ticketId: 'TICKET-03',
            initialInstrumentId: 'INST-GAMMA',
            parent,
          },
        });

        return {
          'TICKET-01': ticketOne,
          'TICKET-02': ticketTwo,
          'TICKET-03': ticketThree,
        };
      },
      selectedTicketId: 'TICKET-01',
      activity: ['Workspace actor started three ticket actors.'],
    }),
    invoke: {
      id: 'external-context-adapter',
      src: 'externalContextActor',
    },
    on: {
      'ticket.open': {
        actions: assign({
          tickets: ({ context, spawn, self }) => {
            const ticketId = `TICKET-${String(
              context.nextTicketNumber,
            ).padStart(2, '0')}`;
            const ticket = spawn('orderTicket', {
              id: `order-ticket-${ticketId}`,
              input: {
                ticketId,
                initialInstrumentId: 'INST-ALPHA',
                parent: self as OrderTicketParentRef,
              },
            });

            return {
              ...context.tickets,
              [ticketId]: ticket,
            };
          },
          selectedTicketId: ({ context }) =>
            `TICKET-${String(context.nextTicketNumber).padStart(2, '0')}`,
          activity: ({ context }) =>
            appendActivity(
              context.activity,
              `Spawned TICKET-${String(context.nextTicketNumber).padStart(
                2,
                '0',
              )}.`,
            ),
          nextTicketNumber: ({ context }) => context.nextTicketNumber + 1,
        }),
      },
      'ticket.close': {
        guard: 'ticketExists',
        actions: [
          // Stop the process before removing its reference from parent state.
          stopChild(
            ({ context, event }) => context.tickets[event.ticketId],
          ),
          assign({
            tickets: ({ context, event }) => {
              if (event.type !== 'ticket.close') {
                return context.tickets;
              }

              const remainingTickets = {
                ...context.tickets,
              };
              delete remainingTickets[event.ticketId];
              return remainingTickets;
            },
            selectedTicketId: ({ context, event }) => {
              if (
                event.type !== 'ticket.close' ||
                context.selectedTicketId !== event.ticketId
              ) {
                return context.selectedTicketId;
              }

              return Object.keys(context.tickets).find(
                (ticketId) => ticketId !== event.ticketId,
              );
            },
            activity: ({ context, event }) =>
              event.type === 'ticket.close'
                ? appendActivity(
                    context.activity,
                    `Stopped ${event.ticketId}.`,
                  )
                : context.activity,
          }),
        ],
      },
      'ticket.select': {
        actions: assign({
          selectedTicketId: ({ context, event }) =>
            context.tickets[event.ticketId]
              ? event.ticketId
              : context.selectedTicketId,
        }),
      },
      'workspace.side.change': {
        actions: [
          // Broadcast is explicit: the parent targets each known actor.
          ({ context, event }) => {
            for (const ticket of Object.values(context.tickets)) {
              ticket.send({
                type: 'SIDE_CHANGED',
                value: event.side,
              });
            }
          },
          assign({
            activity: ({ context, event }) =>
              appendActivity(
                context.activity,
                `Sent ${event.side} to every ticket actor.`,
              ),
          }),
        ],
      },
      'external.instrument.selected': {
        actions: [
          // External context is routed only to the selected child actor.
          ({ context, event }) => {
            if (!context.selectedTicketId) {
              return;
            }

            context.tickets[context.selectedTicketId]?.send({
              type: 'INSTRUMENT_CHANGED',
              value: event.instrumentId,
            });
          },
          assign({
            activity: ({ context, event }) =>
              appendActivity(
                context.activity,
                `Adapter routed ${event.instrumentId} to ${
                  context.selectedTicketId ?? 'no selected ticket'
                }.`,
              ),
          }),
        ],
      },
      'ticket.accepted': {
        actions: assign({
          activity: ({ context, event }) =>
            appendActivity(
              context.activity,
              `${event.ticketId} reported accepted as ${event.orderId}.`,
            ),
        }),
      },
      'ticket.blocked': {
        actions: assign({
          activity: ({ context, event }) =>
            appendActivity(
              context.activity,
              `${event.ticketId} reported a blocked outcome.`,
            ),
        }),
      },
      'ticket.failed': {
        actions: assign({
          activity: ({ context, event }) =>
            appendActivity(
              context.activity,
              `${event.ticketId} reported failure: ${event.message}`,
            ),
        }),
      },
    },
  });
}

export type WorkflowWorkspaceLogic = ReturnType<
  typeof createWorkflowWorkspaceMachine
>;
