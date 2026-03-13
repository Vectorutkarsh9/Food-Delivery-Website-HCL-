using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDeliveryAPI.Models
{
    [Table("admins")]
    public class Admin : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("phone")]
        public string? Phone { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;
    }
}
