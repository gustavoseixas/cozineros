import { 
  createProductsWorkflow,
  createRemoteLinkStep,
} from "@medusajs/medusa/core-flows"
import { CreateProductWorkflowInputDTO, ProductDTO } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createWorkflow,
  transform,
  WorkflowData,
} from "@medusajs/framework/workflows-sdk"
import { RESTAURANT_MODULE } from "../../../modules/restaurant"

type WorkflowInput = {
  products: CreateProductWorkflowInputDTO[];
  restaurant_id: string;
};

export const createRestaurantProductsWorkflow = createWorkflow(
  "create-restaurant-products-workflow",
  function (input: WorkflowData<WorkflowInput>): WorkflowResponse<ProductDTO[]> {
    // Transformar os dados para criar option_values dinamicamente
    const transformedProducts = transform({ input }, (data) => {
      return data.input.products.map((product) => {
        const newOptions = product.options || [];
        
        const variantValues = product.variants
        // @ts-ignore
          ?.flatMap((v) => v.options || [])
          .filter((v, i, self) => self.indexOf(v) === i) || []; // Valores únicos das variantes

        // Adicionar valores às opções existentes
        const updatedOptions = newOptions.map((option) => ({
          ...option,
          values: variantValues, // Associar todos os valores únicos
        }));

        // Mapear opções das variantes para a estrutura esperada
        const newVariants = product.variants?.map((variant) => {
          return {
            ...variant,// @ts-ignore
            options: variant.options?.map((optionValue) => ({
              option_id: newOptions[0]?.title || "", // Assumindo uma opção por produto por simplicidade
              value: optionValue,
            })) || [],
          };
        }) || [];

        return {
          ...product,
          options: updatedOptions,
          variants: newVariants,
        };
      });
    });

    const products = createProductsWorkflow.runAsStep({
      input: {// @ts-ignore
        products: transformedProducts,
      },
    });

    const links = transform({
      products,
      input,
    }, (data) => data.products.map((product) => ({
      [RESTAURANT_MODULE]: {
        restaurant_id: data.input.restaurant_id,
      },
      [Modules.PRODUCT]: {
        product_id: product.id,
      },
    })));

    createRemoteLinkStep(links);

    return new WorkflowResponse(products);
  }
);