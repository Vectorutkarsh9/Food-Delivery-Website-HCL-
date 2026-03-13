using FoodDeliveryAPI.Data;
using FoodDeliveryAPI.DTOs;
using FoodDeliveryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ReviewsController(AppDbContext db) => _db = db;

        // GET api/reviews/fooditem/5
        [HttpGet("fooditem/{foodItemId}")]
        public async Task<ActionResult<ApiResponse<List<ReviewDto>>>> GetByFoodItem(int foodItemId)
        {
            var list = await _db.Reviews
                .Include(r => r.Customer)
                .Include(r => r.FoodItem)
                .Where(r => r.FoodItemId == foodItemId && r.IsApproved)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    Id           = r.Id,
                    CustomerId   = r.CustomerId,
                    CustomerName = r.Customer.Name,
                    FoodItemId   = r.FoodItemId,
                    FoodItemName = r.FoodItem.Name,
                    OrderId      = r.OrderId,
                    Rating       = r.Rating,
                    Comment      = r.Comment,
                    IsApproved   = r.IsApproved,
                    CreatedAt    = r.CreatedAt
                }).ToListAsync();

            return Ok(ApiResponse<List<ReviewDto>>.Ok(list));
        }

        // POST api/reviews
        [HttpPost]
        public async Task<ActionResult<ApiResponse<ReviewDto>>> Create(CreateReviewDto dto)
        {
            // Verify order was delivered
            var order = await _db.Orders.FindAsync(dto.OrderId);
            if (order == null || order.Status != OrderStatus.Delivered)
                return BadRequest(ApiResponse<ReviewDto>.Fail("You can only review delivered orders"));

            // Prevent duplicate review
            if (await _db.Reviews.AnyAsync(r =>
                r.CustomerId == dto.CustomerId &&
                r.FoodItemId == dto.FoodItemId &&
                r.OrderId    == dto.OrderId))
                return BadRequest(ApiResponse<ReviewDto>.Fail("You have already reviewed this item"));

            var review = new Review
            {
                CustomerId  = dto.CustomerId,
                FoodItemId  = dto.FoodItemId,
                OrderId     = dto.OrderId,
                Rating      = dto.Rating,
                Comment     = dto.Comment,
                IsApproved  = true,
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow
            };

            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();

            // Update food item rating average
            var avgRating = await _db.Reviews
                .Where(r => r.FoodItemId == dto.FoodItemId && r.IsApproved)
                .AverageAsync(r => (double)r.Rating);

            var totalReviews = await _db.Reviews
                .CountAsync(r => r.FoodItemId == dto.FoodItemId && r.IsApproved);

            var foodItem       = await _db.FoodItems.FindAsync(dto.FoodItemId);
            if (foodItem != null)
            {
                foodItem.Rating       = (decimal)Math.Round(avgRating, 2);
                foodItem.TotalReviews = totalReviews;
                foodItem.UpdatedAt    = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }

            return Ok(ApiResponse<ReviewDto>.Ok(new ReviewDto
            {
                Id         = review.Id,
                CustomerId = review.CustomerId,
                FoodItemId = review.FoodItemId,
                OrderId    = review.OrderId,
                Rating     = review.Rating,
                Comment    = review.Comment,
                IsApproved = review.IsApproved,
                CreatedAt  = review.CreatedAt
            }, "Review submitted successfully"));
        }
    }
}
