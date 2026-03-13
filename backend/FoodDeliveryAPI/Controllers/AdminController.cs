using FoodDeliveryAPI.Data;
using FoodDeliveryAPI.DTOs;
using FoodDeliveryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;
        public AdminController(AppDbContext db) => _db = db;

        // POST api/admin/login
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<AdminDto>>> Login(LoginDto dto)
        {
            var admin = await _db.Admins.FirstOrDefaultAsync(a => a.Email == dto.Email);
            if (admin == null)
                return Unauthorized(ApiResponse<AdminDto>.Fail("Invalid email or password"));

            // NOTE: In production use BCrypt. Seed uses plain for demo.
            bool valid = BCrypt.Net.BCrypt.Verify(dto.Password, admin.PasswordHash);
            if (!valid)
                return Unauthorized(ApiResponse<AdminDto>.Fail("Invalid email or password"));

            if (!admin.IsActive)
                return Unauthorized(ApiResponse<AdminDto>.Fail("Admin account is deactivated"));

            return Ok(ApiResponse<AdminDto>.Ok(new AdminDto
            {
                Id        = admin.Id,
                Name      = admin.Name,
                Email     = admin.Email,
                Phone     = admin.Phone,
                IsActive  = admin.IsActive,
                CreatedAt = admin.CreatedAt
            }, "Login successful"));
        }

        // POST api/admin/create
        [HttpPost("create")]
        public async Task<ActionResult<ApiResponse<AdminDto>>> Create(CreateAdminDto dto)
        {
            if (await _db.Admins.AnyAsync(a => a.Email == dto.Email))
                return BadRequest(ApiResponse<AdminDto>.Fail("Email already exists"));

            var admin = new Admin
            {
                Name         = dto.Name,
                Email        = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone        = dto.Phone,
                IsActive     = true,
                CreatedAt    = DateTime.UtcNow,
                UpdatedAt    = DateTime.UtcNow
            };

            _db.Admins.Add(admin);
            await _db.SaveChangesAsync();

            return Ok(ApiResponse<AdminDto>.Ok(new AdminDto
            {
                Id        = admin.Id,
                Name      = admin.Name,
                Email     = admin.Email,
                Phone     = admin.Phone,
                IsActive  = admin.IsActive,
                CreatedAt = admin.CreatedAt
            }, "Admin created successfully"));
        }

        // GET api/admin/dashboard
        [HttpGet("dashboard")]
        public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetDashboard()
        {
            var totalOrders     = await _db.Orders.CountAsync();
            var pendingOrders   = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Pending);
            var deliveredOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Delivered);
            var cancelledOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Cancelled);
            var totalRevenue    = await _db.Orders
                .Where(o => o.Status == OrderStatus.Delivered)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
            var totalCustomers  = await _db.Customers.CountAsync(c => c.IsActive);
            var totalFoodItems  = await _db.FoodItems.CountAsync(f => f.IsAvailable);

            var recentOrders = await _db.Orders
                .Include(o => o.Customer)
                .OrderByDescending(o => o.CreatedAt)
                .Take(10)
                .Select(o => new RecentOrderDto
                {
                    Id           = o.Id,
                    OrderNumber  = o.OrderNumber,
                    CustomerName = o.Customer.Name,
                    TotalAmount  = o.TotalAmount,
                    Status       = o.Status.ToString(),
                    CreatedAt    = o.CreatedAt
                }).ToListAsync();

            return Ok(ApiResponse<DashboardStatsDto>.Ok(new DashboardStatsDto
            {
                TotalOrders     = totalOrders,
                PendingOrders   = pendingOrders,
                DeliveredOrders = deliveredOrders,
                CancelledOrders = cancelledOrders,
                TotalRevenue    = totalRevenue,
                TotalCustomers  = totalCustomers,
                TotalFoodItems  = totalFoodItems,
                RecentOrders    = recentOrders
            }));
        }

        // GET api/admin/orders
        [HttpGet("orders")]
        public async Task<ActionResult<ApiResponse<List<RecentOrderDto>>>> GetAllOrders(
            [FromQuery] string? status)
        {
            var query = _db.Orders.Include(o => o.Customer).AsQueryable();

            if (!string.IsNullOrEmpty(status) &&
                Enum.TryParse<OrderStatus>(status, true, out var parsed))
                query = query.Where(o => o.Status == parsed);

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new RecentOrderDto
                {
                    Id           = o.Id,
                    OrderNumber  = o.OrderNumber,
                    CustomerName = o.Customer.Name,
                    TotalAmount  = o.TotalAmount,
                    Status       = o.Status.ToString(),
                    CreatedAt    = o.CreatedAt
                }).ToListAsync();

            return Ok(ApiResponse<List<RecentOrderDto>>.Ok(orders));
        }
    }
}
