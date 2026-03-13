using FoodDeliveryAPI.Data;
using FoodDeliveryAPI.DTOs;
using FoodDeliveryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CustomersController(AppDbContext db) => _db = db;

        // GET api/customers
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<CustomerDto>>>> GetAll()
        {
            var list = await _db.Customers
                .Where(c => c.IsActive)
                .Select(c => new CustomerDto
                {
                    Id        = c.Id,
                    Name      = c.Name,
                    Email     = c.Email,
                    Phone     = c.Phone,
                    Address   = c.Address,
                    City      = c.City,
                    Pincode   = c.Pincode,
                    IsActive  = c.IsActive,
                    CreatedAt = c.CreatedAt
                }).ToListAsync();

            return Ok(ApiResponse<List<CustomerDto>>.Ok(list));
        }

        // GET api/customers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CustomerDto>>> GetById(int id)
        {
            var c = await _db.Customers.FindAsync(id);
            if (c == null) return NotFound(ApiResponse<CustomerDto>.Fail("Customer not found"));

            return Ok(ApiResponse<CustomerDto>.Ok(new CustomerDto
            {
                Id        = c.Id,
                Name      = c.Name,
                Email     = c.Email,
                Phone     = c.Phone,
                Address   = c.Address,
                City      = c.City,
                Pincode   = c.Pincode,
                IsActive  = c.IsActive,
                CreatedAt = c.CreatedAt
            }));
        }

        // POST api/customers/register
        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<CustomerDto>>> Register(RegisterCustomerDto dto)
        {
            if (await _db.Customers.AnyAsync(c => c.Email == dto.Email))
                return BadRequest(ApiResponse<CustomerDto>.Fail("Email already registered"));

            var entity = new Customer
            {
                Name         = dto.Name,
                Email        = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone        = dto.Phone,
                Address      = dto.Address,
                City         = dto.City,
                Pincode      = dto.Pincode,
                IsActive     = true,
                CreatedAt    = DateTime.UtcNow,
                UpdatedAt    = DateTime.UtcNow
            };

            _db.Customers.Add(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id },
                ApiResponse<CustomerDto>.Ok(new CustomerDto
                {
                    Id        = entity.Id,
                    Name      = entity.Name,
                    Email     = entity.Email,
                    Phone     = entity.Phone,
                    Address   = entity.Address,
                    City      = entity.City,
                    Pincode   = entity.Pincode,
                    IsActive  = entity.IsActive,
                    CreatedAt = entity.CreatedAt
                }, "Customer registered successfully"));
        }

        // POST api/customers/login
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<CustomerDto>>> Login(LoginDto dto)
        {
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Email == dto.Email);
            if (customer == null || !BCrypt.Net.BCrypt.Verify(dto.Password, customer.PasswordHash))
                return Unauthorized(ApiResponse<CustomerDto>.Fail("Invalid email or password"));

            if (!customer.IsActive)
                return Unauthorized(ApiResponse<CustomerDto>.Fail("Account is deactivated"));

            return Ok(ApiResponse<CustomerDto>.Ok(new CustomerDto
            {
                Id        = customer.Id,
                Name      = customer.Name,
                Email     = customer.Email,
                Phone     = customer.Phone,
                Address   = customer.Address,
                City      = customer.City,
                Pincode   = customer.Pincode,
                IsActive  = customer.IsActive,
                CreatedAt = customer.CreatedAt
            }, "Login successful"));
        }

        // PUT api/customers/5
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<CustomerDto>>> Update(int id, UpdateCustomerDto dto)
        {
            var entity = await _db.Customers.FindAsync(id);
            if (entity == null) return NotFound(ApiResponse<CustomerDto>.Fail("Customer not found"));

            entity.Name      = dto.Name;
            entity.Phone     = dto.Phone;
            entity.Address   = dto.Address;
            entity.City      = dto.City;
            entity.Pincode   = dto.Pincode;
            entity.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(ApiResponse<CustomerDto>.Ok(new CustomerDto
            {
                Id        = entity.Id,
                Name      = entity.Name,
                Email     = entity.Email,
                Phone     = entity.Phone,
                Address   = entity.Address,
                City      = entity.City,
                Pincode   = entity.Pincode,
                IsActive  = entity.IsActive,
                CreatedAt = entity.CreatedAt
            }, "Profile updated successfully"));
        }

        // GET api/customers/5/orders
        [HttpGet("{id}/orders")]
        public async Task<ActionResult<ApiResponse<List<RecentOrderDto>>>> GetOrderHistory(int id)
        {
            if (!await _db.Customers.AnyAsync(c => c.Id == id))
                return NotFound(ApiResponse<List<RecentOrderDto>>.Fail("Customer not found"));

            var orders = await _db.Orders
                .Where(o => o.CustomerId == id)
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
