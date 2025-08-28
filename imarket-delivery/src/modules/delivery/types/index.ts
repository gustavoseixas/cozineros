import DeliveryModuleService from "../service";

export enum DeliveryStatus {
  PENDING = "pending",
  RESTAURANT_DECLINED = "restaurant_declined",
  RESTAURANT_ACCEPTED = "restaurant_accepted",
  PICKUP_CLAIMED = "pickup_claimed",
  RESTAURANT_PREPARING = "restaurant_preparing",
  READY_FOR_PICKUP = "ready_for_pickup",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
}

declare module "@medusajs/framework/types" {
  export interface ModuleImplementations {
    deliveryModuleService: DeliveryModuleService;
  }
}