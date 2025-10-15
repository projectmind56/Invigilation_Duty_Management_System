using backend.Dto;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IStaffInterface
    {
        Task<bool> RegisterAsync(RegisterDto registerDto);
        Task<string?> LoginAsync(LoginDto loginDto);
    }
}
