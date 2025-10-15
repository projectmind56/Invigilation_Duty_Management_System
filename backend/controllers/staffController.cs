using backend.Interfaces;
using backend.Dto;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffInterface _staffInterfaces;

        public StaffController(IStaffInterface staffInterfaces)
        {
            _staffInterfaces = staffInterfaces;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync(RegisterDto registerDto)
        {
            var result = await _staffInterfaces.RegisterAsync(registerDto);
            if (!result)
                return BadRequest(new { message = "Staff with this email already exists." });

            return Ok(new { message = "Registration request submitted successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var token = await _staffInterfaces.LoginAsync(loginDto);
            if (token == null)
                return Unauthorized(new { message = "Invalid email or password." });

            return Ok(new { token }); // or use "message" if you want to customize it
        }
    }
}