using FoodDeliveryAPI.Models;
using System.ComponentModel.DataAnnotations;

namespace FoodDeliveryAPI.DTOs
{
    // ── CATEGORY DTOs ────────────────────────────────────────────
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCategoryDto
    {
        [Required] [MaxLength(100)] public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdateCategoryDto
    {
        [Required] [MaxLength(100)] public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
    }

    // ── FOOD ITEM DTOs ───────────────────────────────────────────
    public class FoodItemDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsVegetarian { get; set; }
        public bool IsVegan { get; set; }
        public bool IsAvailable { get; set; }
        public decimal Rating { get; set; }
        public int TotalReviews { get; set; }
        public int PreparationTimeMins { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateFoodItemDto
    {
        [Required] public int CategoryId { get; set; }
        [Required] [MaxLength(150)] public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required] [Range(0.01, double.MaxValue)] public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsVegetarian { get; set; } = false;
        public bool IsVegan { get; set; } = false;
        public int PreparationTimeMins { get; set; } = 15;
    }

    public class UpdateFoodItemDto
    {
        [Required] public int CategoryId { get; set; }
        [Required] [MaxLength(150)] public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required] [Range(0.01, double.MaxValue)] public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsVegetarian { get; set; }
        public bool IsVegan { get; set; }
        public bool IsAvailable { get; set; }
        public int PreparationTimeMins { get; set; }
    }

    // ── CUSTOMER DTOs ────────────────────────────────────────────
    public class CustomerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Pincode { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class RegisterCustomerDto
    {
        [Required] [MaxLength(100)] public string Name { get; set; } = string.Empty;
        [Required] [EmailAddress] public string Email { get; set; } = string.Empty;
        [Required] [MinLength(6)] public string Password { get; set; } = string.Empty;
        [MaxLength(20)] public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Pincode { get; set; }
    }

    public class UpdateCustomerDto
    {
        [Required] [MaxLength(100)] public string Name { get; set; } = string.Empty;
        [MaxLength(20)] public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Pincode { get; set; }
    }

    public class LoginDto
    {
        [Required] [EmailAddress] public string Email { get; set; } = string.Empty;
        [Required] public string Password { get; set; } = string.Empty;
    }

    // ── ORDER DTOs ───────────────────────────────────────────────
    public class OrderItemRequestDto
    {
        [Required] public int FoodItemId { get; set; }
        [Required] [Range(1, 50)] public int Quantity { get; set; }
        public string? SpecialRequest { get; set; }
    }

    public class CreateOrderDto
    {
        [Required] public int CustomerId { get; set; }
        [Required] public string DeliveryAddress { get; set; } = string.Empty;
        [Required] public string DeliveryCity { get; set; } = string.Empty;
        [Required] public string DeliveryPincode { get; set; } = string.Empty;
        [Required] public string DeliveryPhone { get; set; } = string.Empty;
        public string? SpecialInstructions { get; set; }
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CashOnDelivery;
        [Required] public List<OrderItemRequestDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int FoodItemId { get; set; }
        public string FoodItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal? DiscountPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string? SpecialRequest { get; set; }
    }

    public class OrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal DeliveryCharge { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string DeliveryAddress { get; set; } = string.Empty;
        public string DeliveryCity { get; set; } = string.Empty;
        public string DeliveryPincode { get; set; } = string.Empty;
        public string DeliveryPhone { get; set; } = string.Empty;
        public string? SpecialInstructions { get; set; }
        public DateTime? EstimatedDelivery { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
        public List<OrderStatusHistoryDto> StatusHistory { get; set; } = new();
    }

    public class UpdateOrderStatusDto
    {
        [Required] public OrderStatus Status { get; set; }
        public string ChangedBy { get; set; } = "Admin";
        public string? Remarks { get; set; }
        public string? CancellationReason { get; set; }
    }

    // ── ORDER STATUS HISTORY DTOs ────────────────────────────────
    public class OrderStatusHistoryDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ChangedBy { get; set; } = string.Empty;
        public string? Remarks { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ── REVIEW DTOs ──────────────────────────────────────────────
    public class ReviewDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int FoodItemId { get; set; }
        public string FoodItemName { get; set; } = string.Empty;
        public int OrderId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public bool IsApproved { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateReviewDto
    {
        [Required] public int CustomerId { get; set; }
        [Required] public int FoodItemId { get; set; }
        [Required] public int OrderId { get; set; }
        [Required] [Range(1, 5)] public int Rating { get; set; }
        public string? Comment { get; set; }
    }

    // ── ADMIN DTOs ───────────────────────────────────────────────
    public class AdminDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateAdminDto
    {
        [Required] [MaxLength(100)] public string Name { get; set; } = string.Empty;
        [Required] [EmailAddress] public string Email { get; set; } = string.Empty;
        [Required] [MinLength(6)] public string Password { get; set; } = string.Empty;
        [MaxLength(20)] public string? Phone { get; set; }
    }

    // ── DASHBOARD DTOs ───────────────────────────────────────────
    public class DashboardStatsDto
    {
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int DeliveredOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalFoodItems { get; set; }
        public List<RecentOrderDto> RecentOrders { get; set; } = new();
    }

    public class RecentOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    // ── API RESPONSE WRAPPER ─────────────────────────────────────
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }

        public static ApiResponse<T> Ok(T data, string message = "Success") =>
            new() { Success = true, Message = message, Data = data };

        public static ApiResponse<T> Fail(string message) =>
            new() { Success = false, Message = message };
    }
}
