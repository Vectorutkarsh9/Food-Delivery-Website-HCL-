using FoodDeliveryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Admin>               Admins               { get; set; }
        public DbSet<Customer>            Customers            { get; set; }
        public DbSet<Category>            Categories           { get; set; }
        public DbSet<FoodItem>            FoodItems            { get; set; }
        public DbSet<Order>               Orders               { get; set; }
        public DbSet<OrderItem>           OrderItems           { get; set; }
        public DbSet<OrderStatusHistory>  OrderStatusHistories { get; set; }
        public DbSet<Review>              Reviews              { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Admin ─────────────────────────────────────────────
            modelBuilder.Entity<Admin>(e =>
            {
                e.Property(x => x.CreatedAt).HasColumnName("created_at");
                e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            });

            // ── Customer ──────────────────────────────────────────
            modelBuilder.Entity<Customer>(e =>
            {
                e.Property(x => x.CreatedAt).HasColumnName("created_at");
                e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            });

            // ── Category ──────────────────────────────────────────
            modelBuilder.Entity<Category>(e =>
            {
                e.Property(x => x.CreatedAt).HasColumnName("created_at");
                e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            });

            // ── FoodItem ──────────────────────────────────────────
            modelBuilder.Entity<FoodItem>(e =>
            {
                e.Property(x => x.Price).HasPrecision(10, 2);
                e.Property(x => x.DiscountPrice).HasPrecision(10, 2);
                e.Property(x => x.Rating).HasPrecision(3, 2);
                e.Property(x => x.CreatedAt).HasColumnName("created_at");
                e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

                e.HasOne(f => f.Category)
                 .WithMany(c => c.FoodItems)
                 .HasForeignKey(f => f.CategoryId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── Order ─────────────────────────────────────────────
            modelBuilder.Entity<Order>(e =>
            {
                e.Property(x => x.Status)
                 .HasConversion<string>();

                e.Property(x => x.PaymentMethod)
                 .HasConversion<string>();

                e.Property(x => x.PaymentStatus)
                 .HasConversion<string>();

                e.Property(x => x.Subtotal).HasPrecision(10, 2);
                e.Property(x => x.DeliveryCharge).HasPrecision(10, 2);
                e.Property(x => x.DiscountAmount).HasPrecision(10, 2);
                e.Property(x => x.TotalAmount).HasPrecision(10, 2);

                e.Property(x => x.CreatedAt).HasColumnName("created_at");
                e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

                e.HasOne(o => o.Customer)
                 .WithMany(c => c.Orders)
                 .HasForeignKey(o => o.CustomerId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── OrderItem ─────────────────────────────────────────
            modelBuilder.Entity<OrderItem>(e =>
            {
                e.Property(x => x.UnitPrice).HasPrecision(10, 2);
                e.Property(x => x.DiscountPrice).HasPrecision(10, 2);
                e.Property(x => x.TotalPrice).HasPrecision(10, 2);

                e.Property(x => x.CreatedAt).HasColumnName("created_at");
                e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

                e.HasOne(oi => oi.Order)
                 .WithMany(o => o.OrderItems)
                 .HasForeignKey(oi => oi.OrderId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(oi => oi.FoodItem)
                 .WithMany(f => f.OrderItems)
                 .HasForeignKey(oi => oi.FoodItemId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── OrderStatusHistory ────────────────────────────────
            modelBuilder.Entity<OrderStatusHistory>(e =>
            {
                e.Property(x => x.Status)
                 .HasConversion<string>();

                e.Property(x => x.ChangedBy)
                 .HasConversion<string>();

                e.Property(x => x.CreatedAt).HasColumnName("created_at");
                e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

                e.HasOne(h => h.Order)
                 .WithMany(o => o.StatusHistories)
                 .HasForeignKey(h => h.OrderId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ── Review ────────────────────────────────────────────
            modelBuilder.Entity<Review>(e =>
            {
                e.Property(x => x.CreatedAt).HasColumnName("created_at");
                e.Property(x => x.UpdatedAt).HasColumnName("updated_at");

                e.HasIndex(r => new { r.CustomerId, r.FoodItemId, r.OrderId })
                 .IsUnique();

                e.HasOne(r => r.Customer)
                 .WithMany(c => c.Reviews)
                 .HasForeignKey(r => r.CustomerId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(r => r.FoodItem)
                 .WithMany(f => f.Reviews)
                 .HasForeignKey(r => r.FoodItemId)
                 .OnDelete(DeleteBehavior.Cascade);

                e.HasOne(r => r.Order)
                 .WithMany()
                 .HasForeignKey(r => r.OrderId)
                 .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
