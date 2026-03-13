using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDeliveryAPI.Models
{
    public enum ChangedBy
    {
        System,
        Admin,
        Customer
    }

    [Table("order_status_history")]
    public class OrderStatusHistory : BaseEntity
    {
        [Column("order_id")]
        public int OrderId { get; set; }

        [Column("status")]
        public OrderStatus Status { get; set; }

        [Column("changed_by")]
        public ChangedBy ChangedBy { get; set; } = ChangedBy.System;

        [MaxLength(255)]
        [Column("remarks")]
        public string? Remarks { get; set; }

        // Navigation
        public Order Order { get; set; } = null!;
    }
}
