using FoodDeliveryAPI.Data;
using FoodDeliveryAPI.DTOs;
using FoodDeliveryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _db;
        public OrdersController(AppDbContext db) => _db = db;

        private static OrderDto MapOrder(Order o) => new()
        {
            Id                   = o.Id,
            OrderNumber          = o.OrderNumber,
            CustomerId           = o.CustomerId,
            CustomerName         = o.Customer?.Name ?? string.Empty,
            Status               = o.Status.ToString(),
            PaymentMethod        = o.PaymentMethod.ToString(),
            PaymentStatus        = o.PaymentStatus.ToString(),
            Subtotal             = o.Subtotal,
            DeliveryCharge       = o.DeliveryCharge,
            DiscountAmount       = o.DiscountAmount,
            TotalAmount          = o.TotalAmount,
            DeliveryAddress      = o.DeliveryAddress,
            DeliveryCity         = o.DeliveryCity,
            DeliveryPincode      = o.DeliveryPincode,
            DeliveryPhone        = o.DeliveryPhone,
            SpecialInstructions  = o.SpecialInstructions,
            EstimatedDelivery    = o.EstimatedDelivery,
            DeliveredAt          = o.DeliveredAt,
            CancelledAt          = o.CancelledAt,
            CancellationReason   = o.CancellationReason,
            CreatedAt            = o.CreatedAt,
            Items = o.OrderItems.Select(i => new OrderItemDto
            {
                Id            = i.Id,
                FoodItemId    = i.FoodItemId,
                FoodItemName  = i.FoodItem?.Name ?? string.Empty,
                Quantity      = i.Quantity,
                UnitPrice     = i.UnitPrice,
                DiscountPrice = i.DiscountPrice,
                TotalPrice    = i.TotalPrice,
                SpecialRequest = i.SpecialRequest
            }).ToList(),
            StatusHistory = o.StatusHistories
                .OrderBy(h => h.CreatedAt)
                .Select(h => new OrderStatusHistoryDto
                {
                    Id        = h.Id,
                    Status    = h.Status.ToString(),
                    ChangedBy = h.ChangedBy.ToString(),
                    Remarks   = h.Remarks,
                    CreatedAt = h.CreatedAt
                }).ToList()
        };

        private static string GenerateOrderNumber() =>
            "ORD" + DateTime.UtcNow.ToString("yyyyMMddHHmmss") +
            new Random().Next(100, 999).ToString();

        // GET api/orders
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<OrderDto>>>> GetAll(
            [FromQuery] string? status,
            [FromQuery] int? customerId)
        {
            var query = _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems).ThenInclude(i => i.FoodItem)
                .Include(o => o.StatusHistories)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status) &&
                Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
                query = query.Where(o => o.Status == parsedStatus);

            if (customerId.HasValue)
                query = query.Where(o => o.CustomerId == customerId);

            var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
            return Ok(ApiResponse<List<OrderDto>>.Ok(orders.Select(MapOrder).ToList()));
        }

        // GET api/orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> GetById(int id)
        {
            var order = await _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems).ThenInclude(i => i.FoodItem)
                .Include(o => o.StatusHistories)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound(ApiResponse<OrderDto>.Fail("Order not found"));
            return Ok(ApiResponse<OrderDto>.Ok(MapOrder(order)));
        }

        // GET api/orders/number/ORD20240101120000123
        [HttpGet("number/{orderNumber}")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> GetByOrderNumber(string orderNumber)
        {
            var order = await _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems).ThenInclude(i => i.FoodItem)
                .Include(o => o.StatusHistories)
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

            if (order == null) return NotFound(ApiResponse<OrderDto>.Fail("Order not found"));
            return Ok(ApiResponse<OrderDto>.Ok(MapOrder(order)));
        }

        // POST api/orders
        [HttpPost]
        public async Task<ActionResult<ApiResponse<OrderDto>>> Create(CreateOrderDto dto)
        {
            // Validate customer
            var customer = await _db.Customers.FindAsync(dto.CustomerId);
            if (customer == null)
                return BadRequest(ApiResponse<OrderDto>.Fail("Customer not found"));

            // Validate all food items exist and are available
            var foodItemIds = dto.Items.Select(i => i.FoodItemId).ToList();
            var foodItems   = await _db.FoodItems
                .Where(f => foodItemIds.Contains(f.Id) && f.IsAvailable)
                .ToListAsync();

            if (foodItems.Count != foodItemIds.Distinct().Count())
                return BadRequest(ApiResponse<OrderDto>.Fail("One or more food items are unavailable or not found"));

            // Calculate amounts
            decimal subtotal = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in dto.Items)
            {
                var food      = foodItems.First(f => f.Id == item.FoodItemId);
                var unitPrice = food.DiscountPrice ?? food.Price;
                var total     = unitPrice * item.Quantity;
                subtotal     += total;

                orderItems.Add(new OrderItem
                {
                    FoodItemId     = food.Id,
                    Quantity       = item.Quantity,
                    UnitPrice      = food.Price,
                    DiscountPrice  = food.DiscountPrice,
                    TotalPrice     = total,
                    SpecialRequest = item.SpecialRequest,
                    CreatedAt      = DateTime.UtcNow,
                    UpdatedAt      = DateTime.UtcNow
                });
            }

            decimal deliveryCharge = subtotal >= 500 ? 0 : 40;
            decimal totalAmount    = subtotal + deliveryCharge;

            var order = new Order
            {
                CustomerId          = dto.CustomerId,
                OrderNumber         = GenerateOrderNumber(),
                Status              = OrderStatus.Pending,
                PaymentMethod       = dto.PaymentMethod,
                PaymentStatus       = PaymentStatus.Pending,
                Subtotal            = subtotal,
                DeliveryCharge      = deliveryCharge,
                DiscountAmount      = 0,
                TotalAmount         = totalAmount,
                DeliveryAddress     = dto.DeliveryAddress,
                DeliveryCity        = dto.DeliveryCity,
                DeliveryPincode     = dto.DeliveryPincode,
                DeliveryPhone       = dto.DeliveryPhone,
                SpecialInstructions = dto.SpecialInstructions,
                EstimatedDelivery   = DateTime.UtcNow.AddMinutes(45),
                OrderItems          = orderItems,
                CreatedAt           = DateTime.UtcNow,
                UpdatedAt           = DateTime.UtcNow
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            // Log initial status history
            _db.OrderStatusHistories.Add(new OrderStatusHistory
            {
                OrderId   = order.Id,
                Status    = OrderStatus.Pending,
                ChangedBy = ChangedBy.System,
                Remarks   = "Order placed successfully",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();

            // Reload with relations
            var created = await _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems).ThenInclude(i => i.FoodItem)
                .Include(o => o.StatusHistories)
                .FirstAsync(o => o.Id == order.Id);

            return CreatedAtAction(nameof(GetById), new { id = order.Id },
                ApiResponse<OrderDto>.Ok(MapOrder(created), "Order placed successfully"));
        }

        // PATCH api/orders/5/status
        [HttpPatch("{id}/status")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> UpdateStatus(int id, UpdateOrderStatusDto dto)
        {
            var order = await _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems).ThenInclude(i => i.FoodItem)
                .Include(o => o.StatusHistories)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound(ApiResponse<OrderDto>.Fail("Order not found"));

            // Prevent invalid transitions
            if (order.Status == OrderStatus.Delivered || order.Status == OrderStatus.Cancelled)
                return BadRequest(ApiResponse<OrderDto>.Fail($"Cannot update a {order.Status} order"));

            order.Status    = dto.Status;
            order.UpdatedAt = DateTime.UtcNow;

            if (dto.Status == OrderStatus.Delivered)
                order.DeliveredAt = DateTime.UtcNow;

            if (dto.Status == OrderStatus.Cancelled)
            {
                order.CancelledAt        = DateTime.UtcNow;
                order.CancellationReason = dto.CancellationReason;
            }

            // Log status history
            Enum.TryParse<ChangedBy>(dto.ChangedBy, true, out var changedBy);
            _db.OrderStatusHistories.Add(new OrderStatusHistory
            {
                OrderId   = order.Id,
                Status    = dto.Status,
                ChangedBy = changedBy,
                Remarks   = dto.Remarks,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            return Ok(ApiResponse<OrderDto>.Ok(MapOrder(order), "Order status updated successfully"));
        }

        // GET api/orders/5/tracking
        [HttpGet("{id}/tracking")]
        public async Task<ActionResult<ApiResponse<List<OrderStatusHistoryDto>>>> GetTracking(int id)
        {
            if (!await _db.Orders.AnyAsync(o => o.Id == id))
                return NotFound(ApiResponse<List<OrderStatusHistoryDto>>.Fail("Order not found"));

            var history = await _db.OrderStatusHistories
                .Where(h => h.OrderId == id)
                .OrderBy(h => h.CreatedAt)
                .Select(h => new OrderStatusHistoryDto
                {
                    Id        = h.Id,
                    Status    = h.Status.ToString(),
                    ChangedBy = h.ChangedBy.ToString(),
                    Remarks   = h.Remarks,
                    CreatedAt = h.CreatedAt
                }).ToListAsync();

            return Ok(ApiResponse<List<OrderStatusHistoryDto>>.Ok(history));
        }
    }
}
