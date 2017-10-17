export interface OrderInterface {
    id: number
    avg_price: number
    created_at: string
    executed_volume: number
    market: string
    ord_type: string
    price: number
    remaining_volume: number
    side: string
    state: string
    trades_count: number
    volume: number
}