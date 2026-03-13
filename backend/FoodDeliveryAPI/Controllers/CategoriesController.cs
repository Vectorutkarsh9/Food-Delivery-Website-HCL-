using FoodDeliveryAPI.Data;
using FoodDeliveryAPI.DTOs;
using FoodDeliveryAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodDeliveryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CategoriesController(AppDbContext db) => _db = db;

        // GET api/categories
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetAll()
        {
            var list = await _db.Categories
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new CategoryDto
                {
                    Id           = c.Id,
                    Name         = c.Name,
                    Description  = c.Description,
                    ImageUrl     = c.ImageUrl,
                    IsActive     = c.IsActive,
                    DisplayOrder = c.DisplayOrder,
                    CreatedAt    = c.CreatedAt
                }).ToListAsync();

            return Ok(ApiResponse<List<CategoryDto>>.Ok(list));
        }

        // GET api/categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> GetById(int id)
        {
            var c = await _db.Categories.FindAsync(id);
            if (c == null) return NotFound(ApiResponse<CategoryDto>.Fail("Category not found"));

            return Ok(ApiResponse<CategoryDto>.Ok(new CategoryDto
            {
                Id           = c.Id,
                Name         = c.Name,
                Description  = c.Description,
                ImageUrl     = c.ImageUrl,
                IsActive     = c.IsActive,
                DisplayOrder = c.DisplayOrder,
                CreatedAt    = c.CreatedAt
            }));
        }

        // POST api/categories
        [HttpPost]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> Create(CreateCategoryDto dto)
        {
            if (await _db.Categories.AnyAsync(c => c.Name == dto.Name))
                return BadRequest(ApiResponse<CategoryDto>.Fail("Category name already exists"));

            var entity = new Category
            {
                Name         = dto.Name,
                Description  = dto.Description,
                ImageUrl     = dto.ImageUrl,
                DisplayOrder = dto.DisplayOrder,
                CreatedAt    = DateTime.UtcNow,
                UpdatedAt    = DateTime.UtcNow
            };

            _db.Categories.Add(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = entity.Id },
                ApiResponse<CategoryDto>.Ok(new CategoryDto
                {
                    Id           = entity.Id,
                    Name         = entity.Name,
                    Description  = entity.Description,
                    ImageUrl     = entity.ImageUrl,
                    IsActive     = entity.IsActive,
                    DisplayOrder = entity.DisplayOrder,
                    CreatedAt    = entity.CreatedAt
                }, "Category created successfully"));
        }

        // PUT api/categories/5
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> Update(int id, UpdateCategoryDto dto)
        {
            var entity = await _db.Categories.FindAsync(id);
            if (entity == null) return NotFound(ApiResponse<CategoryDto>.Fail("Category not found"));

            entity.Name         = dto.Name;
            entity.Description  = dto.Description;
            entity.ImageUrl     = dto.ImageUrl;
            entity.IsActive     = dto.IsActive;
            entity.DisplayOrder = dto.DisplayOrder;
            entity.UpdatedAt    = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(ApiResponse<CategoryDto>.Ok(new CategoryDto
            {
                Id           = entity.Id,
                Name         = entity.Name,
                Description  = entity.Description,
                ImageUrl     = entity.ImageUrl,
                IsActive     = entity.IsActive,
                DisplayOrder = entity.DisplayOrder,
                CreatedAt    = entity.CreatedAt
            }, "Category updated successfully"));
        }

        // DELETE api/categories/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(int id)
        {
            var entity = await _db.Categories.FindAsync(id);
            if (entity == null) return NotFound(ApiResponse<string>.Fail("Category not found"));

            if (await _db.FoodItems.AnyAsync(f => f.CategoryId == id))
                return BadRequest(ApiResponse<string>.Fail("Cannot delete category with existing food items"));

            _db.Categories.Remove(entity);
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<string>.Ok("Deleted", "Category deleted successfully"));
        }
    }
}
