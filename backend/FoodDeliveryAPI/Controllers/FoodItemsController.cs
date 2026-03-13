using FoodDeliveryAPI.Data;
using FoodDeliveryAPI.DTOs;
using FoodDeliveryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FoodItemsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public FoodItemsController(AppDbContext db) => _db = db;

        private static FoodItemDto ToDto(FoodItem f) => new()
        {
            Id                   = f.Id,
            CategoryId           = f.CategoryId,
            CategoryName         = f.Category?.Name ?? string.Empty,
            Name                 = f.Name,
            Description          = f.Description,
            Price                = f.Price,
            DiscountPrice        = f.DiscountPrice,
            ImageUrl             = f.ImageUrl,
            IsVegetarian         = f.IsVegetarian,
            IsVegan              = f.IsVegan,
            IsAvailable          = f.IsAvailable,
            Rating               = f.Rating,
            TotalReviews         = f.TotalReviews,
            PreparationTimeMins  = f.PreparationTimeMins,
            CreatedAt            = f.CreatedAt
        };

        // GET api/fooditems
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<FoodItemDto>>>> GetAll(
            [FromQuery] int? categoryId,
            [FromQuery] bool? isVegetarian,
            [FromQuery] bool? isAvailable)
        {
            var query = _db.FoodItems.Include(f => f.Category).AsQueryable();

            if (categoryId.HasValue)   query = query.Where(f => f.CategoryId == categoryId);
            if (isVegetarian.HasValue) query = query.Where(f => f.IsVegetarian == isVegetarian);
            if (isAvailable.HasValue)  query = query.Where(f => f.IsAvailable == isAvailable);

            var list = await query.OrderBy(f => f.Name).ToListAsync();
            return Ok(ApiResponse<List<FoodItemDto>>.Ok(list.Select(ToDto).ToList()));
        }

        // GET api/fooditems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<FoodItemDto>>> GetById(int id)
        {
            var f = await _db.FoodItems.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id);
            if (f == null) return NotFound(ApiResponse<FoodItemDto>.Fail("Food item not found"));
            return Ok(ApiResponse<FoodItemDto>.Ok(ToDto(f)));
        }

        // POST api/fooditems
        [HttpPost]
        public async Task<ActionResult<ApiResponse<FoodItemDto>>> Create(CreateFoodItemDto dto)
        {
            if (!await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId))
                return BadRequest(ApiResponse<FoodItemDto>.Fail("Category not found"));

            var entity = new FoodItem
            {
                CategoryId          = dto.CategoryId,
                Name                = dto.Name,
                Description         = dto.Description,
                Price               = dto.Price,
                DiscountPrice       = dto.DiscountPrice,
                ImageUrl            = dto.ImageUrl,
                IsVegetarian        = dto.IsVegetarian,
                IsVegan             = dto.IsVegan,
                PreparationTimeMins = dto.PreparationTimeMins,
                IsAvailable         = true,
                CreatedAt           = DateTime.UtcNow,
                UpdatedAt           = DateTime.UtcNow
            };

            _db.FoodItems.Add(entity);
            await _db.SaveChangesAsync();

            await _db.Entry(entity).Reference(e => e.Category).LoadAsync();
            return CreatedAtAction(nameof(GetById), new { id = entity.Id },
                ApiResponse<FoodItemDto>.Ok(ToDto(entity), "Food item created successfully"));
        }

        // PUT api/fooditems/5
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<FoodItemDto>>> Update(int id, UpdateFoodItemDto dto)
        {
            var entity = await _db.FoodItems.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound(ApiResponse<FoodItemDto>.Fail("Food item not found"));

            if (!await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId))
                return BadRequest(ApiResponse<FoodItemDto>.Fail("Category not found"));

            entity.CategoryId          = dto.CategoryId;
            entity.Name                = dto.Name;
            entity.Description         = dto.Description;
            entity.Price               = dto.Price;
            entity.DiscountPrice       = dto.DiscountPrice;
            entity.ImageUrl            = dto.ImageUrl;
            entity.IsVegetarian        = dto.IsVegetarian;
            entity.IsVegan             = dto.IsVegan;
            entity.IsAvailable         = dto.IsAvailable;
            entity.PreparationTimeMins = dto.PreparationTimeMins;
            entity.UpdatedAt           = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            await _db.Entry(entity).Reference(e => e.Category).LoadAsync();
            return Ok(ApiResponse<FoodItemDto>.Ok(ToDto(entity), "Food item updated successfully"));
        }

        // DELETE api/fooditems/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
        {
            var entity = await _db.FoodItems.FindAsync(id);
            if (entity == null) return NotFound(ApiResponse<string>.Fail("Food item not found"));

            _db.FoodItems.Remove(entity);
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok("Deleted", "Food item deleted successfully"));
        }

        // PATCH api/fooditems/5/toggle-availability
        [HttpPatch("{id}/toggle-availability")]
        public async Task<ActionResult<ApiResponse<FoodItemDto>>> ToggleAvailability(int id)
        {
            var entity = await _db.FoodItems.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null) return NotFound(ApiResponse<FoodItemDto>.Fail("Food item not found"));

            entity.IsAvailable = !entity.IsAvailable;
            entity.UpdatedAt   = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<FoodItemDto>.Ok(ToDto(entity), $"Availability set to {entity.IsAvailable}"));
        }
    }
}
