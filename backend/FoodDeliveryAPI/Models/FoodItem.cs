using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDeliveryAPI.Models
{
    [Table("food_items")]
    public class FoodItem : BaseEntity
    {
        [Column("category_id")]
        public int CategoryId { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [Column("price")]
        public decimal Price { get; set; }

        [Column("discount_price")]
        public decimal? DiscountPrice { get; set; }

        [MaxLength(500)]
        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Column("is_vegetarian")]
        public bool IsVegetarian { get; set; } = false;

        [Column("is_vegan")]
        public bool IsVegan { get; set; } = false;

        [Column("is_available")]
        public bool IsAvailable { get; set; } = true;

        [Column("rating")]
        public decimal Rating { get; set; } = 0;

        [Column("total_reviews")]
        public int TotalReviews { get; set; } = 0;

        [Column("preparation_time_mins")]
        public int PreparationTimeMins { get; set; } = 15;

        // Navigation
        public Category Category { get; set; } = null!;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}
