import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useMachine } from '@xstate/react';

import type {
  DemoOutcome,
  OrderSide,
} from '../model/orderTicketTypes';
import type {
  OrderTicketEvent,
  OrderTicketLogic,
} from '../model/createOrderTicketMachine';

export type OrderTicketViewState = {
  ticketId: string;
  status: string;
  instrumentId: string;
  side: OrderSide;
  quantity: number;
  outcome: DemoOutcome;
  idempotencyKey: string;
  decisionMessage?: string;
  orderId?: string;
  errorMessage?: string;
  lastEvent: string;
  canEdit: boolean;
  canSubmit: boolean;
  canConfirm: boolean;
  canReconcile: boolean;
  canRetry: boolean;
  canReset: boolean;
};

export type UseOrderTicketResult = {
  state: OrderTicketViewState;
  api: {
    changeInstrument(value: string): void;
    changeSide(value: OrderSide): void;
    changeQuantity(value: number): void;
    changeOutcome(value: DemoOutcome): void;
    submit(): void;
    confirm(): void;
    edit(): void;
    reconcile(): void;
    retry(): void;
    reset(): void;
  };
};

export function useOrderTicket(
  logic: OrderTicketLogic,
  ticketId: string,
): UseOrderTicketResult {
  const [snapshot, machineSend] = useMachine(logic, {
    input: {
      ticketId,
      initialInstrumentId: 'INST-ALPHA',
    },
  });
  const [lastEvent, setLastEvent] = useState('machine.started');

  const send = useCallback(
    (event: OrderTicketEvent) => {
      setLastEvent(event.type);
      machineSend(event);
    },
    [machineSend],
  );

  const state = useMemo<OrderTicketViewState>(
    () => ({
      ticketId: snapshot.context.ticketId,
      status: String(snapshot.value),
      instrumentId: snapshot.context.draft.instrumentId,
      side: snapshot.context.draft.side,
      quantity: snapshot.context.draft.quantity,
      outcome: snapshot.context.outcome,
      idempotencyKey: snapshot.context.idempotencyKey,
      decisionMessage: snapshot.context.decision?.message,
      orderId: snapshot.context.receipt?.orderId,
      errorMessage: snapshot.context.errorMessage,
      lastEvent,
      canEdit: snapshot.matches('editing'),
      canSubmit:
        snapshot.matches('editing') &&
        snapshot.context.draft.instrumentId.trim().length > 0 &&
        snapshot.context.draft.quantity > 0,
      canConfirm: snapshot.matches('confirming'),
      canReconcile: snapshot.matches('outcomeUnknown'),
      canRetry: snapshot.matches('failed'),
      canReset: snapshot.matches('accepted'),
    }),
    [lastEvent, snapshot],
  );

  const api = useMemo(
    () => ({
      changeInstrument(value: string) {
        send({
          type: 'INSTRUMENT_CHANGED',
          value,
        });
      },
      changeSide(value: OrderSide) {
        send({
          type: 'SIDE_CHANGED',
          value,
        });
      },
      changeQuantity(value: number) {
        send({
          type: 'QUANTITY_CHANGED',
          value,
        });
      },
      changeOutcome(value: DemoOutcome) {
        send({
          type: 'OUTCOME_CHANGED',
          value,
        });
      },
      submit() {
        send({
          type: 'SUBMIT',
        });
      },
      confirm() {
        send({
          type: 'CONFIRM',
        });
      },
      edit() {
        send({
          type: 'EDIT',
        });
      },
      reconcile() {
        send({
          type: 'RECONCILE',
        });
      },
      retry() {
        send({
          type: 'RETRY',
        });
      },
      reset() {
        send({
          type: 'RESET',
        });
      },
    }),
    [send],
  );

  return {
    state,
    api,
  };
}
