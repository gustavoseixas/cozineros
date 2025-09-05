import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"
import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { CreateDriverInput, createDriverStep } from "../steps/create-driver"
import { 
  CreateRestaurantAdminInput, 
  createRestaurantAdminStep,
} from "../steps/create-restaurant-admin"

export type CreateUserWorkflowInput = {
  user: (CreateRestaurantAdminInput | CreateDriverInput) & {
    actor_type: "restaurant" | "driver";
  };
  auth_identity_id: string;
};

export const createUserWorkflow = createWorkflow(
  "create-user-workflow",
  function (input: CreateUserWorkflowInput) {

    const restaurantUser = when(input, (input) => input.user.actor_type === "restaurant")
    .then(() => {
        return createRestaurantAdminStep(
        input.user as CreateRestaurantAdminInput
        )
    })

    const driverUser = when(input, (input) => input.user.actor_type === "driver")
    .then(() => {
        return createDriverStep(
        input.user as CreateDriverInput
        )
    })

    const { user, authUserInput } = transform({ input, restaurantUser, driverUser }, (data) => {
    const user = data.restaurantUser || data.driverUser
    let metadataValue;

      
      if (data.input.user.actor_type === "restaurant") {
        metadataValue = (data.input.user as CreateRestaurantAdminInput).restaurant_id ;
      } else if (data.input.user.actor_type === "driver") {
        metadataValue = { driver_id: user?.id ?? "" }; // Ajuste conforme necessário para drivers
      } else {
        metadataValue = {}; // Caso padrão, se houver outros tipos
      }


    return {
        user,
        authUserInput: {
        authIdentityId: data.input.auth_identity_id,
        actorType: data.input.user.actor_type,
        value: metadataValue,
        },
    }
    });

    setAuthAppMetadataStep(authUserInput)

    return new WorkflowResponse(user?.id ?? "")

  }
)