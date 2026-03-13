using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDeliveryAPI.Models
{
    [Table("order_items")]
    public class OrderItem : BaseEntity
    {
        [Column("order_id")]
        public int OrderId { get; set; }

        [Column("food_item_id")]
        public int FoodItemId { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; } = 1;

        [Column("unit_price")]
        public decimal UnitPrice { get; set; }

        [Column("discount_price")]
        public decimal? DiscountPrice { get; set; }

        [Column("total_price")]
        public decimal TotalPrice { get; set; }

        [MaxLength(255)]
        [Column("special_request")]
        public string? SpecialRequest { get; set; }

        // Navigation
        public Order Order { get; set; } = null!;
        public FoodItem FoodItem { get; set; } = null!;
    }
}
