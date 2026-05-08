import { EventEmitter } from 'events';
import { IOrder } from '../models/Order';

const orderEvents = new EventEmitter();

// Avoid EventEmitter memory warning for many simultaneous tracked orders.
orderEvents.setMaxListeners(200);

export const emitOrderUpdated = (order: IOrder) => {
  orderEvents.emit(`order:${order._id.toString()}`, order);
};

export const subscribeToOrderUpdates = (
  orderId: string,
  listener: (order: IOrder) => void
) => {
  const eventName = `order:${orderId}`;
  orderEvents.on(eventName, listener);

  return () => {
    orderEvents.off(eventName, listener);
  };
};
