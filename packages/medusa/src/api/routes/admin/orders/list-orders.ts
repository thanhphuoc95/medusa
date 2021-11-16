import { defaultAdminOrdersRelations, defaultAdminOrdersFields } from "."
import { validator } from "../../../../utils/validator"
import { IsOptional, IsString } from "class-validator"
import _, { identity } from "lodash"
import { OrderService } from "../../../../services"
import { Selector } from "../../../../types/orders"

/**
 * @oas [get] /orders
 * operationId: "GetOrders"
 * summary: "List Orders"
 * description: "Retrieves a list of Orders"
 * x-authenticated: true
 * parameters:
 *   - (query) q {string} Query used for searching orders.
 *   - (query) id {string} Id of the order to search for.
 *   - (query) status {string[]} Status to search for.
 *   - (query) fulfillment_status {string[]} Fulfillment status to search for.
 *   - (query) payment_status {string[]} Payment status to search for.
 *   - (query) display_id {string} Display id to search for.
 *   - (query) cart_id {string} to search for.
 *   - (query) customer_id {string} to search for.
 *   - (query) email {string} to search for.
 *   - (query) region_id {string} to search for.
 *   - (query) currency_code {string} to search for.
 *   - (query) tax_rate {string} to search for.
 *   - (query) cancelled_at {DateComparisonOperator} Date comparison for when resulting orders was cancelled, i.e. less than, greater than etc.
 *   - (query) created_at {DateComparisonOperator} Date comparison for when resulting orders was created, i.e. less than, greater than etc.
 *   - (query) updated_at {DateComparisonOperator} Date comparison for when resulting orders was updated, i.e. less than, greater than etc.
 *   - (query) offset {string} How many orders to skip in the result.
 *   - (query) limit {string} Limit the number of orders returned.
 *   - (query) expand {string} (Comma separated) Which fields should be expanded in each order of the result.
 *   - (query) fields {string} (Comma separated) Which fields should be included in each order of the result.
 * tags:
 *   - Order
 * responses:
 *   200:
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           properties:
 *             orders:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/order"
 */
export default async (req, res) => {
  const value = await validator(AdminGetOrdersParams, req.query)

  const orderService: OrderService = req.scope.resolve("orderService")

  const limit = parseInt(value.limit) || 50
  const offset = parseInt(value.offset) || 0

  let includeFields: string[] = []
  if (value.fields) {
    includeFields = value.fields.split(",")
    // Ensure created_at is included, since we are sorting on this
    includeFields.push("created_at")
  }

  let expandFields: string[] = []
  if (value.expand) {
    expandFields = value.expand.split(",")
  }

  const listConfig = {
    select: includeFields.length ? includeFields : defaultAdminOrdersFields,
    relations: expandFields.length ? expandFields : defaultAdminOrdersRelations,
    skip: offset,
    take: limit,
    order: { created_at: "DESC" },
  }

  const filterableFields = _.omit(value, [
    "limit",
    "offset",
    "expand",
    "fields",
    "order",
  ])

  const [orders, count] = await orderService.listAndCount(
    _.pickBy(filterableFields, identity),
    listConfig
  )

  let data = orders

  const fields = [...includeFields, ...expandFields]
  if (fields.length) {
    data = orders.map((o) => _.pick(o, fields))
  }

  res.json({ orders: data, count, offset, limit })
}

export class AdminGetOrdersParams extends Selector {
  @IsString()
  @IsOptional()
  offset?: string

  @IsString()
  @IsOptional()
  limit?: string

  @IsString()
  @IsOptional()
  expand?: string

  @IsString()
  @IsOptional()
  fields?: string
}