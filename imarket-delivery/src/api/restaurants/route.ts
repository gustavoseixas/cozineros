import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { CreateRestaurant } from "../../modules/restaurant/types"
import { 
  createRestaurantWorkflow,
  } from "../../workflows/restaurant/workflows/create-restaurant"
import { restaurantSchema } from "./validation-schemas"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validatedBody = restaurantSchema.parse(req.body) as CreateRestaurant

  if (!validatedBody) {
    return MedusaError.Types.INVALID_DATA
  }

  const { result: restaurant } = await createRestaurantWorkflow(req.scope)
	  .run({
	    input: {
	      restaurant: validatedBody,
	    },
	  })

  return res.status(200).json({ restaurant })
}