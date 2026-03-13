using FoodDeliveryAPI.DTOs.Auth;
using FoodDeliveryAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace FoodDeliveryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;

        public AuthController(IAuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            try
            {
                var res = await _auth.RegisterAsync(req);
                return Ok(res);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            try
            {
                var res = await _auth.LoginAsync(req);
                return Ok(res);
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }
    }
}
