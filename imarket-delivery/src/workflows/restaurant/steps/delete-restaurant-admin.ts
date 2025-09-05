import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { RESTAURANT_MODULE } from "../../../modules/restaurant"
import { DeleteRestaurantAdminWorkflow } from "../workflows/delete-restaurant-admin"
import RestaurantModuleService from "../../../modules/restaurant/service"
import { RestaurantAdmin } from "../../../modules/restaurant/models/restaurant-admin"

// Tipo do valor resolvido pela Promise de retrieveRestaurantAdmin
type RestaurantAdminData = Awaited<ReturnType<typeof RestaurantModuleService.prototype.retrieveRestaurantAdmin>>;

export const deleteRestaurantAdminStep = createStep(
  "delete-restaurant-admin",
  async ({ id }: DeleteRestaurantAdminWorkflow, { container }) => {
    const restaurantModuleService: RestaurantModuleService = container.resolve(
      RESTAURANT_MODULE
    )

    const admin = await restaurantModuleService.retrieveRestaurantAdmin(id)
    //throw new Error("Erro simulado para testar compensação"); // Simula falha
    await restaurantModuleService.deleteRestaurantAdmins(id)
    
    return new StepResponse(undefined, { admin } as { admin: RestaurantAdminData }) // Usa o tipo do valor resolvido
  },
  async ({ admin: adminData }: { admin: RestaurantAdminData }, { container }) => { // Usa o tipo do valor resolvido
    const restaurantModuleService: RestaurantModuleService = container.resolve(
      RESTAURANT_MODULE
    )

    const { restaurant: _, ...restAdminData } = adminData

    await restaurantModuleService.createRestaurantAdmins(restAdminData) // Passa os dados diretamente
  }
)