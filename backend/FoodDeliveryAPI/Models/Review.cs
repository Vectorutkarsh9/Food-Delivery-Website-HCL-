using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDeliveryAPI.Models
{
    [Table("reviews")]
    public class Review : BaseEntity
    {
        [Column("customer_id")]
        public int CustomerId { get; set; }

        [Column("food_item_id")]
        public int FoodItemId { get; set; }

        [Column("order_id")]
        public int OrderId { get; set; }

        [Range(1, 5)]
        [Column("rating")]
        public int Rating { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }

        [Column("is_approved")]
        public bool IsApproved { get; set; } = true;

        // Navigation
        public Customer Customer { get; set; } = null!;
        public FoodItem FoodItem { get; set; } = null!;
        public Order Order { get; set; } = null!;
    }
}
