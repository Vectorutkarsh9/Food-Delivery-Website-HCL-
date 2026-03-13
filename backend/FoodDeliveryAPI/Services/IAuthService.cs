using FoodDeliveryAPI.DTOs.Auth;

namespace FoodDeliveryAPI.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
    }
}
