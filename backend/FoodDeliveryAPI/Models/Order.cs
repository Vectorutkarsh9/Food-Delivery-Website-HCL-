using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDeliveryAPI.Models
{
    public enum OrderStatus
    {
        Pending,
        Confirmed,
        Preparing,
        OutForDelivery,
        Delivered,
        Cancelled
    }

    public enum PaymentMethod
    {
        CashOnDelivery,
        UPI,
        Card,
        NetBanking
    }

    public enum PaymentStatus
    {
        Pending,
        Paid,
        Failed,
        Refunded
    }

    [Table("orders")]
    public class Order : BaseEntity
    {
        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("order_number")]
        public string OrderNumber { get; set; } = string.Empty;

        [Column("status")]
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [Column("payment_method")]
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CashOnDelivery;

        [Column("payment_status")]
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        [Column("subtotal")]
        public decimal Subtotal { get; set; } = 0;

        [Column("delivery_charge")]
        public decimal DeliveryCharge { get; set; } = 0;

        [Column("discount_amount")]
        public decimal DiscountAmount { get; set; } = 0;

        [Column("total_amount")]
        public decimal TotalAmount { get; set; } = 0;

        [Required]
        [Column("delivery_address")]
        public string DeliveryAddress { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("delivery_city")]
        public string DeliveryCity { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        [Column("delivery_pincode")]
        public string DeliveryPincode { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("delivery_phone")]
        public string DeliveryPhone { get; set; } = string.Empty;

        [Column("special_instructions")]
        public string? SpecialInstructions { get; set; }

        [Column("estimated_delivery")]
        public DateTime? EstimatedDelivery { get; set; }

        [Column("delivered_at")]
        public DateTime? DeliveredAt { get; set; }

        [Column("cancelled_at")]
        public DateTime? CancelledAt { get; set; }

        [MaxLength(255)]
        [Column("cancellation_reason")]
        public string? CancellationReason { get; set; }

        // Navigation
        public Customer Customer { get; set; } = null!;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<OrderStatusHistory> StatusHistories { get; set; } = new List<OrderStatusHistory>();
    }
}
