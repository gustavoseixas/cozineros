import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { 
  AdminCreateProduct,
} from "@medusajs/medusa/api/admin/products/validators"
import { z } from "zod"
import { 
  createRestaurantProductsWorkflow,
} from "../../../../workflows/restaurant/workflows/create-restaurant-products"

const createSchema = z.object({
  products: z.array(
    z.object({
      title: z.string(),
      status: z.enum(["draft", "published", "rejected", "proposed"]).optional(),
      options: z.array(
        z.object({
          title: z.string(),
        })
      ).optional(),
      variants: z.array(
        z.object({
          title: z.string(),
          options: z.array(z.string()).optional(),
          prices: z.array(
            z.object({
              currency_code: z.string(),
              amount: z.number(),
            })
          ),
          manage_inventory: z.boolean().optional(),
        })
      ).optional(),
      sales_channels: z.array(
        z.object({
          id: z.string(),
        })
      ).optional(),
    })
  ),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validatedBody = createSchema.parse(req.body)

  const { result: restaurantProducts } = await createRestaurantProductsWorkflow(
    req.scope
  ).run({
    input: {
      products: validatedBody.products as any[],
      restaurant_id: req.params.id,
    },
  })

  return res.status(200).json({ restaurant_products: restaurantProducts })
}