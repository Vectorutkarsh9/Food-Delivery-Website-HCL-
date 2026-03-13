using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDeliveryAPI.Models
{
    [Table("categories")]
    public class Category : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [MaxLength(500)]
        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("display_order")]
        public int DisplayOrder { get; set; } = 0;

        // Navigation
        public ICollection<FoodItem> FoodItems { get; set; } = new List<FoodItem>();
    }
}
